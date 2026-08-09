const PredictionLog = require('../models/PredictionLog');

exports.savePrediction = async (req, res) => {
  try {
    const { type, inputData, predictionResult } = req.body;
    
    if (!type || !inputData || !predictionResult) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newLog = new PredictionLog({
      type,
      inputData,
      predictionResult
    });

    await newLog.save();
    res.status(201).json({ success: true, data: newLog });
  } catch (error) {
    console.error('Error saving AI prediction:', error);
    res.status(500).json({ success: false, message: 'Server Error saving prediction' });
  }
};
