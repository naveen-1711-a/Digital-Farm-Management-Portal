/**
 * correlationEngine.js
 * Cross-module correlation logic.
 * Takes evidence from multiple modules and determines if they support or contradict each other.
 * This is where "the agent connects the dots" across data sources.
 */

/**
 * Correlate medicine anomaly against disease records, prescriptions, and animal health.
 * @returns Array of CrossModuleFindings
 */
function correlateMedicine({ medicineHistory, diseaseRecords, animalHealth, workerProfile, previousAnomalies }) {
  const findings = [];

  // 1. Medicine spike + no disease increase = suspicious
  const sickAnimals = animalHealth?.sick || 0;
  const totalAnimals = animalHealth?.total || 1;
  const sickPercent = (sickAnimals / totalAnimals) * 100;

  if (sickPercent < 10) {
    findings.push({
      module: 'Disease Records',
      finding: `Only ${sickPercent.toFixed(1)}% of animals are sick — insufficient to justify high medicine usage`,
      supports: 'suspicious',
    });
  } else {
    findings.push({
      module: 'Disease Records',
      finding: `${sickPercent.toFixed(1)}% of animals are sick — disease context partially justifies medicine usage`,
      supports: 'legitimate',
    });
  }

  // 2. Recent disease outbreak = legitimizes medicine
  if (diseaseRecords && diseaseRecords.length > 2) {
    findings.push({
      module: 'Disease Records',
      finding: `${diseaseRecords.length} disease cases recorded in last 30 days — ongoing health issues noted`,
      supports: 'legitimate',
    });
  }

  // 3. Worker has previous anomalies = more suspicious
  if (previousAnomalies && previousAnomalies.length >= 3) {
    findings.push({
      module: 'Worker History',
      finding: `Worker responsible has ${previousAnomalies.length} previous anomaly events on record`,
      supports: 'suspicious',
    });
  }

  // 4. Worker profile deviation
  if (workerProfile?.isReliable) {
    findings.push({
      module: 'Behavior Profile',
      finding: `Worker behavioral profile exists (${workerProfile.sampleSize} samples) — activity compared against baseline`,
      supports: 'neutral',
    });
  }

  return findings;
}

/**
 * Correlate attendance anomaly against work records.
 */
function correlateAttendance({ workerHistory, previousAnomalies }) {
  const findings = [];

  if (previousAnomalies && previousAnomalies.length > 0) {
    findings.push({
      module: 'Anomaly History',
      finding: `Worker has ${previousAnomalies.length} prior anomaly events — pattern of suspicious activity`,
      supports: 'suspicious',
    });
  }

  // Check consistent attendance in history
  if (workerHistory && workerHistory.length > 0) {
    const absentCount = workerHistory.filter(a => a.status === 'Absent').length;
    const absentRate = (absentCount / workerHistory.length) * 100;
    if (absentRate > 30) {
      findings.push({
        module: 'Attendance History',
        finding: `Worker has ${absentRate.toFixed(0)}% absence rate in last 30 days — irregular attendance pattern`,
        supports: 'suspicious',
      });
    }
  }

  return findings;
}

/**
 * Correlate vaccination against inventory and animal health.
 */
function correlateVaccination({ animalHealth, vaccinationRecords, medicineInventory }) {
  const findings = [];

  if (medicineInventory && medicineInventory.length === 0) {
    findings.push({
      module: 'Medicine Inventory',
      finding: 'No vaccine found in medicine inventory — vaccination may not have actually occurred',
      supports: 'suspicious',
    });
  }

  const completedCount = vaccinationRecords?.filter(v => v.status === 'Completed').length || 0;
  const totalAnimals = animalHealth?.total || 0;
  if (completedCount > totalAnimals * 0.9 && totalAnimals > 0) {
    findings.push({
      module: 'Animal Records',
      finding: `${completedCount} vaccinations completed vs ${totalAnimals} total animals — possible bulk auto-marking`,
      supports: 'suspicious',
    });
  }

  return findings;
}

/**
 * Correlate feed anomaly against animal count and history.
 */
function correlateFeed({ feedHistory, animalHealth }) {
  const findings = [];

  if (animalHealth?.total === 0) {
    findings.push({
      module: 'Animal Records',
      finding: 'No active animals recorded on farm — feed usage cannot be justified',
      supports: 'suspicious',
    });
  } else if (animalHealth?.total < 10) {
    findings.push({
      module: 'Animal Records',
      finding: `Only ${animalHealth.total} active animals — small population may not require large feed quantities`,
      supports: 'suspicious',
    });
  }

  return findings;
}

/**
 * Route to correct correlation function based on domain.
 */
function correlate(domain, evidence) {
  switch (domain) {
    case 'Medicine': return correlateMedicine(evidence);
    case 'Attendance': return correlateAttendance(evidence);
    case 'Vaccination': return correlateVaccination(evidence);
    case 'Feed': return correlateFeed(evidence);
    default: return [];
  }
}

/**
 * Calculate confidence score based on cross-module findings.
 * Ranges from 0.0 (no confidence) to 1.0 (very confident it is suspicious).
 */
function calculateConfidence(crossModuleFindings, signalCount) {
  const suspiciousCount = crossModuleFindings.filter(f => f.supports === 'suspicious').length;
  const legitimateCount = crossModuleFindings.filter(f => f.supports === 'legitimate').length;

  const base = signalCount * 0.15;
  const crossBonus = suspiciousCount * 0.12;
  const legitimatePenalty = legitimateCount * 0.08;

  return Math.min(1.0, Math.max(0.0, base + crossBonus - legitimatePenalty));
}

module.exports = { correlate, calculateConfidence };
