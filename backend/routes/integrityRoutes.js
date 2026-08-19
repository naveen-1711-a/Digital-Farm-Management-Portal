const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getIncidents,
  getIncidentById,
  submitDecision,
  getStats,
  getAnomalies,
  getMultiFarmOverview,
  manualTrigger,
} = require('../controllers/integrityController');

// All integrity routes require authentication
router.use(protect);

// ── Incidents ────────────────────────────────────────────────────────────────
router.get('/incidents', getIncidents);
router.get('/incidents/:id', getIncidentById);
router.patch('/incidents/:id/decision', submitDecision);

// ── Statistics & Overview ────────────────────────────────────────────────────
router.get('/stats', getStats);
router.get('/anomalies', getAnomalies);
router.get('/multi-farm', getMultiFarmOverview);

// ── Manual trigger (admin/farm_admin only, for testing) ──────────────────────
router.post('/trigger', manualTrigger);

module.exports = router;
