const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Farm Information (Required for farm_admin) ─────────────────────────
    farmName: { type: String, trim: true },
    farmType: { type: String, enum: ['Pig Farm', 'Poultry Farm', 'Both'] },
    registrationNumber: { type: String, trim: true, sparse: true },
    farmAddress: { type: String },
    state: { type: String },
    district: { type: String },
    pinCode: { type: String },
    gpsLocation: { type: String },
    farmEmail: { type: String, lowercase: true, trim: true },
    farmPhone: { type: String },
    numberOfSheds: { type: Number },
    approxNumberOfAnimals: { type: Number },
    farmArea: { type: String },
    internetAvailable: { type: String, enum: ['Yes', 'No'] },
    farmPhoto: { type: String, default: null },

    // ── Common/Owner Information ──────────────────────────────────────────
    ownerName: { type: String, required: [true, 'Name is required'], trim: true },
    aadhaarNumber: { type: String, sparse: true },
    ownerEmail: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    ownerPhone: { type: String, required: true },
    ownerPhoto: { type: String, default: null },

    // ── Documents ─────────────────────────────────────────────────
    aadhaarCard: { type: String, default: null },
    scheduleOfProperty: { type: String, default: null },

    // ── Manager/Worker Specific Information ───────────────────────
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employeeId: { type: String, sparse: true },
    gender: { type: String },
    dob: { type: Date },
    emergencyContact: { type: String },
    joiningDate: { type: Date },
    employmentType: { type: String },
    assignedSheds: [{ type: String }],
    shift: { type: String },
    permissions: {
      animalManagement: { type: Boolean, default: false },
      vaccinationManagement: { type: Boolean, default: false },
      feedInventory: { type: Boolean, default: false },
      medicineInventory: { type: Boolean, default: false },
      workerManagement: { type: Boolean, default: false },
      attendanceManagement: { type: Boolean, default: false },
      taskAssignment: { type: Boolean, default: false },
      diseaseMonitoring: { type: Boolean, default: false },
      biosecurityManagement: { type: Boolean, default: false },
      viewReports: { type: Boolean, default: false }
    },

    // ── Account Security ──────────────────────────────────────────
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },

    // ── Role & Status ─────────────────────────────────────────────
    role: {
      type: String,
      enum: ['farm_admin', 'farm_manager', 'admin', 'worker', 'veterinarian'],
      default: 'farm_admin',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'Active', 'Inactive'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
