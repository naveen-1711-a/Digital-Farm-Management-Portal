const Vaccination = require('../models/Vaccination');
const agentEventBus = require('../agents/orchestrator/agentEventBus');

exports.getAll = async (req, res) => {
  try {
    const data = await Vaccination.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await Vaccination.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await Vaccination.create(req.body);
    res.status(201).json({ success: true, data });
    // 🛡️ Farm Integrity Agent: only emit when status is Completed
    if (data.status === 'Completed') {
      agentEventBus.emit('VACCINATION_COMPLETED', {
        farmId: data.farm,
        userId: req.user?._id,
        record: data.toObject(),
      });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Vaccination.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
    // 🛡️ Farm Integrity Agent: emit when marked Completed via update
    if (data.status === 'Completed') {
      agentEventBus.emit('VACCINATION_COMPLETED', {
        farmId: data.farm,
        userId: req.user?._id,
        record: data.toObject(),
      });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await Vaccination.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
