/**
 * farmGuardAgent.js
 * FarmGuard AI — Autonomous Farm Operations Agent
 *
 * This is the "bigger idea" agent that operates WITHOUT requiring worker input.
 * It autonomously monitors, investigates, decides, and acts across the farm.
 *
 * Three automation levels:
 *  Level 1 = Fully automatic (safe actions only)
 *  Level 2 = Automatic + human notification
 *  Level 3 = Prepared action + human approval required
 *
 * Architecture:
 *   Sensor/Event → Observe → Detect → Investigate (tools) → Groq Reasoning
 *   → Risk Score → Policy Check → Act → Audit
 */
const agentEventBus = require('../orchestrator/agentEventBus');
const groqReasoning = require('../groq/groqReasoningEngine');
const SensorEvent = require('../../models/SensorEvent');
const Animal = require('../../models/Animal');
const MedicineInventory = require('../../models/MedicineInventory');
const FeedInventory = require('../../models/FeedInventory');
const Vaccination = require('../../models/Vaccination');
const Disease = require('../../models/Disease');
const Attendance = require('../../models/Attendance');
const Notification = require('../../models/Notification');
const Task = require('../../models/Task');
const AutonomousAction = require('../../models/AutonomousAction');
const User = require('../../models/User');
const { score: riskScore } = require('../risk/riskEngine');
const { generateIncidentReport } = require('../groq/groqReasoningEngine');

// ── Autonomous observation thresholds ────────────────────────────────────────
const THRESHOLDS = {
  feed: { deviationMultiplier: 1.8 },       // flag if >1.8x expected
  temperature: { max: 32, min: 18 },         // °C
  humidity: { max: 80, min: 30 },            // %
  mortality: { dailyMax: 5 },                // animals
  waterDeviation: 1.5,                       // multiplier
};

/**
 * Core autonomous observation loop.
 * Called periodically by the scheduler.
 * Processes unanalyzed sensor events and takes appropriate action.
 */
async function runObservationCycle(farmId) {
  console.log(`\n🤖 [FarmGuard] Starting observation cycle for farm ${farmId}`);

  try {
    // Gather last-hour sensor data
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const sensorData = await SensorEvent.find({
      farm: farmId,
      createdAt: { $gte: oneHourAgo },
      processedByAgent: false,
    }).lean();

    if (sensorData.length === 0) {
      console.log(`  [FarmGuard] No new sensor data for farm ${farmId}`);
      return;
    }

    // Group by sensor type for easy access
    const byType = {};
    for (const s of sensorData) {
      if (!byType[s.sensorType]) byType[s.sensorType] = [];
      byType[s.sensorType].push(s);
    }

    const animalCount = await Animal.countDocuments({ farm: farmId, isActive: true });
    const sickAnimals = await Animal.countDocuments({ farm: farmId, healthStatus: 'Sick', isActive: true });

    // ── OBSERVATION 1: Feed consumption ──────────────────────────────────
    await observeFeedConsumption({ farmId, byType, animalCount });

    // ── OBSERVATION 2: Health & Mortality ─────────────────────────────────
    await observeHealthAndMortality({ farmId, byType, animalCount, sickAnimals });

    // ── OBSERVATION 3: Environmental conditions ────────────────────────────
    await observeEnvironment({ farmId, byType });

    // ── OBSERVATION 4: Auto-schedule vaccinations ─────────────────────────
    await observeVaccinationSchedule({ farmId, animalCount });

    // ── OBSERVATION 5: Inventory reconciliation ────────────────────────────
    await observeInventory({ farmId, animalCount });

    // Mark sensor events as processed
    const ids = sensorData.map(s => s._id);
    await SensorEvent.updateMany({ _id: { $in: ids } }, { processedByAgent: true });

    console.log(`  [FarmGuard] Cycle complete. Processed ${sensorData.length} sensor events.`);
  } catch (err) {
    console.error(`❌ [FarmGuard] Observation error for farm ${farmId}:`, err.message);
  }
}

// ── OBSERVATION FUNCTIONS ─────────────────────────────────────────────────────

