const mongoose = require('mongoose');

const veterinarianSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    licenseNumber: { type: String, unique: true, trim: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    specialization: { type: String },
    phone: { type: String },
    email: { type: String, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Veterinarian', veterinarianSchema);
