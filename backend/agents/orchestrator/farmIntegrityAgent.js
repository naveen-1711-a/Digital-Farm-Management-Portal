/**
 * farmIntegrityAgent.js
 * Central orchestrator of the Farm Integrity Agent system.
 * Listens to the event bus, routes events to appropriate detectors,
 * then drives the full investigation → risk → decision → action pipeline.
 */
const agentEventBus = require('./agentEventBus');

// Detectors
const medicineDetector = require('../detectors/medicineDetector');
const feedDetector = require('../detectors/feedDetector');
const attendanceDetector = require('../detectors/attendanceDetector');
const animalDetector = require('../detectors/animalDetector');
const vaccinationDetector = require('../detectors/vaccinationDetector');
const biosecurityDetector = require('../detectors/biosecurityDetector');
const inventoryDetector = require('../detectors/inventoryDetector');
const auditDetector = require('../detectors/auditDetector');

// Investigation
const investigationAgent = require('../investigation/investigationAgent');

// Risk
const riskEngine = require('../risk/riskEngine');

// Actions
const actionExecutor = require('../actions/actionExecutor');

// Models
const AnomalyEvent = require('../../models/AnomalyEvent');

// Event → Detector mapping
const EVENT_DETECTOR_MAP = {
  MEDICINE_USAGE_UPDATED: { detector: medicineDetector, domain: 'Medicine' },
  FEED_USAGE_UPDATED: { detector: feedDetector, domain: 'Feed' },
  ATTENDANCE_MARKED: { detector: attendanceDetector, domain: 'Attendance' },
  ANIMAL_UPDATED: { detector: animalDetector, domain: 'Animal' },
  VACCINATION_COMPLETED: { detector: vaccinationDetector, domain: 'Vaccination' },
  VISITOR_REGISTERED: { detector: biosecurityDetector, domain: 'Biosecurity' },
  INVENTORY_ADJUSTED: { detector: inventoryDetector, domain: 'Inventory' },
  AUDIT_LOG_CREATED: { detector: auditDetector, domain: 'Audit' },
};

/**
 * Core pipeline: Event → Detect → Investigate → Risk → Decide → Act
 */
async function handleEvent(eventType, payload) {
  const mapping = EVENT_DETECTOR_MAP[eventType];
  if (!mapping) return;

  const { detector, domain } = mapping;
  const farmId = payload.farmId;

  try {
    // ── STEP 1: DETECT ──────────────────────────────────────────────────────
    const detectionResult = await detector.detect(payload);

    if (!detectionResult.isAnomaly) {
      // No anomaly — record stats but do nothing
      agentEventBus.recordProcessed();
      return;
    }

    console.log(`🔍 [FarmIntegrityAgent] Anomaly detected by ${detectionResult.detectorName} on farm ${farmId}`);

    // ── STEP 2: RECORD ANOMALY EVENT ────────────────────────────────────────
    const anomalyEvent = await AnomalyEvent.create({
      farm: farmId,
      eventType,
      detectorName: detectionResult.detectorName,
      sourceModel: detectionResult.sourceModel,
      sourceId: detectionResult.sourceId,
      triggeredBy: payload.userId,
      description: detectionResult.description,
      rawData: payload,
      signals: detectionResult.signals,
      status: 'investigating',
    });

    // ── STEP 3: INVESTIGATE ─────────────────────────────────────────────────
    const investigation = await investigationAgent.investigate({
      anomalyEvent,
      domain,
      farmId,
      payload,
      detectionResult,
    });

    // ── STEP 4: RISK SCORING ────────────────────────────────────────────────
    const riskResult = await riskEngine.score({
      domain,
      farmId,
      signals: [...detectionResult.signals, ...investigation.additionalSignals],
      crossModuleFindings: investigation.crossModuleFindings,
      workerId: payload.userId,
    });

    // ── STEP 5: DECIDE & ACT ────────────────────────────────────────────────
    await actionExecutor.execute({
      farmId,
      domain,
      anomalyEvent,
      detectionResult,
      investigation,
      riskResult,
    });

    // Mark anomaly event as linked to case
    if (riskResult.caseId) {
      await AnomalyEvent.findByIdAndUpdate(anomalyEvent._id, {
        status: 'investigating',
        linkedCase: riskResult.caseId,
      });
    }

    agentEventBus.recordProcessed();
    console.log(`✅ [FarmIntegrityAgent] Pipeline complete for ${eventType} | Risk: ${riskResult.score} | Severity: ${riskResult.severity}`);

  } catch (err) {
    agentEventBus.recordError();
    console.error(`❌ [FarmIntegrityAgent] Pipeline error for ${eventType}:`, err.message);
  }
}

/**
 * Initialize the orchestrator — register all event listeners.
 * Called once at server startup.
 */
function initialize() {
  Object.keys(EVENT_DETECTOR_MAP).forEach((eventType) => {
    agentEventBus.on(eventType, (payload) => {
      // Non-blocking: run pipeline async without blocking the HTTP request
      setImmediate(() => handleEvent(eventType, payload));
    });
  });

  console.log('🛡️  [FarmIntegrityAgent] Orchestrator initialized. Listening for farm events...');
  console.log(`   Events monitored: ${Object.keys(EVENT_DETECTOR_MAP).join(', ')}`);
}

module.exports = { initialize, handleEvent };
