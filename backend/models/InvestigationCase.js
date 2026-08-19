const mongoose = require('mongoose');

let caseCounter = 0;

const investigationCaseSchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    incidentId: { type: String, unique: true }, // e.g. MED-2026-00001
    anomalyEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'AnomalyEvent' },
    domain: {
      type: String,
      enum: ['Medicine', 'Feed', 'Attendance', 'Animal', 'Vaccination', 'Biosecurity', 'Inventory', 'Audit'],
      required: true,
    },
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    mlAnomalyScore: { type: Number, default: null }, // from Isolation Forest
    severity: {
      type: String,
      enum: ['Normal', 'Low', 'Medium', 'High', 'Critical'],
      default: 'Normal',
    },
    classification: {
      type: String,
      enum: ['Unclassified', 'Suspicious', 'False Positive', 'Confirmed Fraud', 'Operational Error'],
      default: 'Unclassified',
    },
    confidence: { type: Number, min: 0, max: 1, default: 0 }, // 0.0 – 1.0
    evidence: [
      {
        type: { type: String }, // e.g. 'quantity_anomaly', 'no_prescription', 'after_hours'
        description: { type: String },
        points: { type: Number },
        sourceModel: { type: String },
        sourceId: { type: mongoose.Schema.Types.ObjectId },
      },
    ],
    crossModuleFindings: [
      {
        module: { type: String },
        finding: { type: String },
        supports: { type: String, enum: ['suspicious', 'legitimate', 'neutral'] },
      },
    ],
    recommendedAction: {
      type: String,
      enum: ['STORE_ONLY', 'MONITOR', 'MANAGER_REVIEW', 'ADMIN_REVIEW', 'FREEZE_AND_ESCALATE'],
      default: 'STORE_ONLY',
    },
    status: {
      type: String,
      enum: ['open', 'pending_review', 'under_investigation', 'resolved', 'dismissed'],
      default: 'open',
    },
    // Human-in-the-loop
    humanDecision: {
      type: String,
      enum: ['pending', 'confirmed', 'false_positive', 'needs_more_evidence', 'assigned'],
      default: 'pending',
    },
    humanReason: { type: String },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    agentNotes: { type: String }, // LLM-generated narrative (Phase 2)
    isFrozen: { type: Boolean, default: false }, // record is frozen pending review
  },
  { timestamps: true }
);

// Auto-generate incidentId before save
investigationCaseSchema.pre('save', async function (next) {
  if (!this.incidentId) {
    const prefix = (this.domain || 'GEN').substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const count = await mongoose.model('InvestigationCase').countDocuments();
    this.incidentId = `${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

investigationCaseSchema.index({ farm: 1, status: 1, riskScore: -1 });
// Note: incidentId index omitted here — already covered by unique:true in schema field

module.exports = mongoose.model('InvestigationCase', investigationCaseSchema);
