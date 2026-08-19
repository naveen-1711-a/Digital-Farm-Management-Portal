/**
 * riskEngine.js
 * Aggregates rule-based signals + ML anomaly score into a final 0–100 risk score.
 * Creates the InvestigationCase and RiskSignal documents.
 */
const axios = require('axios');
const { calculateRulePoints, classifySeverity, recommendAction } = require('./ruleEngine');
const InvestigationCase = require('../../models/InvestigationCase');
const RiskSignal = require('../../models/RiskSignal');
const AgentMemory = require('../../models/AgentMemory');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const ML_WEIGHT = 0.25; // ML score contributes 25% to final score
const RULE_WEIGHT = 0.75; // Rule score contributes 75%
const MAX_RULE_SCORE = 100;

/**
 * Get ML anomaly score from Python FastAPI service.
 * Falls back gracefully if ML service is unavailable.
 */
async function getMLScore(domain, features) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/detect-anomaly`, {
      domain,
      features,
    }, { timeout: 3000 });

    return response.data.anomalyScore || 0; // 0–100 scale
  } catch {
    // ML service unavailable — degrade gracefully
    return null;
  }
}

/**
 * Retrieve memory bias for similar past incidents.
 */
async function getMemoryBias(farmId, domain, signalTypes) {
  try {
    const memories = await AgentMemory.find({
      farm: farmId,
      incidentType: domain,
      signalFingerprint: { $in: signalTypes },
    }).lean();

    if (memories.length === 0) return 0;

    // Average of biases from similar past incidents
    const avgBias = memories.reduce((sum, m) => sum + (m.scoreBias || 0), 0) / memories.length;
    return Math.max(-20, Math.min(20, avgBias)); // Cap at ±20 points
  } catch {
    return 0;
  }
}

/**
 * Main scoring function.
 * @returns {{ score, severity, recommendedAction, caseId, breakdown }}
 */
async function score({ domain, farmId, signals, crossModuleFindings, workerId, confidence }) {
  const allSignals = signals || [];
  const signalTypes = allSignals.map(s => s.type);

  // ── Rule-based score ────────────────────────────────────────────────────
  const { totalPoints: rulePoints, breakdown } = calculateRulePoints(allSignals);
  const normalizedRuleScore = Math.min(100, rulePoints);

  // ── Cross-module bonus ───────────────────────────────────────────────────
  const suspiciousFindings = (crossModuleFindings || []).filter(f => f.supports === 'suspicious').length;
  const legitimateFindings = (crossModuleFindings || []).filter(f => f.supports === 'legitimate').length;
  const crossBonus = (suspiciousFindings * 5) - (legitimateFindings * 5);

  // ── ML score ─────────────────────────────────────────────────────────────
  const mlFeatures = {
    signalCount: allSignals.length,
    suspiciousFindingCount: suspiciousFindings,
    ruleScore: normalizedRuleScore,
  };

  const mlRaw = await getMLScore(domain, mlFeatures);
  const mlScore = mlRaw !== null ? mlRaw : null;

  // ── Memory bias ───────────────────────────────────────────────────────────
  const memoryBias = await getMemoryBias(farmId, domain, signalTypes);

  // ── Final score calculation ───────────────────────────────────────────────
  let finalScore;
  if (mlScore !== null) {
    finalScore = (normalizedRuleScore * RULE_WEIGHT) + (mlScore * ML_WEIGHT) + crossBonus + memoryBias;
  } else {
    finalScore = normalizedRuleScore + crossBonus + memoryBias;
  }
  finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

  const severity = classifySeverity(finalScore);
  const action = recommendAction(severity);

  // ── Create InvestigationCase ─────────────────────────────────────────────
  const investigationCase = await InvestigationCase.create({
    farm: farmId,
    domain,
    riskScore: finalScore,
    mlAnomalyScore: mlScore,
    severity,
    classification: finalScore >= 50 ? 'Suspicious' : 'Unclassified',
    confidence: confidence || 0,
    evidence: allSignals.map(s => ({
      type: s.type,
      description: s.description,
      points: s.points || 0,
    })),
    crossModuleFindings: crossModuleFindings || [],
    recommendedAction: action,
    status: finalScore >= 50 ? 'open' : 'dismissed',
  });

  // ── Persist RiskSignals ─────────────────────────────────────────────────
  if (allSignals.length > 0) {
    const signalDocs = breakdown.map(b => ({
      case: investigationCase._id,
      farm: farmId,
      signalType: b.signalType,
      description: b.description,
      points: b.points,
      source: domain,
    }));

    await RiskSignal.insertMany(signalDocs);
  }

  return {
    score: finalScore,
    severity,
    recommendedAction: action,
    caseId: investigationCase._id,
    caseIncidentId: investigationCase.incidentId,
    breakdown,
    mlScore,
    memoryBias,
    crossBonus,
  };
}

module.exports = { score };
