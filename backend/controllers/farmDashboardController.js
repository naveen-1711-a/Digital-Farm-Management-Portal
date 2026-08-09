const User = require('../models/User');
const Animal = require('../models/Animal');
const FeedInventory = require('../models/FeedInventory');
const MedicineInventory = require('../models/MedicineInventory');
const Vaccination = require('../models/Vaccination');
const Disease = require('../models/Disease');
const Worker = require('../models/Worker');
const Visitor = require('../models/Visitor');
const Notification = require('../models/Notification');

// In a real application, these queries would filter by the Farm Owner's ID (e.g. req.user._id)
// For this connection setup, we will return structured data similar to what the frontend expects.

const getFarmDashboardData = async (req, res) => {
  try {
    // If the user is a manager, they have a farmId linking to the owner.
    // If they are the owner, they use their own _id.
    const farmId = req.user ? (req.user.farmId || req.user._id) : null;
    const filter = farmId ? { farm: farmId, isActive: true } : { isActive: true };
    const baseFilter = farmId ? { farm: farmId } : {};

    // Execute queries in parallel
    const [
      totalAnimals, pigCount, poultryCount, sickAnimals, healthyAnimals,
      vaxDue, vaxDone, feedAgg, medicineCount, activeWorkers, visitors, notifications
    ] = await Promise.all([
      Animal.countDocuments(filter),
      Animal.countDocuments({ ...filter, species: 'Pig' }),
      Animal.countDocuments({ ...filter, species: 'Poultry' }),
      Animal.countDocuments({ ...filter, healthStatus: 'Sick' }),
      Animal.countDocuments({ ...filter, healthStatus: 'Healthy' }),
      Vaccination.countDocuments({ ...baseFilter, status: 'Due' }),
      Vaccination.countDocuments({ ...baseFilter, status: 'Completed' }),
      FeedInventory.aggregate([
        { $match: filter },
        { $group: { _id: null, totalKg: { $sum: '$quantity' } } }
      ]),
      MedicineInventory.countDocuments(filter),
      Worker.countDocuments({ ...baseFilter, status: 'Active' }),
      Visitor.countDocuments(baseFilter),
      farmId ? Notification.find({ recipient: farmId }).sort({ createdAt: -1 }).limit(6) : Promise.resolve([])
    ]);

    const totalFeedKg = feedAgg[0]?.totalKg || 0;
    const feedTons = (totalFeedKg / 1000).toFixed(1);
    const healthScore = totalAnimals > 0 ? Math.round((healthyAnimals / totalAnimals) * 100) : 100;

    // Map notifications to the format frontend expects
    const mappedNotifications = notifications.map(n => ({
      _id: n._id,
      text: n.message,
      type: n.priority === 'High' ? 'danger' : (n.priority === 'Medium' ? 'warning' : 'info')
    }));

    if (mappedNotifications.length === 0) {
      mappedNotifications.push({ _id: 'welcome_1', text: "Welcome to your Farm Dashboard!", type: "info" });
    }

    res.json({
      success: true,
      data: {
        overview: {
          healthScore: healthScore,
          farmName: req.user?.farmName || "Green Valley Farm",
          regNo: req.user?.registrationNumber || "N/A",
          area: req.user?.farmArea || "N/A",
          sheds: req.user?.numberOfSheds || 0,
          weather: { temp: 24, humidity: 65, condition: "Partly Cloudy", rain: "10%", wind: "12 km/h" }
        },
        stats: {
          animals: totalAnimals, pigs: pigCount, poultry: poultryCount,
          vaxDue: vaxDue, vaxDone: vaxDone, sick: sickAnimals, healthy: healthyAnimals,
          feed: feedTons, medicine: medicineCount, workers: activeWorkers, vets: 0,
          sheds: req.user?.numberOfSheds || 0, visitors: visitors, biosecurity: 0, pendingTasks: 0
        },
        livestockAnalytics: { new: 0, sold: 0, dead: 0, pregnant: 0, chicks: 0 },
        financialAnalytics: { feedExpense: 0, medExpense: 0, vaxExpense: 0, workerSalary: 0, income: 0, expenses: 0, profit: 0 },
        summaries: {
          animal: { total: totalAnimals, healthy: healthyAnimals, sick: sickAnimals, recovered: 0, pregnant: 0, growing: 0, sold: 0, dead: 0 },
          feed: { available: `${feedTons} Tons`, today: '0 Tons', monthly: '0 Tons', lowStock: 'None', recent: 'None' },
          medicine: { available: medicineCount, expired: 0, nearExpiry: 0, todayUsage: 0 },
          worker: { total: activeWorkers, present: activeWorkers, absent: 0, leave: 0, pendingTasks: 0 },
          biosecurity: { visitors: visitors, vehicles: 0, ppe: '100%', cleaning: 'Completed', sanitization: 'Pending', footbath: 'Completed' }
        },
        tasks: [],
        announcements: [],
        timeline: [],
        notifications: mappedNotifications,
        charts: {
          animalDist: [ { name: 'Pig', value: pigCount, color: '#f43f5e' }, { name: 'Poultry', value: poultryCount, color: '#f59e0b' } ],
          breedDist: [ { name: 'General', value: totalAnimals, color: '#3b82f6' } ],
          monthlyReg: [ { name: 'This Month', total: totalAnimals } ],
          vaccinationStatus: [ { name: 'Completed', value: vaxDone, color: '#10b981' }, { name: 'Due', value: vaxDue, color: '#f59e0b' } ],
          diseaseMonitor: [ { name: 'Current', healthy: healthyAnimals, sick: sickAnimals, recovered: 0 } ],
          feedConsumption: [ { name: 'Week 1', usage: totalFeedKg } ],
          medicineUsage: [ { name: 'Week 1', usage: medicineCount } ],
          workerAttendance: [ { name: 'Present', value: activeWorkers, color: '#10b981' }, { name: 'Absent', value: 0, color: '#ef4444' } ],
          financials: [ { name: 'This Month', revenue: 0, expense: 0 } ],
          expenseBreakdown: [ { name: 'Feed', value: 0, color: '#f59e0b' }, { name: 'Salary', value: 0, color: '#3b82f6' } ]
        }
      }
    });
  } catch (error) {
    console.error('Farm dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch farm dashboard data' });
  }
};

module.exports = {
  getFarmDashboardData
};
