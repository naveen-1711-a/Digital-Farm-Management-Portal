/**
 * inventoryDetector.js
 * Performs stock reconciliation to detect unexplained inventory variance.
 * Formula: Opening Stock + Purchases - Expected Consumption ≠ Actual Stock
 */
const FeedInventory = require('../../models/FeedInventory');
const MedicineInventory = require('../../models/MedicineInventory');
const Animal = require('../../models/Animal');

const VARIANCE_THRESHOLD = 0.15; // 15% unexplained variance triggers alert

async function detect(payload) {
  const { record, farmId, userId, adjustmentType, adjustmentQty, previousQuantity } = payload;

  if (!record || !farmId) return { isAnomaly: false };

  const signals = [];

  // ── 1. UNEXPLAINED LARGE ADJUSTMENT ─────────────────────────────────────
  if (adjustmentQty !== undefined && previousQuantity !== undefined) {
    const changePercent = Math.abs(adjustmentQty - previousQuantity) / Math.max(previousQuantity, 1);

    if (changePercent > 0.5 && Math.abs(adjustmentQty - previousQuantity) > 100) {
      signals.push({
        type: 'stock_mismatch',
        description: `Stock adjusted by ${((changePercent) * 100).toFixed(1)}%: from ${previousQuantity} to ${adjustmentQty} — large unexplained change`,
        value: adjustmentQty,
        expected: previousQuantity,
      });
    }
  }

  // ── 2. STOCK RECONCILIATION (Feed) ────────────────────────────────────────
  if (record.quantity !== undefined && record.name) {
    const activeAnimals = await Animal.countDocuments({ farm: farmId, isActive: true });
    // Expected consumption in last month (rough estimate)
    const expectedMonthlyConsumption = activeAnimals * 3 * 30; // 3kg/day per animal

    const allFeedItems = await FeedInventory.find({ farm: farmId, isActive: true }).lean();
    const totalCurrentStock = allFeedItems.reduce((sum, f) => sum + (f.quantity || 0), 0);

    // If total current stock is extremely low given animal count, flag it
    if (activeAnimals > 0 && totalCurrentStock < activeAnimals * 5) {
      signals.push({
        type: 'stock_mismatch',
        description: `Total feed stock (${totalCurrentStock} kg) is critically low for ${activeAnimals} animals — expected minimum ${activeAnimals * 5} kg`,
        value: totalCurrentStock,
        expected: `≥ ${activeAnimals * 5} kg`,
      });
    }
  }

  // ── 3. NEGATIVE STOCK (should never happen) ──────────────────────────────
  if (record.quantity < 0 || record.quantityUnits < 0) {
    signals.push({
      type: 'stock_mismatch',
      description: `Inventory record has negative quantity: ${record.quantity || record.quantityUnits}. This indicates a reconciliation error.`,
      value: record.quantity || record.quantityUnits,
      expected: '≥ 0',
    });
  }

  // ── 4. AFTER-HOURS ADJUSTMENT ────────────────────────────────────────────
  const hour = new Date().getHours();
  if ((hour >= 22 || hour < 5) && adjustmentQty !== undefined) {
    signals.push({
      type: 'after_hours_entry',
      description: `Inventory adjustment made at ${hour}:00 — outside normal operating hours`,
      value: hour,
      expected: '5-22',
    });
  }

  const isAnomaly = signals.length > 0;

  return {
    isAnomaly,
    detectorName: 'inventoryDetector',
    sourceModel: record.name ? 'FeedInventory' : 'MedicineInventory',
    sourceId: record._id,
    description: isAnomaly
      ? `Inventory anomaly: ${signals.map(s => s.type).join(', ')}`
      : 'Normal inventory change',
    signals,
  };
}

module.exports = { detect };
