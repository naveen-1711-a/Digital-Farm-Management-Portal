/**
 * investigationAgent.js
 * Orchestrates multi-domain evidence gathering and cross-correlation.
 * Called after a detector flags an anomaly.
 * Selects appropriate evidence tools based on the domain, then runs correlation.
 */
const ec = require('./evidenceCollector');
const { correlate, calculateConfidence } = require('./correlationEngine');

/**
 * Run full investigation for a detected anomaly.
 * @param {Object} params
 * @param {Object} params.anomalyEvent - AnomalyEvent document
 * @param {string} params.domain - e.g. 'Medicine'
 * @param {string} params.farmId
 * @param {Object} params.payload - original event payload
 * @param {Object} params.detectionResult - detector output
 * @returns {{ additionalSignals, crossModuleFindings, evidence, confidence }}
 */
async function investigate({ anomalyEvent, domain, farmId, payload, detectionResult }) {
  const workerId = payload.userId;
  const additionalSignals = [];
  let evidence = {};

  // ── Gather evidence based on domain ──────────────────────────────────────

  switch (domain) {
    case 'Medicine': {
      const [medicineHistory, diseaseRecords, animalHealth, workerProfile, previousAnomalies, similarIncidents] = await Promise.all([
        ec.getMedicineHistory(farmId, payload.record?.medicineName),
        ec.getDiseaseRecords(farmId),
        ec.getAnimalHealth(farmId),
        ec.getWorkerBehaviorProfile(farmId, workerId),
        ec.getPreviousAnomalies(farmId, workerId),
        ec.getSimilarIncidents(farmId, domain),
      ]);

      evidence = { medicineHistory, diseaseRecords, animalHealth, workerProfile, previousAnomalies, similarIncidents };

      // Additional signal: worker has prior anomalies
      if (previousAnomalies.length >= 2) {
        additionalSignals.push({
          type: 'previous_anomalies',
          description: `Worker has ${previousAnomalies.length} prior anomaly events`,
          value: previousAnomalies.length,
          expected: 0,
        });
      }

      // Additional signal: similar incidents in last 90 days
      if (similarIncidents.filter(i => i.classification !== 'False Positive').length >= 1) {
        additionalSignals.push({
          type: 'previous_anomalies',
          description: `${similarIncidents.length} similar medicine incidents in last 90 days on this farm`,
          value: similarIncidents.length,
          expected: 0,
        });
      }
      break;
    }

    case 'Attendance': {
      const [workerHistory, previousAnomalies] = await Promise.all([
        ec.getWorkerHistory(farmId, workerId),
        ec.getPreviousAnomalies(farmId, workerId),
      ]);

      evidence = { workerHistory, previousAnomalies };

      if (previousAnomalies.length >= 1) {
        additionalSignals.push({
          type: 'previous_anomalies',
          description: `Worker has ${previousAnomalies.length} prior anomaly events`,
          value: previousAnomalies.length,
          expected: 0,
        });
      }
      break;
    }

    case 'Feed': {
      const [feedHistory, animalHealth, previousAnomalies] = await Promise.all([
        ec.getFeedHistory(farmId),
        ec.getAnimalHealth(farmId),
        ec.getPreviousAnomalies(farmId, workerId),
      ]);

      evidence = { feedHistory, animalHealth, previousAnomalies };
      break;
    }

    case 'Vaccination': {
      const [vaccinationRecords, animalHealth, medicineInventory, previousAnomalies] = await Promise.all([
        ec.getVaccinationRecords(farmId),
        ec.getAnimalHealth(farmId),
        ec.getMedicineInventoryStatus(farmId),
        ec.getPreviousAnomalies(farmId, workerId),
      ]);

      evidence = { vaccinationRecords, animalHealth, medicineInventory, previousAnomalies };
      break;
    }

    case 'Animal': {
      const [animalHealth, diseaseRecords, previousAnomalies] = await Promise.all([
        ec.getAnimalHealth(farmId),
        ec.getDiseaseRecords(farmId, 14),
        ec.getPreviousAnomalies(farmId, workerId),
      ]);

      evidence = { animalHealth, diseaseRecords, previousAnomalies };
      break;
    }

    case 'Biosecurity': {
      const [animalHealth, previousAnomalies] = await Promise.all([
        ec.getAnimalHealth(farmId),
        ec.getPreviousAnomalies(farmId, workerId),
      ]);

      evidence = { animalHealth, previousAnomalies };
      break;
    }

    case 'Inventory': {
      const [feedHistory, animalHealth] = await Promise.all([
        ec.getFeedHistory(farmId),
        ec.getAnimalHealth(farmId),
      ]);

      evidence = { feedHistory, animalHealth };
      break;
    }

    case 'Audit': {
      const previousAnomalies = await ec.getPreviousAnomalies(farmId, workerId);
      evidence = { previousAnomalies };
      break;
    }

    default:
      evidence = {};
  }

  // ── Cross-module correlation ───────────────────────────────────────────────
  const crossModuleFindings = correlate(domain, evidence);

  // ── Confidence ───────────────────────────────────────────────────────────
  const allSignals = [...detectionResult.signals, ...additionalSignals];
  const confidence = calculateConfidence(crossModuleFindings, allSignals.length);

  return {
    additionalSignals,
    crossModuleFindings,
    evidence,
    confidence,
  };
}

module.exports = { investigate };
