const express = require('express');
const router = express.Router();
const { triggerEmergency, generateAutoReorderPOs, generateAutoVetSchedule } = require('../controllers/automationController');

// Route to trigger autonomous load balancer (temporarily unprotected for ease of testing from frontend)
router.post('/trigger-emergency', triggerEmergency);
router.get('/auto-reorder', generateAutoReorderPOs);
router.post('/auto-vet', generateAutoVetSchedule);

module.exports = router;
