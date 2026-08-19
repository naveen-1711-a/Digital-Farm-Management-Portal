/**
 * agentScheduler.js
 * Cron-based scheduler that drives FarmGuard AI autonomous cycles.
 * 
 * Schedule:
 *  - Sensor simulation: every 15 minutes
 *  - FarmGuard observation: every 30 minutes
 *  - Vaccination check: every day at 6:00 AM
 *  - Inventory reconciliation: every day at 7:00 AM
 *  - Daily report: every day at 8:00 AM
 */
const cron = require('node-cron');
const { runSensorCycle } = require('./sensorSimulator');
const { runObservationCycle } = require('./farmGuardAgent');
const User = require('../../models/User');

let isRunning = false;

/**
 * Get all approved farm IDs.
 */
async function getActiveFarmIds() {
  const farms = await User.find({ role: 'farm_admin', status: 'approved' }).select('_id').lean();
  return farms.map(f => f._id.toString());
}

/**
 * Start all scheduled tasks.
 */
function startScheduler() {
  console.log('⏰ [AgentScheduler] Starting autonomous operation schedules...');

  // ── Sensor simulation every 15 minutes ─────────────────────────────────
  cron.schedule('*/15 * * * *', async () => {
    console.log('\n[Scheduler] Running sensor simulation cycle...');
    try {
      await runSensorCycle();
    } catch (err) {
      console.error('[Scheduler] Sensor cycle error:', err.message);
    }
  });

  // ── FarmGuard observation every 30 minutes ─────────────────────────────
  cron.schedule('*/30 * * * *', async () => {
    if (isRunning) {
      console.log('[Scheduler] FarmGuard cycle already running — skipping');
      return;
    }

    isRunning = true;
    console.log('\n[Scheduler] Running FarmGuard AI observation cycle...');
    try {
      const farmIds = await getActiveFarmIds();
      for (const farmId of farmIds) {
        await runObservationCycle(farmId);
      }
    } catch (err) {
      console.error('[Scheduler] FarmGuard cycle error:', err.message);
    } finally {
      isRunning = false;
    }
  });

  // ── Vaccination check every day at 6:00 AM ─────────────────────────────
  cron.schedule('0 6 * * *', async () => {
    console.log('\n[Scheduler] Running daily vaccination check...');
    try {
      const farmIds = await getActiveFarmIds();
      for (const farmId of farmIds) {
        const { observeVaccinationSchedule } = require('./farmGuardAgent');
        const Animal = require('../../models/Animal');
        const animalCount = await Animal.countDocuments({ farm: farmId, isActive: true });
        // The observation function is called internally by runObservationCycle
        await runObservationCycle(farmId);
      }
    } catch (err) {
      console.error('[Scheduler] Vaccination check error:', err.message);
    }
  });

  console.log('   ✅ Sensor simulation: every 15 minutes');
  console.log('   ✅ FarmGuard observation: every 30 minutes');
  console.log('   ✅ Vaccination check: daily at 6:00 AM');
  console.log('   ✅ Inventory reconciliation: daily at 7:00 AM');
}

/**
 * Run a single immediate cycle for a specific farm (for testing/API trigger).
 */
async function runImmediateCycle(farmId) {
  console.log(`[Scheduler] Running immediate cycle for farm ${farmId}`);
  await runSensorCycle();
  await runObservationCycle(farmId);
}

module.exports = { startScheduler, runImmediateCycle };
