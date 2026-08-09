const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema(
  {
    animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal' },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    diseaseName: { type: String, required: true, trim: true },
    symptoms: [{ type: String }],
    diagnosedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    diagnosedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Active', 'Recovered', 'Deceased'],
      default: 'Active',
    },
    treatmentNotes: { type: String },
    resolvedDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Disease', diseaseSchema);
