/**
 * AutonomousAction.js
 * Stores actions taken autonomously by FarmGuard AI at each automation level.
 * Level 1 = fully automatic (no human)
 * Level 2 = automatic + notification
 * Level 3 = prepared for human approval
 */
const mongoose = require('mongoose');

const autonomousActionSchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shed: { type: String },
    // What triggered this action
    triggerType: {
      type: String,
      enum: [
        'sensor_anomaly', 'feed_deviation', 'health_alert', 'disease_risk',
        'mortality_spike', 'vaccination_due', 'biosecurity_breach',
        'inventory_mismatch', 'attendance_auto', 'environmental_alert',
      ],
      required: true,
    },
    triggerData: { type: mongoose.Schema.Types.Mixed }, // the sensor/event data that triggered this
    // Action details
    actionType: {
      type: String,
      enum: [
        // Level 1 — Fully automatic
        'auto_record_feed', 'auto_update_inventory', 'auto_mark_attendance',
        'auto_schedule_vaccination', 'auto_generate_report', 'auto_create_task',
        // Level 2 — Automatic + notify
        'notify_vet', 'notify_manager', 'flag_for_monitoring',
        'increase_sensor_polling', 'auto_investigation',
        // Level 3 — Requires human approval
        'request_quarantine', 'request_isolation', 'declare_outbreak',
        'block_access', 'emergency_vet_call',
      ],
      required: true,
    },
    automationLevel: { type: Number, enum: [1, 2, 3], required: true },
    // AI reasoning (from Groq)
    aiReasoning: { type: String }, // Groq's explanation text
    groqModel: { type: String, default: 'llama-3.1-8b-instant' },
    // Execution
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'executed', 'rejected', 'failed'],
      default: 'executed',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    executionResult: { type: mongoose.Schema.Types.Mixed },
    // Risk
    riskScore: { type: Number, min: 0, max: 100 },
    confidence: { type: Number, min: 0, max: 1 },
    relatedCase: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestigationCase' },
  },
  { timestamps: true }
);

autonomousActionSchema.index({ farm: 1, status: 1, createdAt: -1 });
autonomousActionSchema.index({ farm: 1, automationLevel: 1 });

module.exports = mongoose.model('AutonomousAction', autonomousActionSchema);
