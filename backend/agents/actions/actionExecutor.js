/**
 * actionExecutor.js
 * Policy-based action dispatcher.
 * Determines what actions to take based on risk score and severity.
 * Records every action in AgentAction for full auditability.
 *
 * Policy:
 *  0–29  (Normal)   → STORE_ANOMALY only
 *  30–49 (Low)      → CREATE_MONITORING_TASK
 *  50–69 (Medium)   → NOTIFY_MANAGER + CREATE_MONITORING_TASK
 *  70–84 (High)     → NOTIFY_MANAGER + NOTIFY_ADMIN + CREATE_INVESTIGATION_TASK
 *  85–100 (Critical)→ All above + FREEZE_RECORD + ESCALATE
 *
 * IMPORTANT: The agent never accuses individuals.
 * It marks records as "Suspicious activity detected" and routes to humans.
 */
const AgentAction = require('../../models/AgentAction');
const InvestigationCase = require('../../models/InvestigationCase');
const { notifyManager, notifyAdmin } = require('./notificationAction');
const { createMonitoringTask, createInvestigationTask } = require('./taskAction');

async function logAction({ caseDoc, farmId, actionType, payload, score, success = true, errorMessage }) {
  return AgentAction.create({
    case: caseDoc?._id,
    anomalyEvent: caseDoc?.anomalyEvent,
    farm: farmId,
    actionType,
    payload,
    triggeredByScore: score,
    success,
    errorMessage,
  });
}

/**
 * Main action execution function.
 */
async function execute({ farmId, domain, anomalyEvent, detectionResult, investigation, riskResult }) {
  const { score, severity, recommendedAction, caseId, caseIncidentId, breakdown } = riskResult;

  // Get the newly created case
  const caseDoc = await InvestigationCase.findById(caseId).lean();

  const incidentId = caseIncidentId || `${domain.substring(0, 3).toUpperCase()}-UNKNOWN`;
  const description = detectionResult.description || 'Anomaly detected';
  const actions = [];

  // ── ALWAYS: Store anomaly ────────────────────────────────────────────────
  await logAction({ caseDoc, farmId, actionType: 'STORE_ANOMALY', payload: { score, severity, incidentId }, score });
  actions.push('STORE_ANOMALY');

  if (score < 30) {
    console.log(`  📝 [ActionExecutor] Score ${score} — Stored anomaly only`);
    return actions;
  }

  // ── LOW (30–49): Monitoring task ─────────────────────────────────────────
  if (score >= 30) {
    try {
      const task = await createMonitoringTask({ farmId, incidentId, domain, riskScore: score, description });
      await logAction({ caseDoc, farmId, actionType: 'CREATE_MONITORING_TASK', payload: { taskId: task._id, incidentId }, score });
      actions.push('CREATE_MONITORING_TASK');
    } catch (e) {
      await logAction({ caseDoc, farmId, actionType: 'CREATE_MONITORING_TASK', score, success: false, errorMessage: e.message });
    }
  }

  // ── MEDIUM (50–69): Notify Manager ───────────────────────────────────────
  if (score >= 50) {
    try {
      const result = await notifyManager({ farmId, incidentId, domain, riskScore: score, severity, description });
      await logAction({ caseDoc, farmId, actionType: 'NOTIFY_MANAGER', payload: { ...result, incidentId }, score });
      actions.push('NOTIFY_MANAGER');
    } catch (e) {
      await logAction({ caseDoc, farmId, actionType: 'NOTIFY_MANAGER', score, success: false, errorMessage: e.message });
    }

    // Update case status
    await InvestigationCase.findByIdAndUpdate(caseId, { status: 'pending_review', humanDecision: 'pending' });
  }

  // ── HIGH (70–84): Notify Admin + Investigation Task ───────────────────────
  if (score >= 70) {
    try {
      const result = await notifyAdmin({ farmId, incidentId, domain, riskScore: score, severity, description });
      await logAction({ caseDoc, farmId, actionType: 'NOTIFY_ADMIN', payload: { ...result, incidentId }, score });
      actions.push('NOTIFY_ADMIN');
    } catch (e) {
      await logAction({ caseDoc, farmId, actionType: 'NOTIFY_ADMIN', score, success: false, errorMessage: e.message });
    }

    try {
      const task = await createInvestigationTask({ farmId, incidentId, domain, riskScore: score, description });
      await logAction({ caseDoc, farmId, actionType: 'CREATE_INVESTIGATION', payload: { taskId: task._id }, score });
      actions.push('CREATE_INVESTIGATION');
    } catch (e) {
      await logAction({ caseDoc, farmId, actionType: 'CREATE_INVESTIGATION', score, success: false, errorMessage: e.message });
    }
  }

  // ── CRITICAL (85+): Freeze + Escalate ───────────────────────────────────
  if (score >= 85) {
    // Flag the investigation case as frozen
    await InvestigationCase.findByIdAndUpdate(caseId, {
      isFrozen: true,
      status: 'under_investigation',
    });

    await logAction({
      caseDoc, farmId, actionType: 'FREEZE_RECORD',
      payload: { incidentId, reason: 'Score >= 85 — critical integrity risk' },
      score,
    });
    actions.push('FREEZE_RECORD');

    await logAction({
      caseDoc, farmId, actionType: 'ESCALATE',
      payload: { incidentId, severity, score },
      score,
    });
    actions.push('ESCALATE');

    console.log(`  🚨 [ActionExecutor] CRITICAL ALERT! Score ${score} — ${incidentId} frozen and escalated`);
  }

  console.log(`  ✅ [ActionExecutor] Actions taken: ${actions.join(', ')}`);
  return actions;
}

module.exports = { execute };
