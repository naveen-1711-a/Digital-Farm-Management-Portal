const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getDashboardCharts,
  getRecentActivities,
  getDashboardNotifications,
} = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.get('/stats', protect, getDashboardStats);
router.get('/charts', protect, getDashboardCharts);
router.get('/recent-activities', protect, getRecentActivities);
router.get('/notifications', protect, getDashboardNotifications);

module.exports = router;
