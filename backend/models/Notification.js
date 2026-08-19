const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: [
        'Farm Approval', 'Disease Alert', 'Vaccination Due', 'Medicine Expiring',
        'Feed Low', 'General',
        // Farm Integrity Agent types
        'Integrity Alert', 'Fraud Flag', 'Investigation Required',
        // FarmGuard AI autonomous types
        'Sensor Alert', 'Auto Action', 'FarmGuard Report',
      ],
      default: 'General',
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    // Reference to investigation case if applicable
    relatedCase: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestigationCase' },
    // Automation level that generated this notification
    automationLevel: { type: Number, enum: [1, 2, 3], default: 2 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);