async function observeFeedConsumption({ farmId, byType, animalCount }) {
  const feedReadings = byType['feed_consumption'] || [];
  if (feedReadings.length === 0 || animalCount === 0) return;

  const latestFeed = feedReadings[feedReadings.length - 1];
  const expectedFeed = animalCount * 0.12; // 0.12 kg/bird/day
  const actualFeed = latestFeed.value;
  const deviation = actualFeed / expectedFeed;

  if (deviation > THRESHOLDS.feed.deviationMultiplier) {
    const signals = [{
      type: 'quantity_anomaly',
      description: `Automated feed sensor: ${actualFeed.toFixed(1)} kg consumed vs expected ${expectedFeed.toFixed(1)} kg (${deviation.toFixed(1)}x deviation)`,
      value: actualFeed,
      expected: expectedFeed,
    }];

    // Get Groq reasoning
    const reasoning = await groqReasoning.analyzeEvent({
      eventType: 'FEED_SENSOR_ANOMALY',
      domain: 'Feed',
      farmId,
      signals,
      sensorData: { feedConsumption: actualFeed, expectedFeed, animalCount },
      animalHealth: { sick: await Animal.countDocuments({ farm: farmId, healthStatus: 'Sick' }) },
    });

    await executeAutonomousAction({
      farmId, triggerType: 'feed_deviation',
      triggerData: { actualFeed, expectedFeed, deviation },
      level: deviation > 3 ? 3 : deviation > 2 ? 2 : 1,
      actionType: deviation > 3 ? 'auto_investigation' : deviation > 2 ? 'notify_manager' : 'auto_record_feed',
      riskScore: Math.min(100, Math.round((deviation - 1) * 30)),
      aiReasoning: reasoning?.summary,
      confidence: reasoning?.confidence || 0.6,
    });
  } else {
    // Level 1: Auto-record normal feed consumption (no human needed)
    await executeAutonomousAction({
      farmId, triggerType: 'feed_deviation',
      triggerData: { actualFeed, expectedFeed, deviation },
      level: 1, actionType: 'auto_record_feed',
      riskScore: 10, confidence: 0.95,
      aiReasoning: `Normal feed consumption recorded: ${actualFeed.toFixed(1)} kg (expected ${expectedFeed.toFixed(1)} kg).`,
    });
  }
}

