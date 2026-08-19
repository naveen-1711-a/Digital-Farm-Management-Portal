const mongoose = require('mongoose');

const riskSignalSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestigationCase', required: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    signalType: {
      type: String,
      enum: [
        'quantity_anomaly',
        'no_prescription',
        'no_disease_increase',
        'record_modified',
        'after_hours_entry',
        'large_quantity_change',
        'previous_anomalies',
        'behavior_deviation',
        'stock_mismatch',
        'missing_cross_record',
        'ml_isolation_forest',
        'duplicate_entry',
        'impossible_hours',
        'missing_ppe',
        'no_vaccine_stock_deducted',
        'suspicious_edit_pattern',
        'mortality_spike',
        'impossible_weight',
      ],
      required: true,
    },
    description: { type: String, required: true },
    points: { type: Number, required: true },
    source: { type: String }, // which detector/module generated this
    metadata: { type: mongoose.Schema.Types.Mixed }, // extra context (e.g. actual vs expected value)
  },
  { timestamps: true }
);

riskSignalSchema.index({ case: 1 });

module.exports = mongoose.model('RiskSignal', riskSignalSchema);
