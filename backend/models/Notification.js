const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['Farm Approval', 'Disease Alert', 'Vaccination Due', 'Medicine Expiring', 'Feed Low', 'General'],
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
