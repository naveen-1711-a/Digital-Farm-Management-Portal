const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema(
  {
    animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal' },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vaccineName: { type: String, required: true, trim: true },
    batchNumber: { type: String, trim: true },
    administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    administeredDate: { type: Date },
    nextDueDate: { type: Date },
    status: {
      type: String,
      enum: ['Completed', 'Due', 'Overdue', 'Scheduled'],
      default: 'Scheduled',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vaccination', vaccinationSchema);
