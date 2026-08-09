const User = require('../models/User');
const Animal = require('../models/Animal');
const Vaccination = require('../models/Vaccination');
const Disease = require('../models/Disease');
const Worker = require('../models/Worker');
const Veterinarian = require('../models/Veterinarian');
const FeedInventory = require('../models/FeedInventory');
const MedicineInventory = require('../models/MedicineInventory');
const Visitor = require('../models/Visitor');
const Notification = require('../models/Notification');
const Attendance = require('../models/Attendance');

// ─────────────────────────────────────────────────────────────
// GET /api/dashboard/stats  — All overview stat cards
// ─────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    // ── Farm counts ──────────────────────────────────────────
    const [totalFarms, approvedFarms, pendingFarms, rejectedFarms] = await Promise.all([
      User.countDocuments({ role: 'farm_admin' }),
      User.countDocuments({ role: 'farm_admin', status: 'approved' }),
      User.countDocuments({ role: 'farm_admin', status: 'pending' }),
      User.countDocuments({ role: 'farm_admin', status: 'rejected' }),
    ]);

    // ── User count (non-admin) ───────────────────────────────
    const totalUsers = await User.countDocuments();

    // ── Animal counts ────────────────────────────────────────
    const [totalAnimals, pigCount, poultryCount] = await Promise.all([
      Animal.countDocuments({ isActive: true }),
      Animal.countDocuments({ species: 'Pig', isActive: true }),
      Animal.countDocuments({ species: 'Poultry', isActive: true }),
    ]);

    // ── Vaccination counts ───────────────────────────────────
    const [vaccinationsDue, vaccinationsCompleted, vaccinationsOverdue] = await Promise.all([
      Vaccination.countDocuments({ status: 'Due' }),
      Vaccination.countDocuments({ status: 'Completed' }),
      Vaccination.countDocuments({ status: 'Overdue' }),
    ]);

    const totalVaccinations = vaccinationsCompleted + vaccinationsDue + vaccinationsOverdue;
    const vaccinationCompletionPct = totalVaccinations > 0
      ? Math.round((vaccinationsCompleted / totalVaccinations) * 100)
      : 0;

    // ── Disease cases ────────────────────────────────────────
    const activeDiseases = await Disease.countDocuments({ status: 'Active' });

    // ── Feed & Medicine ──────────────────────────────────────
    const feedAgg = await FeedInventory.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalKg: { $sum: '$quantityKg' }, totalCapacity: { $sum: '$capacityKg' } } },
    ]);
    const totalFeedKg = feedAgg[0]?.totalKg ?? 0;
    const totalCapacityKg = feedAgg[0]?.totalCapacity ?? 0;

    const medicineStockStatus = await MedicineInventory.countDocuments({ status: { $in: ['Low', 'Expiring Soon'] }, isActive: true });

    // ── Workers ──────────────────────────────────────────────
    const activeWorkers = await Worker.countDocuments({ status: 'Active' });

    // ── Veterinarians ────────────────────────────────────────
    const vetCount = await Veterinarian.countDocuments({ status: 'Active' });

    // ── Visitors today ────────────────────────────────────────
    const todayVisitors = await Visitor.countDocuments({
      checkInTime: { $gte: startOfToday, $lte: endOfToday },
    });

    // ── Pending notifications ─────────────────────────────────
    const pendingNotifications = await Notification.countDocuments({ isRead: false });

    // ── Attendance today ──────────────────────────────────────
    const todayAttendance = await Attendance.find({
      date: { $gte: startOfToday, $lte: endOfToday },
    });
    const attendancePresent = todayAttendance.filter(a => a.status === 'Present').length;
    const attendanceAbsent = todayAttendance.filter(a => a.status === 'Absent').length;
    const attendanceLeave = todayAttendance.filter(a => a.status === 'Leave').length;

    res.json({
      success: true,
      data: {
        farms: { total: totalFarms, approved: approvedFarms, pending: pendingFarms, rejected: rejectedFarms },
        users: { total: totalUsers },
        animals: { total: totalAnimals, pigs: pigCount, poultry: poultryCount },
        vaccinations: {
          due: vaccinationsDue,
          completed: vaccinationsCompleted,
          overdue: vaccinationsOverdue,
          completionPct: vaccinationCompletionPct,
        },
        diseases: { active: activeDiseases },
        feed: { totalKg: totalFeedKg, capacityKg: totalCapacityKg },
        medicine: { alertCount: medicineStockStatus },
        workers: { active: activeWorkers },
        veterinarians: { count: vetCount },
        visitors: { today: todayVisitors },
        notifications: { pending: pendingNotifications },
        attendance: {
          present: attendancePresent,
          absent: attendanceAbsent,
          leave: attendanceLeave,
          total: todayAttendance.length,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/dashboard/charts  — Chart data
// ─────────────────────────────────────────────────────────────
const getDashboardCharts = async (req, res) => {
  try {
    // ── Monthly farm registration (last 7 months) ────────────
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyRegData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const count = await User.countDocuments({ role: 'farm_admin', createdAt: { $gte: start, $lte: end } });
      monthlyRegData.push({ name: months[d.getMonth()], total: count });
    }

    // ── Animal distribution ───────────────────────────────────
    const [pigCount, poultryCount] = await Promise.all([
      Animal.countDocuments({ species: 'Pig', isActive: true }),
      Animal.countDocuments({ species: 'Poultry', isActive: true }),
    ]);
    const animalDistData = [
      { name: 'Pig', value: pigCount, color: '#f43f5e' },
      { name: 'Poultry', value: poultryCount, color: '#f59e0b' },
    ];

    // ── Vaccination status ────────────────────────────────────
    const [vCompleted, vDue, vOverdue] = await Promise.all([
      Vaccination.countDocuments({ status: 'Completed' }),
      Vaccination.countDocuments({ status: 'Due' }),
      Vaccination.countDocuments({ status: 'Overdue' }),
    ]);
    const vaccinationData = [
      { name: 'Completed', value: vCompleted, color: '#10b981' },
      { name: 'Due', value: vDue, color: '#f59e0b' },
      { name: 'Overdue', value: vOverdue, color: '#ef4444' },
    ];

    // ── Disease monitoring (last 4 weeks) ─────────────────────
    const diseaseData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const [sick, recovered] = await Promise.all([
        Disease.countDocuments({ status: 'Active', createdAt: { $gte: weekStart, $lte: weekEnd } }),
        Disease.countDocuments({ status: 'Recovered', resolvedDate: { $gte: weekStart, $lte: weekEnd } }),
      ]);
      const healthy = await Animal.countDocuments({ healthStatus: 'Healthy', isActive: true });
      diseaseData.push({ name: `Week ${4 - i}`, healthy, sick, recovered });
    }

    // ── Feed usage (last 4 weeks) — aggregate by week ─────────
    const feedData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const agg = await FeedInventory.aggregate([
        { $match: { purchaseDate: { $gte: weekStart, $lte: weekEnd } } },
        { $group: { _id: null, consumed: { $sum: '$quantityKg' } } },
      ]);
      feedData.push({ name: `Week ${4 - i}`, consumed: agg[0]?.consumed ?? 0 });
    }

    // ── Medicine usage (last 4 weeks) ─────────────────────────
    const medData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const agg = await MedicineInventory.aggregate([
        { $match: { createdAt: { $gte: weekStart, $lte: weekEnd } } },
        { $group: { _id: null, consumed: { $sum: '$quantityUnits' } } },
      ]);
      medData.push({ name: `Week ${4 - i}`, consumed: agg[0]?.consumed ?? 0 });
    }

    // ── Attendance today ──────────────────────────────────────
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    const todayAttendance = await Attendance.find({ date: { $gte: startOfToday, $lte: endOfToday } });
    const attendanceData = [
      { name: 'Present', value: todayAttendance.filter(a => a.status === 'Present').length, color: '#10b981' },
      { name: 'Absent', value: todayAttendance.filter(a => a.status === 'Absent').length, color: '#ef4444' },
      { name: 'Leave', value: todayAttendance.filter(a => a.status === 'Leave').length, color: '#f59e0b' },
    ];

    res.json({
      success: true,
      data: {
        monthlyRegData,
        animalDistData,
        vaccinationData,
        diseaseData,
        feedUsageData: feedData,
        medUsageData: medData,
        attendanceData,
      },
    });
  } catch (error) {
    console.error('Dashboard charts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chart data' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/dashboard/recent-activities  — Activity feed
// ─────────────────────────────────────────────────────────────
const getRecentActivities = async (req, res) => {
  try {
    const activities = [];

    // Recent farm registrations
    const recentFarms = await User.find({ role: 'farm_admin' })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('farmName ownerName status createdAt');

    recentFarms.forEach(f => {
      activities.push({
        type: 'farm_registered',
        icon: 'building',
        color: '#059669',
        bg: '#d1fae5',
        message: `New Farm Registered (${f.farmName})`,
        time: f.createdAt,
      });
    });

    // Recent disease reports
    const recentDiseases = await Disease.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('animal', 'name species')
      .select('diseaseName createdAt');

    recentDiseases.forEach(d => {
      activities.push({
        type: 'disease_reported',
        icon: 'bug',
        color: '#dc2626',
        bg: '#fee2e2',
        message: `Disease Reported (${d.diseaseName})`,
        time: d.createdAt,
      });
    });

    // Recent vaccinations
    const recentVaccinations = await Vaccination.find({ status: 'Completed' })
      .sort({ administeredDate: -1 })
      .limit(2)
      .select('vaccineName administeredDate');

    recentVaccinations.forEach(v => {
      activities.push({
        type: 'vaccination_completed',
        icon: 'syringe',
        color: '#ea580c',
        bg: '#ffedd5',
        message: `Vaccination Completed (${v.vaccineName})`,
        time: v.administeredDate || v.createdAt,
      });
    });

    // Recent visitors
    const recentVisitors = await Visitor.find()
      .sort({ checkInTime: -1 })
      .limit(2)
      .select('visitorName purpose checkInTime');

    recentVisitors.forEach(v => {
      activities.push({
        type: 'visitor_entered',
        icon: 'walking',
        color: '#4b5563',
        bg: '#f3f4f6',
        message: `Visitor Entered (${v.visitorName} — ${v.purpose || 'General'})`,
        time: v.checkInTime,
      });
    });

    // Sort by time desc and return top 10
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ success: true, data: activities.slice(0, 10) });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent activities' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/dashboard/notifications  — Unread system notifications
// ─────────────────────────────────────────────────────────────
const getDashboardNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ isRead: false })
      .sort({ createdAt: -1 })
      .limit(10);

    // Supplement with auto-generated alerts if DB is empty
    const alerts = [...notifications];

    const pendingFarms = await User.countDocuments({ role: 'farm_admin', status: 'pending' });
    if (pendingFarms > 0) {
      alerts.unshift({
        _id: 'auto_pending_farms',
        type: 'Farm Approval',
        title: 'Farms Awaiting Approval',
        message: `${pendingFarms} farms are pending your approval`,
        priority: 'High',
        createdAt: new Date(),
      });
    }

    const expiringMeds = await MedicineInventory.countDocuments({ status: 'Expiring Soon', isActive: true });
    if (expiringMeds > 0) {
      alerts.unshift({
        _id: 'auto_expiring_meds',
        type: 'Medicine Expiring',
        title: 'Medicine Expiring Soon',
        message: `${expiringMeds} medicine(s) are expiring soon`,
        priority: 'High',
        createdAt: new Date(),
      });
    }

    const activeDiseases = await Disease.countDocuments({ status: 'Active' });
    if (activeDiseases > 0) {
      alerts.unshift({
        _id: 'auto_disease_alert',
        type: 'Disease Alert',
        title: 'Active Disease Cases',
        message: `${activeDiseases} active disease case(s) require attention`,
        priority: 'Critical',
        createdAt: new Date(),
      });
    }

    const duevaccinations = await Vaccination.countDocuments({ status: { $in: ['Due', 'Overdue'] } });
    if (duevaccinations > 0) {
      alerts.unshift({
        _id: 'auto_vax_due',
        type: 'Vaccination Due',
        title: 'Vaccinations Due',
        message: `${duevaccinations} vaccination(s) are due or overdue`,
        priority: 'Medium',
        createdAt: new Date(),
      });
    }

    const lowFeed = await FeedInventory.countDocuments({
      isActive: true,
      $expr: { $lt: ['$quantityKg', { $multiply: ['$capacityKg', 0.2] }] },
    });
    if (lowFeed > 0) {
      alerts.unshift({
        _id: 'auto_low_feed',
        type: 'General',
        title: 'Feed Stock Low',
        message: `${lowFeed} feed type(s) are running low`,
        priority: 'Medium',
        createdAt: new Date(),
      });
    }

    res.json({ success: true, data: alerts.slice(0, 10) });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardCharts,
  getRecentActivities,
  getDashboardNotifications,
};
