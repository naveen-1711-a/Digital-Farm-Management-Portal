const mongoose = require('mongoose');

const medicineInventorySchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    medicineName: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    quantityUnits: { type: Number, default: 0 },
    minimumStock: { type: Number, default: 10 },
    expiryDate: { type: Date },
    manufacturer: { type: String, trim: true },
    batchNumber: { type: String, trim: true },
    pricePerUnit: { type: Number },
    status: {
      type: String,
      enum: ['Adequate', 'Low', 'Expiring Soon', 'Expired'],
      default: 'Adequate',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicineInventory', medicineInventorySchema);
