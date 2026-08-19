const mongoose = require('mongoose');

const behaviorProfileSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Login/activity time patterns (24h format)
    avgLoginHour: { type: Number, default: 8 }, // average hour of first daily activity
    loginHourStdDev: { type: Number, default: 2 }, // standard deviation
    // Entry volume patterns
    avgDailyEntries: { type: Number, default: 10 },
    dailyEntriesStdDev: { type: Number, default: 5 },
    // Medicine-specific
    avgMedicineEntriesPerDay: { type: Number, default: 2 },
    medicineEntryStdDev: { type: Number, default: 1 },
    // Edit frequency
    avgEditsPerWeek: { type: Number, default: 1 },
    editStdDev: { type: Number, default: 1 },
    // Quantities (medicine)
    avgMedicineQuantityPerEntry: { type: Number, default: 0 },
    medicineQuantityStdDev: { type: Number, default: 0 },
    // Feed
    avgFeedQuantityPerEntry: { type: Number, default: 0 },
    feedQuantityStdDev: { type: Number, default: 0 },
    // Anomaly history
    anomalyCount: { type: Number, default: 0 },
    lastAnomalyAt: { type: Date },
    // Profile quality
    sampleSize: { type: Number, default: 0 }, // number of records used to build profile
    lastUpdated: { type: Date, default: Date.now },
    isReliable: { type: Boolean, default: false }, // true if sampleSize >= 30
  },
  { timestamps: true }
);

behaviorProfileSchema.index({ worker: 1, farm: 1 }, { unique: true });

module.exports = mongoose.model('BehaviorProfile', behaviorProfileSchema);
