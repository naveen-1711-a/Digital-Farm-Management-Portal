const mongoose = require('mongoose');

const agentMemorySchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    incidentType: { type: String, required: true }, // domain + pattern key
    // Compressed signal fingerprint for similarity matching
    signalFingerprint: [{ type: String }], // e.g. ['quantity_anomaly','no_prescription','after_hours']
    humanDecision: {
      type: String,
      enum: ['confirmed', 'false_positive', 'operational_error'],
      required: true,
    },
    humanReason: { type: String },
    riskScoreAtDecision: { type: Number },
    // Learning weight: increases each time this memory matches a new case
    matchCount: { type: Number, default: 0 },
    // Bias adjustment: how much to adjust future similar cases
    // positive = boost risk, negative = reduce risk
    scoreBias: { type: Number, default: 0 },
    relatedCase: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestigationCase' },
  },
  { timestamps: true }
);

agentMemorySchema.index({ farm: 1, incidentType: 1 });
agentMemorySchema.index({ signalFingerprint: 1 });

module.exports = mongoose.model('AgentMemory', agentMemorySchema);
