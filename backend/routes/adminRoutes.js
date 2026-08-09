const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPendingApprovals,
  approveFarm,
  rejectFarm
} = require('../controllers/adminController');

// All admin routes require authentication (and ideally an admin role check, but using protect for now)
router.get('/pending-approvals', protect, getPendingApprovals);
router.put('/approve-farm/:id', protect, approveFarm);
router.put('/reject-farm/:id', protect, rejectFarm);

module.exports = router;
