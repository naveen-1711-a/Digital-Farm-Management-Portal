const express = require('express');
const router = express.Router();
const { getFarmDashboardData } = require('../controllers/farmDashboardController');
const { addFarmManager, getFarmManagers } = require('../controllers/farmManagerController');
const { protect } = require('../middleware/authMiddleware');

// Route to get all farm dashboard data in one go
// Using protect middleware so req.user is available (temporarily removed for testing)
router.get('/data', getFarmDashboardData);
router.post('/managers', protect, addFarmManager);
router.get('/managers', protect, getFarmManagers);

module.exports = router;
