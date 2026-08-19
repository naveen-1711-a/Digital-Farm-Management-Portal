/**
 * agentMemory.js
 * Stores and retrieves past incident outcomes for learning.
 * When a human marks an incident as false positive, the agent remembers
 * and adjusts future risk scores for similar signal patterns.
 */
const AgentMemoryModel = require('../../models/AgentMemory');

/**
 * Store the outcome of a human decision on an investigation case.
 * @param {Object} params
 * @param {string} params.farmId
 * @param {string} params.domain - incident domain
 * @param {Array} params.signalTypes - array of signal type strings
 * @param {string} params.humanDecision - 'confirmed' | 'false_positive' | 'operational_error'
 * @param {string} params.humanReason
 * @param {number} params.riskScore
 * @param {string} params.caseId
 */
async function storeOutcome({ farmId, domain, signalTypes, humanDecision, humanReason, riskScore, caseId }) {
  // Score bias: if human says false positive, future similar cases should get -10
  // If human confirms fraud, future similar cases get +10
  let scoreBias = 0;
  if (humanDecision === 'false_positive') scoreBias = -10;
  else if (humanDecision === 'confirmed') scoreBias = +10;

  await AgentMemoryModel.create({
    farm: farmId,
    incidentType: domain,
    signalFingerprint: signalTypes,
    humanDecision,
    humanReason,
    riskScoreAtDecision: riskScore,
    scoreBias,
    relatedCase: caseId,
  });
}

/**
 * Find similar past outcomes to influence a new case.
 * @param {string} farmId
 * @param {string} domain
 * @param {Array} signalTypes
 * @returns {Array} matching memory records
 */
async function findSimilarOutcomes(farmId, domain, signalTypes) {
  return AgentMemoryModel.find({
    farm: farmId,
    incidentType: domain,
    signalFingerprint: { $in: signalTypes },
  }).sort({ createdAt: -1 }).limit(10).lean();
}

/**
 * Update match count when a memory record is used.
 */
async function recordMemoryHit(memoryId) {
  await AgentMemoryModel.findByIdAndUpdate(memoryId, { $inc: { matchCount: 1 } });
}

/**
 * Get memory stats for a farm.
 */
async function getMemoryStats(farmId) {
  const total = await AgentMemoryModel.countDocuments({ farm: farmId });
  const falsePositives = await AgentMemoryModel.countDocuments({ farm: farmId, humanDecision: 'false_positive' });
  const confirmed = await AgentMemoryModel.countDocuments({ farm: farmId, humanDecision: 'confirmed' });

  return { total, falsePositives, confirmed, accuracy: total > 0 ? ((confirmed / total) * 100).toFixed(1) : 0 };
}

module.exports = { storeOutcome, findSimilarOutcomes, recordMemoryHit, getMemoryStats };
