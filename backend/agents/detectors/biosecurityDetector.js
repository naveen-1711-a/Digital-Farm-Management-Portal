/**
 * biosecurityDetector.js
 * Detects biosecurity violations from visitor registration events.
 * Checks: missing PPE, no disinfection record, no footbath, frequent visitor.
 */
const Visitor = require('../../models/Visitor');

async function detect(payload) {
  const { record, farmId, userId, biosecurityChecklist } = payload;

  if (!record || !farmId) return { isAnomaly: false };

  const signals = [];

  // ── 1. MISSING BIOSECURITY CHECKLIST ITEMS ───────────────────────────────
  if (biosecurityChecklist) {
    if (biosecurityChecklist.ppeWorn === false) {
      signals.push({
        type: 'missing_ppe',
        description: `Visitor "${record.visitorName}" entered without PPE recorded`,
        value: false,
        expected: true,
      });
    }
    if (biosecurityChecklist.footbathUsed === false) {
      signals.push({
        type: 'missing_ppe',
        description: `Visitor "${record.visitorName}" did not use footbath`,
        value: false,
        expected: true,
      });
    }
    if (biosecurityChecklist.disinfected === false) {
      signals.push({
        type: 'missing_ppe',
        description: `Vehicle/equipment disinfection not recorded for visitor "${record.visitorName}"`,
        value: false,
        expected: true,
      });
    }
  }

  // ── 2. VISITOR WITH NO APPROVAL ──────────────────────────────────────────
  if (!record.approvedBy) {
    signals.push({
      type: 'missing_cross_record',
      description: `Visitor "${record.visitorName}" entered farm with no approving manager recorded`,
      value: null,
      expected: 'approvedBy reference',
    });
  }

  // ── 3. FREQUENT VISITOR PATTERN (>3 visits in 7 days — possible insider) ─
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentVisits = await Visitor.countDocuments({
    farm: farmId,
    visitorName: record.visitorName,
    checkInTime: { $gte: sevenDaysAgo },
    _id: { $ne: record._id },
  });

  if (recentVisits >= 3) {
    signals.push({
      type: 'suspicious_edit_pattern',
      description: `Visitor "${record.visitorName}" has ${recentVisits + 1} visits in the last 7 days — unusually frequent`,
      value: recentVisits + 1,
      expected: '< 3 visits/week',
    });
  }

  // ── 4. AFTER-HOURS VISITOR ───────────────────────────────────────────────
  const visitHour = new Date(record.checkInTime || Date.now()).getHours();
  if (visitHour >= 20 || visitHour < 6) {
    signals.push({
      type: 'after_hours_entry',
      description: `Visitor "${record.visitorName}" entered farm at ${visitHour}:00 — outside normal operating hours`,
      value: visitHour,
      expected: '6-20',
    });
  }

  const isAnomaly = signals.length > 0;

  return {
    isAnomaly,
    detectorName: 'biosecurityDetector',
    sourceModel: 'Visitor',
    sourceId: record._id,
    description: isAnomaly
      ? `Biosecurity anomaly: ${signals.map(s => s.type).join(', ')}`
      : 'Normal biosecurity',
    signals,
  };
}

module.exports = { detect };
