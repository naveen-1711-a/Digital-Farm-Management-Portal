const FeedInventory = require('../models/FeedInventory');
const agentEventBus = require('../agents/orchestrator/agentEventBus');

exports.getAll = async (req, res) => {
  try {
    const data = await FeedInventory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await FeedInventory.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await FeedInventory.create(req.body);
    res.status(201).json({ success: true, data });
    // 🛡️ Farm Integrity Agent: emit event after successful create
    agentEventBus.emit('FEED_USAGE_UPDATED', {
      farmId: data.farm,
      userId: req.user?._id,
      record: data.toObject(),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const existing = await FeedInventory.findById(req.params.id).lean();
    const previousQuantity = existing?.quantity;

    const data = await FeedInventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
    // 🛡️ Farm Integrity Agent: emit with previous quantity for delta analysis
    agentEventBus.emit('FEED_USAGE_UPDATED', {
      farmId: data.farm,
      userId: req.user?._id,
      record: data.toObject(),
      previousQuantity,
      adjustmentQty: data.quantity,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await FeedInventory.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
