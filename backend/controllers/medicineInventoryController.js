const MedicineInventory = require('../models/MedicineInventory');
const agentEventBus = require('../agents/orchestrator/agentEventBus');

exports.getAll = async (req, res) => {
  try {
    const data = await MedicineInventory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await MedicineInventory.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await MedicineInventory.create(req.body);
    res.status(201).json({ success: true, data });
    // 🛡️ Farm Integrity Agent: emit event after successful create
    agentEventBus.emit('MEDICINE_USAGE_UPDATED', {
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
    // Capture previous quantity before update (for edit detection)
    const existing = await MedicineInventory.findById(req.params.id).lean();
    const previousQuantity = existing?.quantityUnits;

    const data = await MedicineInventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
    // 🛡️ Farm Integrity Agent: emit event after successful update
    agentEventBus.emit('MEDICINE_USAGE_UPDATED', {
      farmId: data.farm,
      userId: req.user?._id,
      record: data.toObject(),
      previousQuantity,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await MedicineInventory.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
