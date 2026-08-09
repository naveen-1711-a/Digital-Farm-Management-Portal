const mongoose = require('mongoose');

const feedInventorySchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    type: { type: String, trim: true },
    brand: { type: String, trim: true },
    batchNumber: { type: String, trim: true },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' },
    minStock: { type: Number, default: 0 },
    purchaseDate: { type: Date },
    mfgDate: { type: Date },
    expDate: { type: Date },
    supplier: { type: String, trim: true },
    purchasePrice: { type: Number },
    totalCost: { type: Number },
    location: { type: String },
    status: { type: String },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeedInventory', feedInventorySchema);
