const mongoose = require('mongoose');

const predictionLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['feed', 'medicine', 'disease'],
    required: true
  },
  inputData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  predictionResult: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PredictionLog', predictionLogSchema);