async function observeHealthAndMortality({ farmId, byType, animalCount, sickAnimals }) {
  const mortalityReadings = byType['mortality_count'] || [];
  const waterReadings = byType['water_consumption'] || [];
  const feedReadings = byType['feed_consumption'] || [];

  const mortality = mortalityReadings.length > 0 ? mortalityReadings[mortalityReadings.length - 1].value : 0;
  const waterVal = waterReadings.length > 0 ? waterReadings[waterReadings.length - 1].value : 0;
  const feedVal = feedReadings.length > 0 ? feedReadings[feedReadings.length - 1].value : 0;
  const expectedWater = animalCount * 0.25;
  const waterDeviation = expectedWater > 0 ? waterVal / expectedWater : 1;

  // Disease risk signals
  const diseaseSignals = [];

  if (mortality >= THRESHOLDS.mortality.dailyMax) {
    diseaseSignals.push({
      type: 'mortality_spike',
      description: `High mortality: ${mortality} animals today (threshold: ${THRESHOLDS.mortality.dailyMax})`,
      value: mortality,
      expected: `< ${THRESHOLDS.mortality.dailyMax}`,
    });
  }

  if (waterDeviation > THRESHOLDS.waterDeviation) {
    diseaseSignals.push({
      type: 'quantity_anomaly',
      description: `Water consumption ${waterDeviation.toFixed(1)}x above expected — possible illness symptom`,
      value: waterVal,
      expected: expectedWater,
    });
  }

  if (sickAnimals > 0) {
    diseaseSignals.push({
      type: 'quantity_anomaly',
      description: `${sickAnimals} animals currently marked sick`,
      value: sickAnimals,
      expected: 0,
    });
  }

  if (diseaseSignals.length >= 2) {
    // Multi-signal disease risk detected
    const recentDiseases = await Disease.countDocuments({
      farm: farmId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const reasoning = await groqReasoning.analyzeEvent({
      eventType: 'HEALTH_ANOMALY',
      domain: 'Animal',
      farmId,
      signals: diseaseSignals,
      sensorData: { mortality, waterConsumption: waterVal, feedConsumption: feedVal },
      animalHealth: { total: animalCount, sick: sickAnimals },
      historicalContext: `${recentDiseases} disease cases in last 7 days`,
    });

    const risk = 30 + diseaseSignals.length * 20 + (mortality >= 10 ? 30 : 0);

    await executeAutonomousAction({
      farmId, triggerType: 'health_alert',
      triggerData: { mortality, waterDeviation, sickAnimals, diseaseSignals },
      level: risk >= 70 ? 3 : 2,
      actionType: risk >= 70 ? 'request_quarantine' : 'notify_vet',
      riskScore: Math.min(100, risk),
      aiReasoning: reasoning?.summary,
      confidence: reasoning?.confidence || 0.7,
    });
  }
}

async function observeEnvironment({ farmId, byType }) {
  const temps = byType['temperature'] || [];
  const humidities = byType['humidity'] || [];

  if (temps.length === 0) return;

  const avgTemp = temps.reduce((s, r) => s + r.value, 0) / temps.length;
  const avgHumidity = humidities.length > 0
    ? humidities.reduce((s, r) => s + r.value, 0) / humidities.length : 60;

  const envSignals = [];

  if (avgTemp > THRESHOLDS.temperature.max) {
    envSignals.push({
      type: 'quantity_anomaly',
      description: `High temperature detected: ${avgTemp.toFixed(1)}°C (max safe: ${THRESHOLDS.temperature.max}°C). Heat stress risk.`,
      value: avgTemp,
      expected: `< ${THRESHOLDS.temperature.max}°C`,
    });
  }

  if (avgHumidity > THRESHOLDS.humidity.max) {
    envSignals.push({
      type: 'quantity_anomaly',
      description: `High humidity: ${avgHumidity.toFixed(0)}% (max safe: ${THRESHOLDS.humidity.max}%). Disease spread risk.`,
      value: avgHumidity,
      expected: `< ${THRESHOLDS.humidity.max}%`,
    });
  }

  if (envSignals.length > 0) {
    const reasoning = await groqReasoning.analyzeEvent({
      eventType: 'ENVIRONMENTAL_ALERT',
      domain: 'Biosecurity',
      farmId,
      signals: envSignals,
      temperature: avgTemp,
      humidity: avgHumidity,
    });

    await executeAutonomousAction({
      farmId, triggerType: 'environmental_alert',
      triggerData: { avgTemp, avgHumidity },
      level: 2,
      actionType: 'notify_manager',
      riskScore: 55 + envSignals.length * 10,
      aiReasoning: reasoning?.summary,
      confidence: 0.85,
    });
  }
}

async function observeVaccinationSchedule({ farmId, animalCount }) {
  if (animalCount === 0) return;

  // Find animals overdue for vaccination
  const overdueVaccinations = await Vaccination.countDocuments({
    farm: farmId,
    status: 'Overdue',
  });

  const dueVaccinations = await Vaccination.countDocuments({
    farm: farmId,
    status: 'Due',
  });

  if (overdueVaccinations > 0 || dueVaccinations > 5) {
    // Level 2: Auto-notify vet, no human approval needed just for notification
    await executeAutonomousAction({
      farmId, triggerType: 'vaccination_due',
      triggerData: { overdueVaccinations, dueVaccinations, animalCount },
      level: 2,
      actionType: 'notify_vet',
      riskScore: 35 + overdueVaccinations * 5,
      aiReasoning: `Vaccination schedule alert: ${overdueVaccinations} overdue, ${dueVaccinations} due soon across ${animalCount} animals. Veterinarian notification dispatched.`,
      confidence: 0.98,
    });
  }
}

async function observeInventory({ farmId, animalCount }) {
  const feedItems = await FeedInventory.find({ farm: farmId, isActive: true }).lean();
  const totalFeed = feedItems.reduce((s, f) => s + (f.quantity || 0), 0);
  const expectedMinFeed = animalCount * 5; // 5 days minimum supply

  if (totalFeed < expectedMinFeed && animalCount > 0) {
    await executeAutonomousAction({
      farmId, triggerType: 'inventory_mismatch',
      triggerData: { totalFeed, expectedMinFeed, animalCount },
      level: 2,
      actionType: 'notify_manager',
      riskScore: 45,
      aiReasoning: `Feed inventory critically low: ${totalFeed.toFixed(0)} kg on hand, ${expectedMinFeed.toFixed(0)} kg minimum recommended for ${animalCount} animals (5-day buffer).`,
      confidence: 0.97,
    });
  }
}

// ── ACTION EXECUTOR ───────────────────────────────────────────────────────────

/**
 * Execute an autonomous action at the appropriate level.
 * Level 1 → execute immediately (no human)
 * Level 2 → execute + notify
 * Level 3 → prepare + require human approval
 */
async function executeAutonomousAction({
  farmId, triggerType, triggerData, level, actionType,
  riskScore: risk, aiReasoning, confidence, relatedCase,
}) {
  const status = level === 3 ? 'pending_approval' : 'executed';

  // Persist the autonomous action record
  const action = await AutonomousAction.create({
    farm: farmId,
    triggerType,
    triggerData,
    actionType,
    automationLevel: level,
    aiReasoning,
    confidence,
    riskScore: risk,
    status,
    relatedCase,
    groqModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  });

  // Level 1 — Fully automatic, no notification needed
  if (level === 1) {
    console.log(`  🟢 [FarmGuard L1] Auto-executed: ${actionType} (Risk: ${risk})`);
    return action;
  }

  // Level 2 — Execute + notify manager
  if (level === 2) {
    await notifyFarm(farmId, {
      title: `🤖 FarmGuard Alert — ${triggerType.replace(/_/g, ' ')}`,
      message: aiReasoning || `Autonomous monitoring detected: ${triggerType}. Risk: ${risk}/100.`,
      priority: risk >= 70 ? 'Critical' : risk >= 50 ? 'High' : 'Medium',
      type: 'Sensor Alert',
      automationLevel: 2,
    });
    console.log(`  🟡 [FarmGuard L2] Executed + notified: ${actionType} (Risk: ${risk})`);
    return action;
  }

  // Level 3 — Notify + require approval
  if (level === 3) {
    await notifyFarm(farmId, {
      title: `🚨 FarmGuard CRITICAL — APPROVAL REQUIRED`,
      message: `${aiReasoning} | Action "${actionType}" is prepared but requires your approval. Risk: ${risk}/100.`,
      priority: 'Critical',
      type: 'Sensor Alert',
      automationLevel: 3,
    });
    console.log(`  🔴 [FarmGuard L3] Pending approval: ${actionType} (Risk: ${risk})`);
    return action;
  }
}

/**
 * Send notification to all managers of a farm.
 */
async function notifyFarm(farmId, { title, message, priority, type, automationLevel }) {
  const managers = await User.find({
    $or: [{ _id: farmId }, { farmId, role: 'farm_manager' }],
    status: { $in: ['approved', 'Active'] },
  }).select('_id').lean();

  const notifications = managers.map(m => ({
    recipient: m._id,
    farm: farmId,
    type: type || 'Sensor Alert',
    title,
    message,
    priority: priority || 'High',
    automationLevel: automationLevel || 2,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
}

/**
 * Initialize FarmGuard AI event listeners.
 * Called at server startup alongside the integrity agent.
 */
function initialize() {
  // Listen for sensor anomalies from the simulator
  agentEventBus.on('SENSOR_ANOMALY', async (payload) => {
    setImmediate(async () => {
      await handleSensorAnomaly(payload);
    });
  });

  console.log('🤖 [FarmGuard AI] Autonomous operations agent initialized.');
  console.log('   3-level automation: L1=Auto, L2=Notify, L3=Approval');
  console.log(`   Groq model: ${process.env.GROQ_MODEL || 'llama-3.1-8b-instant'}`);
  console.log(`   Groq enabled: ${process.env.GROQ_API_KEY ? 'YES' : 'NO (fallback mode)'}`);
}

/**
 * Handle individual sensor anomaly events from the bus.
 */
async function handleSensorAnomaly(payload) {
  const { farmId, sensorType, value, unit } = payload;

  // Route to appropriate observation based on sensor type
  if (sensorType === 'feed_consumption') {
    const animalCount = await Animal.countDocuments({ farm: farmId, isActive: true });
    await observeFeedConsumption({
      farmId, byType: { feed_consumption: [{ value, unit }] }, animalCount,
    });
  } else if (sensorType === 'mortality_count') {
    const animalCount = await Animal.countDocuments({ farm: farmId, isActive: true });
    const sickAnimals = await Animal.countDocuments({ farm: farmId, healthStatus: 'Sick', isActive: true });
    await observeHealthAndMortality({
      farmId, byType: { mortality_count: [{ value }] }, animalCount, sickAnimals,
    });
  } else if (['temperature', 'humidity'].includes(sensorType)) {
    await observeEnvironment({
      farmId, byType: { [sensorType]: [{ value }] },
    });
  }
}

module.exports = { initialize, runObservationCycle, executeAutonomousAction };
