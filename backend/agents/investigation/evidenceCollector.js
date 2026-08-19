/**
 * evidenceCollector.js
 * Tool functions available to the Investigation Agent.
 * Each function gathers specific data from one module.
 */
const MedicineInventory = require('../../models/MedicineInventory');
const FeedInventory = require('../../models/FeedInventory');
const Attendance = require('../../models/Attendance');
const Animal = require('../../models/Animal');
const Vaccination = require('../../models/Vaccination');
const Disease = require('../../models/Disease');
const InvestigationCase = require('../../models/InvestigationCase');
const AnomalyEvent = require('../../models/AnomalyEvent');
const BehaviorProfile = require('../../models/BehaviorProfile');

const LOOKBACK_DAYS = 30;

function lookbackDate(days = LOOKBACK_DAYS) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ── MEDICINE ─────────────────────────────────────────────────────────────────

async function getMedicineHistory(farmId, medicineName, days = LOOKBACK_DAYS) {
  const query = { farm: farmId, updatedAt: { $gte: lookbackDate(days) } };
  if (medicineName) query.medicineName = { $regex: medicineName, $options: 'i' };
  return MedicineInventory.find(query).sort({ updatedAt: -1 }).limit(50).lean();
}

async function getMedicineInventoryStatus(farmId) {
  return MedicineInventory.find({ farm: farmId, isActive: true }).lean();
}

// ── FEED ──────────────────────────────────────────────────────────────────────

async function getFeedHistory(farmId, days = LOOKBACK_DAYS) {
  return FeedInventory.find({
    farm: farmId,
    updatedAt: { $gte: lookbackDate(days) },
    isActive: true,
  }).sort({ updatedAt: -1 }).limit(50).lean();
}

// ── ANIMALS ───────────────────────────────────────────────────────────────────

async function getAnimalHealth(farmId) {
  const total = await Animal.countDocuments({ farm: farmId, isActive: true });
  const sick = await Animal.countDocuments({ farm: farmId, healthStatus: 'Sick', isActive: true });
  const deceased = await Animal.countDocuments({ farm: farmId, healthStatus: 'Deceased' });
  const recovered = await Animal.countDocuments({ farm: farmId, healthStatus: 'Recovered', isActive: true });
  return { total, sick, deceased, recovered, healthyPercent: total > 0 ? ((total - sick) / total * 100).toFixed(1) : 100 };
}

async function getFarmStatistics(farmId) {
  const animalHealth = await getAnimalHealth(farmId);
  const feedItems = await FeedInventory.countDocuments({ farm: farmId, isActive: true });
  const medicineItems = await MedicineInventory.countDocuments({ farm: farmId, isActive: true });
  return { animalHealth, feedItems, medicineItems };
}

// ── DISEASE ───────────────────────────────────────────────────────────────────

async function getDiseaseRecords(farmId, days = 30) {
  return Disease.find({
    farm: farmId,
    createdAt: { $gte: lookbackDate(days) },
  }).sort({ createdAt: -1 }).limit(20).lean();
}

// ── ATTENDANCE / WORKER ───────────────────────────────────────────────────────

async function getWorkerHistory(farmId, workerId, days = 30) {
  const query = { farm: farmId, updatedAt: { $gte: lookbackDate(days) } };
  if (workerId) query.worker = workerId;
  return Attendance.find(query).sort({ date: -1 }).limit(60).lean();
}

async function getAttendanceHistory(farmId, days = 14) {
  return Attendance.find({
    farm: farmId,
    date: { $gte: lookbackDate(days) },
  }).sort({ date: -1 }).lean();
}

// ── VACCINATION ───────────────────────────────────────────────────────────────

async function getVaccinationRecords(farmId, days = 30) {
  return Vaccination.find({
    farm: farmId,
    updatedAt: { $gte: lookbackDate(days) },
  }).sort({ updatedAt: -1 }).limit(50).lean();
}

// ── BEHAVIOR PROFILE ─────────────────────────────────────────────────────────

async function getWorkerBehaviorProfile(farmId, workerId) {
  if (!workerId) return null;
  return BehaviorProfile.findOne({ farm: farmId, worker: workerId }).lean();
}

// ── INCIDENT HISTORY ─────────────────────────────────────────────────────────

async function getSimilarIncidents(farmId, domain, days = 90) {
  return InvestigationCase.find({
    farm: farmId,
    domain,
    createdAt: { $gte: lookbackDate(days) },
  }).sort({ createdAt: -1 }).limit(10).lean();
}

async function getPreviousAnomalies(farmId, workerId) {
  const query = { farm: farmId };
  if (workerId) query.triggeredBy = workerId;
  return AnomalyEvent.find(query).sort({ createdAt: -1 }).limit(20).lean();
}

module.exports = {
  getMedicineHistory,
  getMedicineInventoryStatus,
  getFeedHistory,
  getAnimalHealth,
  getFarmStatistics,
  getDiseaseRecords,
  getWorkerHistory,
  getAttendanceHistory,
  getVaccinationRecords,
  getWorkerBehaviorProfile,
  getSimilarIncidents,
  getPreviousAnomalies,
};
