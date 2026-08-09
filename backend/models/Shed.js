const mongoose = require('mongoose');

const shedSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  number: { type: String, required: true, trim: true },
  type: { type: String, trim: true },
  animalType: { type: String, trim: true },
  capacity: { type: Number, required: true, default: 0 },
  currentAnimals: { type: Number, default: 0 },
  length: { type: Number },
  width: { type: Number },
  area: { type: Number },
  constructionDate: { type: Date },
  managerInCharge: { type: String, trim: true },
  waterConnection: { type: String, trim: true },
  electricityConnection: { type: String, trim: true },
  ventilationType: { type: String, trim: true },
  status: { type: String, default: 'Active' },
  remarks: { type: String, trim: true },
  
  // Automations & Logs
  lastCleanedDate: { type: Date },
  nextCleaningDate: { type: Date },
  lastSanitizedDate: { type: Date },
  nextSanitizationDate: { type: Date },
  
  temperature: { type: Number },
  humidity: { type: Number },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Shed', shedSchema);
