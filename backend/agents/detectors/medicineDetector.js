/**
 * medicineDetector.js
 * Detects suspicious medicine usage events.
 * Checks: quantity anomaly, after-hours entry, post-creation edits.
 */
const MedicineInventory = require('../../models/MedicineInventory');

const AFTER_HOURS_START = 22; // 10 PM
const AFTER_HOURS_END = 5;   // 5 AM
const ANOMALY_MULTIPLIER = 2.5; // flag if > 2.5x the 30-day average
const LOOKBACK_DAYS = 30;

async function detect(payload) {
  const { record, farmId, userId, previousQuantity } = payload;

  if (!record || !farmId) {
    return { isAnomaly: false };
  }

  const signals = [];
  const now = new Date();
  const currentHour = now.getHours();

  // ── 1. QUANTITY ANOMALY ──────────────────────────────────────────────────
  const lookbackDate = new Date(now);
  lookbackDate.setDate(lookbackDate.getDate() - LOOKBACK_DAYS);

  // Get historical quantity changes for this farm
  const historicalRecords = await MedicineInventory.find({
    farm: farmId,
    updatedAt: { $gte: lookbackDate },
    _id: { $ne: record._id },
  }).select('quantityUnits updatedAt').lean();

  let avgQuantity = 0;
  let stdDev = 0;

  if (historicalRecords.length >= 3) {
    const quantities = historicalRecords.map(r => r.quantityUnits).filter(q => q > 0);
    avgQuantity = quantities.reduce((a, b) => a + b, 0) / quantities.length;

    const variance = quantities.reduce((sum, q) => sum + Math.pow(q - avgQuantity, 2), 0) / quantities.length;
    stdDev = Math.sqrt(variance);

    const currentQty = record.quantityUnits || 0;
    const zScore = stdDev > 0 ? (currentQty - avgQuantity) / stdDev : 0;

    if (zScore > 3 || currentQty > avgQuantity * ANOMALY_MULTIPLIER) {
      signals.push({
        type: 'quantity_anomaly',
        description: `Medicine quantity ${currentQty} is ${(currentQty / avgQuantity).toFixed(1)}x the 30-day average (${avgQuantity.toFixed(0)})`,
        value: currentQty,
        expected: avgQuantity,
      });
    }
  }

  // ── 2. AFTER-HOURS ENTRY ─────────────────────────────────────────────────
  if (currentHour >= AFTER_HOURS_START || currentHour < AFTER_HOURS_END) {
    signals.push({
      type: 'after_hours_entry',
      description: `Medicine record created/updated at unusual hour: ${currentHour}:${String(now.getMinutes()).padStart(2, '0')}`,
      value: currentHour,
      expected: '6-21',
    });
  }

  // ── 3. QUANTITY INCREASED AFTER CREATION (suspicious edit) ──────────────
  if (previousQuantity !== undefined && record.quantityUnits > previousQuantity * 2) {
    signals.push({
      type: 'record_modified',
      description: `Quantity increased from ${previousQuantity} to ${record.quantityUnits} after creation (${((record.quantityUnits / previousQuantity) * 100 - 100).toFixed(0)}% increase)`,
      value: record.quantityUnits,
      expected: previousQuantity,
    });
  }

  const isAnomaly = signals.length > 0;

  return {
    isAnomaly,
    detectorName: 'medicineDetector',
    sourceModel: 'MedicineInventory',
    sourceId: record._id,
    description: isAnomaly
      ? `Medicine anomaly detected: ${signals.map(s => s.type).join(', ')}`
      : 'Normal medicine activity',
    signals,
    metadata: { avgQuantity, stdDev, currentQuantity: record.quantityUnits },
  };
}

module.exports = { detect };
