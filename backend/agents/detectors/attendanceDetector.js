/**
 * attendanceDetector.js
 * Detects suspicious attendance events.
 * Checks: duplicate check-ins, impossible hours, suspicious exact-time patterns.
 */
const Attendance = require('../../models/Attendance');

const MAX_SHIFT_HOURS = 16;

function parseHour(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m || 0) / 60;
}

async function detect(payload) {
  const { record, farmId, userId } = payload;

  if (!record || !farmId) return { isAnomaly: false };

  const signals = [];
  const todayStart = new Date(record.date);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  // ── 1. DUPLICATE CHECK-IN ────────────────────────────────────────────────
  const existingToday = await Attendance.countDocuments({
    farm: farmId,
    worker: record.worker,
    date: { $gte: todayStart, $lt: todayEnd },
    _id: { $ne: record._id },
  });

  if (existingToday >= 1) {
    signals.push({
      type: 'duplicate_entry',
      description: `Worker already has ${existingToday} attendance record(s) today. Possible duplicate check-in.`,
      value: existingToday + 1,
      expected: 1,
    });
  }

  // ── 2. IMPOSSIBLE HOURS (shift > MAX_SHIFT_HOURS) ────────────────────────
  if (record.checkIn && record.checkOut) {
    const inHour = parseHour(record.checkIn);
    const outHour = parseHour(record.checkOut);
    let diff = outHour - inHour;
    if (diff < 0) diff += 24; // overnight shift

    if (diff > MAX_SHIFT_HOURS) {
      signals.push({
        type: 'impossible_hours',
        description: `Shift duration of ${diff.toFixed(1)}h exceeds maximum allowed (${MAX_SHIFT_HOURS}h). Check-in: ${record.checkIn}, Check-out: ${record.checkOut}`,
        value: diff,
        expected: `≤ ${MAX_SHIFT_HOURS}h`,
      });
    }
  }

  // ── 3. SUSPICIOUS EXACT-TIME PATTERN (always exactly 08:00) ──────────────
  if (record.checkIn) {
    const recentRecords = await Attendance.find({
      farm: farmId,
      worker: record.worker,
      checkIn: record.checkIn, // exact same time string
      date: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }, // last 14 days
    }).lean();

    if (recentRecords.length >= 5) {
      signals.push({
        type: 'suspicious_edit_pattern',
        description: `Worker checked in at exactly ${record.checkIn} on ${recentRecords.length} of the last 14 days — possible automated/fake attendance`,
        value: recentRecords.length,
        expected: '< 5 identical times',
      });
    }
  }

  // ── 4. AFTER-HOURS MARK (attendance marked in middle of night) ───────────
  const now = new Date();
  const markHour = now.getHours();
  if (markHour >= 23 || markHour < 4) {
    signals.push({
      type: 'after_hours_entry',
      description: `Attendance record created at ${markHour}:${String(now.getMinutes()).padStart(2, '0')} — unusual late-night marking`,
      value: markHour,
      expected: '4-23',
    });
  }

  const isAnomaly = signals.length > 0;

  return {
    isAnomaly,
    detectorName: 'attendanceDetector',
    sourceModel: 'Attendance',
    sourceId: record._id,
    description: isAnomaly
      ? `Attendance anomaly: ${signals.map(s => s.type).join(', ')}`
      : 'Normal attendance',
    signals,
  };
}

module.exports = { detect };
