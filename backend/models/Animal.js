const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema(
  {
    tagId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, trim: true },
    species: {
      type: String,
      enum: ['Pig', 'Poultry'],
      required: true,
    },
    breed: { type: String, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Unknown' },
    dateOfBirth: { type: Date },
    weight: { type: Number },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shed: { type: String },
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Sick', 'Recovered', 'Deceased'],
      default: 'Healthy',
    },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Animal', animalSchema);
