const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getActions,
  getPendingApprovals,
  approveAction,
  rejectAction,
  getSensorData,
  getLatestReadings,
  getStats,
  runCycle,
  simulateSensors,
} = require('../controllers/farmGuardController');

router.use(protect);

// ── Autonomous actions ────────────────────────────────────────────────────────
router.get('/actions', getActions);
router.get('/actions/pending', getPendingApprovals);
router.patch('/actions/:id/approve', approveAction);
router.patch('/actions/:id/reject', rejectAction);

// ── Sensor telemetry ──────────────────────────────────────────────────────────
router.get('/sensors', getSensorData);
router.get('/sensors/latest', getLatestReadings);

// ── Stats & control ────────────────────────────────────────────────────────────
router.get('/stats', getStats);
router.post('/run-cycle', runCycle);
router.post('/simulate-sensors', simulateSensors);

module.exports = router;
