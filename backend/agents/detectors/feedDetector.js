/**
 * feedDetector.js
 * Detects suspicious feed inventory events.
 * Checks: quantity anomaly vs animal population, duplicate entries, abnormal consumption.
 */
const FeedInventory = require('../../models/FeedInventory');
const Animal = require('../../models/Animal');

const LOOKBACK_DAYS = 30;
const IQR_MULTIPLIER = 2.0;

async function detect(payload) {
  const { record, farmId, userId, previousQuantity } = payload;

  if (!record || !farmId) return { isAnomaly: false };

  const signals = [];
  const now = new Date();
  const lookbackDate = new Date(now);
  lookbackDate.setDate(lookbackDate.getDate() - LOOKBACK_DAYS);

  // ── 1. IQR-BASED QUANTITY ANOMALY ────────────────────────────────────────
  const historical = await FeedInventory.find({
    farm: farmId,
    updatedAt: { $gte: lookbackDate },
    _id: { $ne: record._id },
    isActive: true,
  }).select('quantity').lean();

  if (historical.length >= 5) {
    const quantities = historical.map(r => r.quantity).filter(q => q > 0).sort((a, b) => a - b);
    const q1 = quantities[Math.floor(quantities.length * 0.25)];
    const q3 = quantities[Math.floor(quantities.length * 0.75)];
    const iqr = q3 - q1;
    const upperFence = q3 + IQR_MULTIPLIER * iqr;

    const currentQty = record.quantity || 0;
    if (currentQty > upperFence && currentQty > q3 * 2) {
      signals.push({
        type: 'quantity_anomaly',
        description: `Feed quantity ${currentQty} ${record.unit || 'kg'} far exceeds IQR upper fence (${upperFence.toFixed(0)} ${record.unit || 'kg'})`,
        value: currentQty,
        expected: upperFence,
      });
    }
  }

  // ── 2. ABNORMAL CONSUMPTION vs ANIMAL POPULATION ─────────────────────────
  const activeAnimals = await Animal.countDocuments({ farm: farmId, isActive: true });
  if (activeAnimals > 0 && record.quantity > 0) {
    const kgPerAnimal = record.quantity / activeAnimals;
    // Alert if >5kg per animal per day (typical max for poultry/pig farms)
    if (kgPerAnimal > 5) {
      signals.push({
        type: 'quantity_anomaly',
        description: `Feed consumption of ${record.quantity} kg for ${activeAnimals} animals = ${kgPerAnimal.toFixed(1)} kg/animal (expected ≤ 5 kg/animal)`,
        value: kgPerAnimal,
        expected: '≤ 5 kg/animal',
      });
    }
  }

  // ── 3. AFTER-HOURS ENTRY ─────────────────────────────────────────────────
  const hour = now.getHours();
  if (hour >= 22 || hour < 5) {
    signals.push({
      type: 'after_hours_entry',
      description: `Feed record entered at unusual hour: ${hour}:${String(now.getMinutes()).padStart(2, '0')}`,
      value: hour,
      expected: '5-22',
    });
  }

  // ── 4. DUPLICATE DETECTION (same name + quantity within same day) ─────────
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const duplicate = await FeedInventory.findOne({
    farm: farmId,
    name: record.name,
    quantity: record.quantity,
    createdAt: { $gte: todayStart },
    _id: { $ne: record._id },
  }).lean();

  if (duplicate) {
    signals.push({
      type: 'duplicate_entry',
      description: `Duplicate feed entry: same name "${record.name}" and quantity ${record.quantity} already recorded today`,
      value: record.quantity,
      expected: 'unique entry',
    });
  }

  const isAnomaly = signals.length > 0;

  return {
    isAnomaly,
    detectorName: 'feedDetector',
    sourceModel: 'FeedInventory',
    sourceId: record._id,
    description: isAnomaly
      ? `Feed anomaly: ${signals.map(s => s.type).join(', ')}`
      : 'Normal feed activity',
    signals,
  };
}

module.exports = { detect };
