/**
 * animalDetector.js
 * Detects suspicious animal records.
 * Checks: impossible weight for species/age, mortality spike, duplicate tag IDs.
 */
const Animal = require('../../models/Animal');

// Species weight limits (kg) — flags if outside range
const WEIGHT_LIMITS = {
  Poultry: { min: 0.05, max: 12 },
  Pig: { min: 0.5, max: 350 },
};

// Mortality spike threshold — % dead animals in last 7 days
const MORTALITY_SPIKE_THRESHOLD = 0.10; // 10% of farm animals

async function detect(payload) {
  const { record, farmId, userId } = payload;

  if (!record || !farmId) return { isAnomaly: false };

  const signals = [];

  // ── 1. IMPOSSIBLE WEIGHT FOR SPECIES ────────────────────────────────────
  if (record.weight && record.species && WEIGHT_LIMITS[record.species]) {
    const { min, max } = WEIGHT_LIMITS[record.species];
    if (record.weight < min || record.weight > max) {
      signals.push({
        type: 'impossible_weight',
        description: `${record.species} weight of ${record.weight} kg is outside valid range (${min}–${max} kg)`,
        value: record.weight,
        expected: `${min}–${max} kg`,
      });
    }
  }

  // ── 2. DUPLICATE TAG ID ───────────────────────────────────────────────────
  const dupCount = await Animal.countDocuments({
    farm: farmId,
    tagId: record.tagId,
    _id: { $ne: record._id },
  });

  if (dupCount > 0) {
    signals.push({
      type: 'duplicate_entry',
      description: `Animal tag ID "${record.tagId}" already exists for ${dupCount} other animal(s) on this farm`,
      value: dupCount,
      expected: 0,
    });
  }

  // ── 3. UNEXPLAINED MORTALITY SPIKE ─────────────────────────────────────
  if (record.healthStatus === 'Deceased') {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentDeaths = await Animal.countDocuments({
      farm: farmId,
      healthStatus: 'Deceased',
      updatedAt: { $gte: sevenDaysAgo },
    });

    const totalAnimals = await Animal.countDocuments({ farm: farmId, isActive: true });
    const mortalityRate = totalAnimals > 0 ? recentDeaths / totalAnimals : 0;

    if (mortalityRate >= MORTALITY_SPIKE_THRESHOLD && recentDeaths >= 5) {
      signals.push({
        type: 'mortality_spike',
        description: `${recentDeaths} animals died in the last 7 days (${(mortalityRate * 100).toFixed(1)}% mortality rate) — potential disease outbreak or reporting issue`,
        value: mortalityRate,
        expected: `< ${MORTALITY_SPIKE_THRESHOLD * 100}%`,
      });
    }
  }

  // ── 4. IMPOSSIBLE AGE (dateOfBirth in the future) ────────────────────────
  if (record.dateOfBirth && new Date(record.dateOfBirth) > new Date()) {
    signals.push({
      type: 'impossible_weight', // reusing signal type for invalid data
      description: `Animal date of birth is set in the future: ${record.dateOfBirth}`,
      value: record.dateOfBirth,
      expected: 'past date',
    });
  }

  const isAnomaly = signals.length > 0;

  return {
    isAnomaly,
    detectorName: 'animalDetector',
    sourceModel: 'Animal',
    sourceId: record._id,
    description: isAnomaly
      ? `Animal anomaly: ${signals.map(s => s.type).join(', ')}`
      : 'Normal animal record',
    signals,
  };
}

module.exports = { detect };
