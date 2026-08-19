/**
 * integrityController.js
 * Handles all API requests for the Farm Integrity Agent.
 */
const InvestigationCase = require('../models/InvestigationCase');
const AnomalyEvent = require('../models/AnomalyEvent');
const AgentAction = require('../models/AgentAction');
const RiskSignal = require('../models/RiskSignal');
const AgentMemoryModel = require('../models/AgentMemory');
const agentMemory = require('../agents/memory/agentMemory');
const agentEventBus = require('../agents/orchestrator/agentEventBus');

// ── GET /api/integrity/incidents ───────────────────────────────────────────
exports.getIncidents = async (req, res) => {
  try {
    const { farmId, status, severity, domain, page = 1, limit = 20 } = req.query;

    const query = {};
    if (farmId) query.farm = farmId;
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (domain) query.domain = domain;

    // Farm admins only see their own farm
    if (req.user.role === 'farm_admin' || req.user.role === 'farm_manager') {
      query.farm = req.user._id?.toString() === req.user.farmId?.toString()
        ? req.user._id
        : req.user.farmId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [incidents, total] = await Promise.all([
      InvestigationCase.find(query)
        .sort({ riskScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('resolvedBy', 'ownerName role')
        .lean(),
      InvestigationCase.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: incidents,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/integrity/incidents/:id ───────────────────────────────────────
exports.getIncidentById = async (req, res) => {
  try {
    const incident = await InvestigationCase.findById(req.params.id)
      .populate('anomalyEvent')
      .populate('resolvedBy', 'ownerName role')
      .populate('assignedTo', 'ownerName role')
      .lean();

    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    // Get all signals for this case
    const signals = await RiskSignal.find({ case: incident._id }).lean();

    // Get agent actions
    const actions = await AgentAction.find({ case: incident._id }).sort({ executedAt: 1 }).lean();

    res.json({ success: true, data: { ...incident, signals, agentActions: actions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/integrity/incidents/:id/decision ────────────────────────────
exports.submitDecision = async (req, res) => {
  try {
    const { decision, reason } = req.body;
    const validDecisions = ['confirmed', 'false_positive', 'needs_more_evidence', 'assigned'];

    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ success: false, message: 'Invalid decision value' });
    }

    const incident = await InvestigationCase.findById(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    incident.humanDecision = decision;
    incident.humanReason = reason;
    incident.resolvedBy = req.user._id;
    incident.resolvedAt = new Date();
    incident.status = decision === 'needs_more_evidence' ? 'under_investigation' : 'resolved';

    // If releasing a freeze on false positive
    if (decision === 'false_positive' && incident.isFrozen) {
      incident.isFrozen = false;
    }

    await incident.save();

    // Store in agent memory for future learning
    if (decision === 'confirmed' || decision === 'false_positive') {
      const signals = await RiskSignal.find({ case: incident._id }).lean();
      const signalTypes = signals.map(s => s.signalType);

      await agentMemory.storeOutcome({
        farmId: incident.farm,
        domain: incident.domain,
        signalTypes,
        humanDecision: decision,
        humanReason: reason,
        riskScore: incident.riskScore,
        caseId: incident._id,
      });
    }

    // Log the human decision as an agent action
    await AgentAction.create({
      case: incident._id,
      farm: incident.farm,
      actionType: 'CLOSE_CASE',
      payload: { decision, reason, decidedBy: req.user._id },
      success: true,
    });

    res.json({ success: true, data: incident, message: 'Decision recorded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/integrity/stats ───────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const query = {};

    // Farm-level filter
    if (req.user.role === 'farm_admin' || req.user.role === 'farm_manager') {
      query.farm = req.user.farmId || req.user._id;
    }

    const [
      totalIncidents,
      openIncidents,
      criticalIncidents,
      confirmedFraud,
      falsePositives,
      recentActions,
      memoryStats,
    ] = await Promise.all([
      InvestigationCase.countDocuments(query),
      InvestigationCase.countDocuments({ ...query, status: 'open' }),
      InvestigationCase.countDocuments({ ...query, severity: 'Critical' }),
      InvestigationCase.countDocuments({ ...query, humanDecision: 'confirmed' }),
      InvestigationCase.countDocuments({ ...query, humanDecision: 'false_positive' }),
      AgentAction.find(query).sort({ executedAt: -1 }).limit(10).lean(),
      agentMemory.getMemoryStats(query.farm),
    ]);

    // Risk score by domain
    const domainStats = await InvestigationCase.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 },
          avgRisk: { $avg: '$riskScore' },
          maxRisk: { $max: '$riskScore' },
        },
      },
    ]);

    // Agent bus stats
    const busStats = agentEventBus.getStats();

    res.json({
      success: true,
      data: {
        totalIncidents,
        openIncidents,
        criticalIncidents,
        confirmedFraud,
        falsePositives,
        precision: totalIncidents > 0 ? ((confirmedFraud / totalIncidents) * 100).toFixed(1) : 0,
        domainStats,
        recentActions,
        memoryStats,
        agentStats: busStats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/integrity/anomalies ───────────────────────────────────────────
exports.getAnomalies = async (req, res) => {
  try {
    const { farmId, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (farmId) query.farm = farmId;
    if (status) query.status = status;

    if (req.user.role === 'farm_admin' || req.user.role === 'farm_manager') {
      query.farm = req.user.farmId || req.user._id;
    }

    const [events, total] = await Promise.all([
      AnomalyEvent.find(query)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
      AnomalyEvent.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/integrity/multi-farm ─────────────────────────────────────────
// For Overall Admin — see all farms and their risk levels
exports.getMultiFarmOverview = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const farmRisks = await InvestigationCase.aggregate([
      { $match: { status: { $in: ['open', 'pending_review', 'under_investigation'] } } },
      {
        $group: {
          _id: '$farm',
          avgRisk: { $avg: '$riskScore' },
          maxRisk: { $max: '$riskScore' },
          openCases: { $sum: 1 },
          criticalCases: { $sum: { $cond: [{ $gte: ['$riskScore', 85] }, 1, 0] } },
        },
      },
      { $sort: { maxRisk: -1 } },
    ]);

    res.json({ success: true, data: farmRisks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/integrity/trigger (Manual test trigger) ─────────────────────
exports.manualTrigger = async (req, res) => {
  try {
    if (!['admin', 'farm_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { eventType, payload } = req.body;
    agentEventBus.emit(eventType, { ...payload, farmId: payload.farmId || req.user._id });

    res.json({ success: true, message: `Event ${eventType} emitted to agent pipeline` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
