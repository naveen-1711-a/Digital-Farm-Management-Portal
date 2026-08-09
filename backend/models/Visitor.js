const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    visitorName: { type: String, required: true, trim: true },
    purpose: { type: String, trim: true },
    phone: { type: String },
    idProof: { type: String },
    checkInTime: { type: Date, default: Date.now },
    checkOutTime: { type: Date },
    status: {
      type: String,
      enum: ['Checked In', 'Checked Out'],
      default: 'Checked In',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visitor', visitorSchema);
