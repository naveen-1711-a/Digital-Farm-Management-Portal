/**
 * farmGuardController.js
 * API endpoints for FarmGuard AI autonomous agent.
 */
const AutonomousAction = require('../models/AutonomousAction');
const SensorEvent = require('../models/SensorEvent');
const { runImmediateCycle } = require('../agents/autonomous/agentScheduler');
const { triggerFarmCycle } = require('../agents/autonomous/sensorSimulator');
const { executeAutonomousAction } = require('../agents/autonomous/farmGuardAgent');

// ── GET /api/farmguard/actions ─────────────────────────────────────────────
exports.getActions = async (req, res) => {
  try {
    const { status, level, farmId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'farm_admin' || req.user.role === 'farm_manager') {
      query.farm = req.user.farmId || req.user._id;
    } else if (farmId) {
      query.farm = farmId;
    }

    if (status) query.status = status;
    if (level) query.automationLevel = parseInt(level);

    const [actions, total] = await Promise.all([
      AutonomousAction.find(query)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
      AutonomousAction.countDocuments(query),
    ]);

    res.json({ success: true, data: actions, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/farmguard/actions/pending ─────────────────────────────────────
exports.getPendingApprovals = async (req, res) => {
  try {
    const farmId = req.user.farmId || req.user._id;
    const pending = await AutonomousAction.find({
      farm: farmId,
      status: 'pending_approval',
      automationLevel: 3,
    }).sort({ createdAt: -1 }).lean();

    res.json({ success: true, data: pending, count: pending.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/farmguard/actions/:id/approve ───────────────────────────────
exports.approveAction = async (req, res) => {
  try {
    const action = await AutonomousAction.findById(req.params.id);
    if (!action) return res.status(404).json({ success: false, message: 'Action not found' });
    if (action.status !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Action is not pending approval' });
    }

    action.status = 'approved';
    action.approvedBy = req.user._id;
    action.approvedAt = new Date();
    await action.save();

    res.json({ success: true, data: action, message: 'Action approved and queued for execution' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/farmguard/actions/:id/reject ────────────────────────────────
exports.rejectAction = async (req, res) => {
  try {
    const { reason } = req.body;
    const action = await AutonomousAction.findById(req.params.id);
    if (!action) return res.status(404).json({ success: false, message: 'Action not found' });

    action.status = 'rejected';
    action.approvedBy = req.user._id;
    action.approvedAt = new Date();
    action.rejectionReason = reason || 'Rejected by user';
    await action.save();

    res.json({ success: true, data: action, message: 'Action rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/farmguard/sensors ─────────────────────────────────────────────
exports.getSensorData = async (req, res) => {
  try {
    const farmId = req.user.farmId || req.user._id;
    const { sensorType, hours = 24 } = req.query;

    const since = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);
    const query = { farm: farmId, createdAt: { $gte: since } };
    if (sensorType) query.sensorType = sensorType;

    const data = await SensorEvent.find(query).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/farmguard/sensors/latest ─────────────────────────────────────
exports.getLatestReadings = async (req, res) => {
  try {
    const farmId = req.user.farmId || req.user._id;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const readings = await SensorEvent.aggregate([
      { $match: { farm: farmId, createdAt: { $gte: oneHourAgo } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$sensorType', latestValue: { $first: '$value' }, unit: { $first: '$unit' }, isAnomaly: { $first: '$isAnomaly' }, ts: { $first: '$createdAt' } } },
    ]);

    res.json({ success: true, data: readings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/farmguard/stats ───────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const farmId = req.user.farmId || req.user._id;

    const [totalActions, l1Count, l2Count, l3Count, pendingApprovals, totalSensorEvents, anomalousSensors] = await Promise.all([
      AutonomousAction.countDocuments({ farm: farmId }),
      AutonomousAction.countDocuments({ farm: farmId, automationLevel: 1 }),
      AutonomousAction.countDocuments({ farm: farmId, automationLevel: 2 }),
      AutonomousAction.countDocuments({ farm: farmId, automationLevel: 3 }),
      AutonomousAction.countDocuments({ farm: farmId, status: 'pending_approval' }),
      SensorEvent.countDocuments({ farm: farmId }),
      SensorEvent.countDocuments({ farm: farmId, isAnomaly: true }),
    ]);

    // Actions by trigger type
    const byTrigger = await AutonomousAction.aggregate([
      { $match: { farm: farmId } },
      { $group: { _id: '$triggerType', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalActions, l1Count, l2Count, l3Count,
        pendingApprovals, totalSensorEvents, anomalousSensors,
        anomalyRate: totalSensorEvents > 0 ? ((anomalousSensors / totalSensorEvents) * 100).toFixed(1) : 0,
        byTrigger,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/farmguard/run-cycle ──────────────────────────────────────────
exports.runCycle = async (req, res) => {
  try {
    if (!['admin', 'farm_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const farmId = (req.body.farmId || req.user._id).toString();

    // Run async, respond immediately
    setImmediate(() => runImmediateCycle(farmId));

    res.json({ success: true, message: 'FarmGuard AI cycle started', farmId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/farmguard/simulate-sensors ──────────────────────────────────
exports.simulateSensors = async (req, res) => {
  try {
    if (!['admin', 'farm_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const farmId = (req.body.farmId || req.user._id).toString();
    const readings = await triggerFarmCycle(farmId);

    res.json({ success: true, message: 'Sensor cycle simulated', readingCount: readings?.length || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
