/**
 * ruleEngine.js
 * Deterministic rules that map signal types to risk points.
 * This is the foundation of the risk score — predictable, auditable, explainable.
 */

const SIGNAL_POINTS = {
  quantity_anomaly: 20,
  no_prescription: 25,
  no_disease_increase: 15,
  record_modified: 15,
  after_hours_entry: 10,
  large_quantity_change: 10,
  previous_anomalies: 10,
  behavior_deviation: 10,
  stock_mismatch: 15,
  missing_cross_record: 20,
  ml_isolation_forest: 15,
  duplicate_entry: 12,
  impossible_hours: 18,
  missing_ppe: 14,
  no_vaccine_stock_deducted: 22,
  suspicious_edit_pattern: 16,
  mortality_spike: 25,
  impossible_weight: 18,
};

/**
 * Calculate rule-based risk points from signal array.
 * @param {Array} signals - Array of signal objects with .type field
 * @returns {{ totalPoints, breakdown }}
 */
function calculateRulePoints(signals) {
  const breakdown = [];
  let totalPoints = 0;

  for (const signal of signals) {
    const points = SIGNAL_POINTS[signal.type] || 5;
    totalPoints += points;
    breakdown.push({
      signalType: signal.type,
      description: signal.description,
      points,
    });
  }

  return { totalPoints, breakdown };
}

/**
 * Severity classification based on final score.
 */
function classifySeverity(score) {
  if (score >= 85) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  if (score >= 30) return 'Low';
  return 'Normal';
}

/**
 * Recommended action based on severity.
 */
function recommendAction(severity) {
  switch (severity) {
    case 'Critical': return 'FREEZE_AND_ESCALATE';
    case 'High': return 'ADMIN_REVIEW';
    case 'Medium': return 'MANAGER_REVIEW';
    case 'Low': return 'MONITOR';
    default: return 'STORE_ONLY';
  }
}

module.exports = {
  calculateRulePoints,
  classifySeverity,
  recommendAction,
  SIGNAL_POINTS,
};
