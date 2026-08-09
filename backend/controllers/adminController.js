const User = require('../models/User');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────
// GET /api/admin/pending-approvals  — Get list of pending farms
// ─────────────────────────────────────────────────────────────
const getPendingApprovals = async (req, res) => {
  try {
    const pendingFarms = await User.find({ role: 'farm_admin', status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: pendingFarms });
  } catch (error) {
    console.error('Pending approvals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending approvals' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/approve-farm/:id  — Approve a farm
// ─────────────────────────────────────────────────────────────
const approveFarm = async (req, res) => {
  try {
    const { id } = req.params;
    
    const farm = await User.findById(id);
    if (!farm || farm.role !== 'farm_admin') {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    if (farm.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Farm is already approved' });
    }

    farm.status = 'approved';
    await farm.save();

    // Create a notification for the farm
    await Notification.create({
      recipient: farm._id,
      farm: farm._id,
      type: 'Farm Approval',
      title: 'Farm Registration Approved',
      message: 'Your farm registration has been approved successfully. You can now log in and access all features.',
      priority: 'High'
    });

    res.json({ success: true, message: 'Farm approved successfully' });
  } catch (error) {
    console.error('Approve farm error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve farm' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/reject-farm/:id  — Reject a farm
// ─────────────────────────────────────────────────────────────
const rejectFarm = async (req, res) => {
  try {
    const { id } = req.params;
    
    const farm = await User.findById(id);
    if (!farm || farm.role !== 'farm_admin') {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    if (farm.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Farm is already rejected' });
    }

    farm.status = 'rejected';
    await farm.save();

    res.json({ success: true, message: 'Farm rejected successfully' });
  } catch (error) {
    console.error('Reject farm error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject farm' });
  }
};

module.exports = {
  getPendingApprovals,
  approveFarm,
  rejectFarm
};
