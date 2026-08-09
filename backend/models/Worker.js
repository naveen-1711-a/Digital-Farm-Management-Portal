const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    employeeId: { type: String, unique: true, trim: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, trim: true },
    phone: { type: String },
    email: { type: String, lowercase: true, trim: true },
    joiningDate: { type: Date },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
    photo: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);
