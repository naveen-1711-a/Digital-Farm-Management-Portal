/**
 * groqReasoningEngine.js
 * Groq API integration for the FarmGuard AI reasoning layer.
 * 
 * Groq's role: reasoning, explanation, tool selection, report generation.
 * Groq does NOT directly modify databases or take high-impact actions.
 * Your backend policy engine controls what actions are actually executed.
 */
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// System prompt for the Farm Integrity investigator
const FARM_GUARD_SYSTEM_PROMPT = `You are FarmGuard AI, an autonomous farm operations intelligence agent.
Your role is to analyze farm data, investigate anomalies, and provide structured reasoning to help farm managers make decisions.

IMPORTANT RULES:
1. You NEVER directly accuse workers of fraud. You say "suspicious activity detected" or "anomaly found."
2. You always provide evidence-based reasoning — no speculation without data.
3. Your output is always structured JSON for the policy engine to parse.
4. You recommend actions but humans make final decisions on Level 2 and Level 3 actions.
5. You are precise, professional, and compassionate — farm operations affect real livelihoods.

OUTPUT FORMAT (always return valid JSON):
{
  "summary": "Brief human-readable summary",
  "reasoning": "Step-by-step reasoning chain",
  "keyFindings": ["finding1", "finding2"],
  "riskAssessment": "Normal|Low|Medium|High|Critical",
  "possibleCauses": ["cause1", "cause2"],
  "recommendedActions": [
    {"level": 1|2|3, "action": "action_type", "reason": "why"}
  ],
  "requiresHumanReview": true|false,
  "confidence": 0.0-1.0
}`;


/**
 * Analyze a farm event using Groq LLM reasoning.
 * @param {Object} context - structured farm evidence for analysis
 * @returns {Object} Groq reasoning result
 */
async function analyzeEvent(context) {
  if (!GROQ_API_KEY) {
    console.warn('[GroqReasoning] GROQ_API_KEY not set — returning fallback reasoning');
    return generateFallbackReasoning(context);
  }

  const userMessage = buildAnalysisPrompt(context);

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: FARM_GUARD_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3, // Low temperature for consistent, factual output
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq');

    const parsed = JSON.parse(content);
    return { ...parsed, model: GROQ_MODEL, source: 'groq' };

  } catch (err) {
    console.error('[GroqReasoning] API error:', err.message);
    return generateFallbackReasoning(context);
  }
}

/**
 * Generate autonomous investigation report using Groq.
 * Called when risk >= 70 to produce a human-readable incident report.
 */
async function generateIncidentReport({ incidentId, domain, evidence, crossModuleFindings, riskScore, farmStats }) {
  if (!GROQ_API_KEY) return null;

  const prompt = `Generate a professional farm integrity incident report for the following case:

Incident ID: ${incidentId}
Domain: ${domain}
Risk Score: ${riskScore}/100
Farm Statistics: ${JSON.stringify(farmStats, null, 2)}

Evidence collected:
${evidence.map((e, i) => `${i + 1}. ${e.description} (+${e.points} risk points)`).join('\n')}

Cross-module analysis:
${crossModuleFindings.map(f => `- [${f.module}] ${f.finding} (${f.supports})`).join('\n')}

Write a concise investigation report in 3-4 sentences explaining what was found and why it requires review. Do NOT accuse any individual. Use professional language.`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a professional farm operations analyst writing investigation reports.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 256,
      },
      { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 8000 }
    );

    return response.data.choices[0]?.message?.content || null;
  } catch (err) {
    console.error('[GroqReasoning] Report generation error:', err.message);
    return null;
  }
}

/**
 * Build the analysis prompt from structured farm context.
 */
function buildAnalysisPrompt(context) {
  return `Analyze this farm event:

EVENT TYPE: ${context.eventType || 'Unknown'}
DOMAIN: ${context.domain || 'General'}
FARM: ${context.farmId}

DETECTED SIGNALS:
${(context.signals || []).map(s => `- ${s.type}: ${s.description} (value: ${s.value}, expected: ${s.expected})`).join('\n') || 'None'}

SENSOR DATA:
${JSON.stringify(context.sensorData || {}, null, 2)}

ANIMAL HEALTH STATUS:
${JSON.stringify(context.animalHealth || {}, null, 2)}

ENVIRONMENTAL DATA:
- Temperature: ${context.temperature || 'N/A'}
- Humidity: ${context.humidity || 'N/A'}

HISTORICAL PATTERN:
${context.historicalContext || 'No historical context available'}

WORKER BEHAVIOR:
${context.workerContext || 'No worker context available'}

Based on ALL evidence above, provide your structured JSON analysis.`;
}

/**
 * Fallback reasoning when Groq API is unavailable.
 * Uses deterministic rule-based summary instead of LLM.
 */
function generateFallbackReasoning(context) {
  const signalCount = (context.signals || []).length;
  const riskScore = context.riskScore || 0;

  const severity = riskScore >= 85 ? 'Critical'
    : riskScore >= 70 ? 'High'
    : riskScore >= 50 ? 'Medium'
    : riskScore >= 30 ? 'Low' : 'Normal';

  return {
    summary: `${signalCount} anomaly signal(s) detected in ${context.domain || 'farm'} operations. Risk level: ${severity}.`,
    reasoning: `Rule-based analysis identified ${signalCount} signals contributing to a risk score of ${riskScore}/100. Full LLM reasoning unavailable (Groq API not configured).`,
    keyFindings: (context.signals || []).map(s => s.description).slice(0, 4),
    riskAssessment: severity,
    possibleCauses: ['Data entry error', 'Operational change', 'Suspicious activity — requires investigation'],
    recommendedActions: [
      { level: riskScore >= 70 ? 3 : riskScore >= 50 ? 2 : 1, action: 'review_required', reason: 'Anomaly threshold exceeded' }
    ],
    requiresHumanReview: riskScore >= 50,
    confidence: Math.min(0.9, signalCount * 0.15),
    model: 'fallback_rules',
    source: 'deterministic',
  };
}

module.exports = { analyzeEvent, generateIncidentReport, generateFallbackReasoning };
