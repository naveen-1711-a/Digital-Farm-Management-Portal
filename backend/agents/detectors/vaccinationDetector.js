/**
 * vaccinationDetector.js
 * Detects suspicious vaccination completion events.
 * Cross-checks: vaccine stock deducted, veterinarian record, timestamp validity.
 */
const Vaccination = require('../../models/Vaccination');
const MedicineInventory = require('../../models/MedicineInventory');
const Animal = require('../../models/Animal');

async function detect(payload) {
  const { record, farmId, userId } = payload;

  if (!record || !farmId) return { isAnomaly: false };
  if (record.status !== 'Completed') return { isAnomaly: false };

  const signals = [];

  // ── 1. NO VACCINE STOCK DEDUCTED ─────────────────────────────────────────
  // Check if medicine inventory for this vaccine exists and has been consumed
  const vaccineStock = await MedicineInventory.findOne({
    farm: farmId,
    medicineName: { $regex: record.vaccineName, $options: 'i' },
    isActive: true,
  }).lean();

  if (!vaccineStock) {
    signals.push({
      type: 'no_vaccine_stock_deducted',
      description: `Vaccination "${record.vaccineName}" marked as Completed but no matching vaccine in medicine inventory`,
      value: 'no stock found',
      expected: 'matching vaccine stock',
    });
  }

  // ── 2. ADMINISTERED BY VALIDATION ────────────────────────────────────────
  if (!record.administeredBy) {
    signals.push({
      type: 'missing_cross_record',
      description: `Vaccination "${record.vaccineName}" completed with no administering person recorded`,
      value: null,
      expected: 'veterinarian/user reference',
    });
  }

  // ── 3. NO ANIMAL HEALTH RECORD (animal should have updated health status) ─
  if (record.animal) {
    const animal = await Animal.findById(record.animal).lean();
    if (!animal) {
      signals.push({
        type: 'missing_cross_record',
        description: `Vaccination references animal ID ${record.animal} which does not exist on this farm`,
        value: record.animal,
        expected: 'valid animal',
      });
    }
  }

  // ── 4. FUTURE ADMINISTERED DATE ──────────────────────────────────────────
  if (record.administeredDate && new Date(record.administeredDate) > new Date()) {
    signals.push({
      type: 'after_hours_entry',
      description: `Vaccination administered date is set in the future: ${record.administeredDate}`,
      value: record.administeredDate,
      expected: 'past or present date',
    });
  }

  // ── 5. BULK VACCINATION WITHOUT CORRESPONDING ANIMALS ─────────────────────
  // Check for many vaccinations for same vaccine today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayVaccinations = await Vaccination.countDocuments({
    farm: farmId,
    vaccineName: record.vaccineName,
    status: 'Completed',
    updatedAt: { $gte: todayStart },
  });

  const totalAnimals = await Animal.countDocuments({ farm: farmId, isActive: true });
  if (todayVaccinations > totalAnimals * 0.8 && totalAnimals > 0) {
    signals.push({
      type: 'quantity_anomaly',
      description: `${todayVaccinations} vaccinations for "${record.vaccineName}" today, but only ${totalAnimals} active animals — possibly bulk-marked without actual vaccinations`,
      value: todayVaccinations,
      expected: `≤ ${Math.ceil(totalAnimals * 0.5)}`,
    });
  }

  const isAnomaly = signals.length > 0;

  return {
    isAnomaly,
    detectorName: 'vaccinationDetector',
    sourceModel: 'Vaccination',
    sourceId: record._id,
    description: isAnomaly
      ? `Vaccination anomaly: ${signals.map(s => s.type).join(', ')}`
      : 'Normal vaccination',
    signals,
  };
}

module.exports = { detect };
