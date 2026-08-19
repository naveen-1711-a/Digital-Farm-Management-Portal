const mongoose = require('mongoose');

const agentActionSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestigationCase' },
    anomalyEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'AnomalyEvent' },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actionType: {
      type: String,
      enum: [
        'STORE_ANOMALY',
        'CREATE_MONITORING_TASK',
        'NOTIFY_MANAGER',
        'NOTIFY_ADMIN',
        'FREEZE_RECORD',
        'CREATE_INVESTIGATION',
        'ESCALATE',
        'REQUEST_APPROVAL',
        'RELEASE_FREEZE',
        'CLOSE_CASE',
      ],
      required: true,
    },
    payload: { type: mongoose.Schema.Types.Mixed }, // action-specific data
    triggeredByScore: { type: Number }, // risk score that triggered this action
    success: { type: Boolean, default: true },
    errorMessage: { type: String },
    executedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

agentActionSchema.index({ farm: 1, actionType: 1, executedAt: -1 });
agentActionSchema.index({ case: 1 });

module.exports = mongoose.model('AgentAction', agentActionSchema);
