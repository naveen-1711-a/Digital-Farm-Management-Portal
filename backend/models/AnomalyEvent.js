const mongoose = require('mongoose');

const anomalyEventSchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventType: {
      type: String,
      enum: [
        'MEDICINE_USAGE_UPDATED',
        'FEED_USAGE_UPDATED',
        'ATTENDANCE_MARKED',
        'ANIMAL_UPDATED',
        'VACCINATION_COMPLETED',
        'INVENTORY_ADJUSTED',
        'VISITOR_REGISTERED',
        'AUDIT_LOG_CREATED',
      ],
      required: true,
    },
    detectorName: { type: String, required: true }, // e.g. 'medicineDetector'
    sourceModel: { type: String }, // e.g. 'MedicineInventory'
    sourceId: { type: mongoose.Schema.Types.ObjectId }, // the record that triggered
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // user who made the record
    description: { type: String, required: true },
    rawData: { type: mongoose.Schema.Types.Mixed }, // snapshot of triggering data
    signals: [
      {
        type: { type: String },
        description: { type: String },
        value: { type: mongoose.Schema.Types.Mixed },
        expected: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
    },
    linkedCase: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestigationCase' },
  },
  { timestamps: true }
);

anomalyEventSchema.index({ farm: 1, status: 1 });
anomalyEventSchema.index({ eventType: 1, createdAt: -1 });

module.exports = mongoose.model('AnomalyEvent', anomalyEventSchema);
