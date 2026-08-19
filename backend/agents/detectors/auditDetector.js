/**
 * auditDetector.js
 * Detects suspicious audit log patterns.
 * Checks: repeated edits to same record, mass deletions, after-hours modifications.
 */

const SUSPICIOUS_EDIT_COUNT = 5; // more than 5 edits to same record = suspicious
const MASS_CHANGE_THRESHOLD = 20; // more than 20 changes in 1 hour = suspicious

async function detect(payload) {
  const { record, farmId, userId, recentEditCount, isMassChange } = payload;

  if (!record || !farmId) return { isAnomaly: false };

  const signals = [];
  const hour = new Date().getHours();

  // ── 1. REPEATED EDITS TO SAME RECORD ────────────────────────────────────
  if (recentEditCount !== undefined && recentEditCount >= SUSPICIOUS_EDIT_COUNT) {
    signals.push({
      type: 'suspicious_edit_pattern',
      description: `Same record has been modified ${recentEditCount} times — possible data tampering or confusion`,
      value: recentEditCount,
      expected: `< ${SUSPICIOUS_EDIT_COUNT}`,
    });
  }

  // ── 2. AFTER-HOURS RECORD MODIFICATION ───────────────────────────────────
  if (hour >= 22 || hour < 5) {
    signals.push({
      type: 'after_hours_entry',
      description: `Critical record modified at ${hour}:${String(new Date().getMinutes()).padStart(2, '0')} — outside operational hours`,
      value: hour,
      expected: '5-22',
    });
  }

  // ── 3. DELETION OF RECORD (high risk) ───────────────────────────────────
  if (record.action === 'DELETE' || record.operationType === 'delete') {
    signals.push({
      type: 'suspicious_edit_pattern',
      description: `Record deletion detected on model "${record.targetModel || 'unknown'}" — deletions may destroy audit evidence`,
      value: 'DELETE operation',
      expected: 'no deletions',
    });
  }

  // ── 4. MASS CHANGES IN SHORT PERIOD ──────────────────────────────────────
  if (isMassChange || (record.changesInLastHour && record.changesInLastHour >= MASS_CHANGE_THRESHOLD)) {
    signals.push({
      type: 'suspicious_edit_pattern',
      description: `${record.changesInLastHour || 'Multiple'} changes detected in the last hour — mass modification pattern`,
      value: record.changesInLastHour,
      expected: `< ${MASS_CHANGE_THRESHOLD}`,
    });
  }

  const isAnomaly = signals.length > 0;

  return {
    isAnomaly,
    detectorName: 'auditDetector',
    sourceModel: 'AuditLog',
    sourceId: record._id,
    description: isAnomaly
      ? `Audit anomaly: ${signals.map(s => s.type).join(', ')}`
      : 'Normal audit event',
    signals,
  };
}

module.exports = { detect };
