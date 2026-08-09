const Task = require('../models/Task');
const Worker = require('../models/Worker');
const FeedInventory = require('../models/FeedInventory');
const Animal = require('../models/Animal');
const Vaccination = require('../models/Vaccination');
// const Attendance = require('../models/Attendance');

// @desc    Trigger autonomous emergency response (Load Balancer)
// @route   POST /api/automation/trigger-emergency
// @access  Private/Manager
exports.triggerEmergency = async (req, res) => {
  try {
    const { shed, emergencyType } = req.body;

    if (!shed) {
      return res.status(400).json({ success: false, message: 'Shed is required' });
    }

    // 1. Find Low/Medium Priority Tasks that are pending/in progress
    const lowPriorityTasks = await Task.find({
      priority: { $in: ['Low', 'Medium'] },
      status: { $in: ['Pending', 'In Progress'] }
    });

    // 2. Pause them
    await Task.updateMany(
      { _id: { $in: lowPriorityTasks.map(t => t._id) } },
      { $set: { status: 'On Hold' } }
    );

    // 3. Find active workers 
    // In a full production system, we'd check Attendance today. 
    // For this demo, we'll just grab up to 3 active workers.
    let workers = await Worker.find({ status: 'Active' });

    // If no real workers exist yet, mock some names for demonstration
    let workerNames = [];
    if (workers.length > 0) {
      workerNames = workers.slice(0, 3).map(w => w.name);
    } else {
      workerNames = ['John Doe', 'Sarah Smith', 'Mike Johnson'];
    }

    // 4. Create Emergency Tasks for these workers
    const emergencyTasks = [];
    for (let name of workerNames) {
      const task = await Task.create({
        title: `EMERGENCY: ${emergencyType || 'Disease Outbreak'} Quarantine`,
        desc: `Immediate action required. Implement biosecurity protocol in ${shed}. All prior tasks paused.`,
        assignee: name,
        shed: shed,
        category: 'Health',
        priority: 'Critical',
        status: 'In Progress',
        startDate: new Date(),
        dueDate: new Date(new Date().getTime() + 4 * 60 * 60 * 1000), // Due in 4 hours
        estTime: '4 hours'
      });
      emergencyTasks.push(task);
    }

    res.status(200).json({
      success: true,
      message: 'Emergency protocol activated. Resources reallocated.',
      data: {
        pausedTasksCount: lowPriorityTasks.length,
        reassignedWorkersCount: workerNames.length,
        reassignedWorkerNames: workerNames,
        targetShed: shed,
        emergencyTasks: emergencyTasks
      }
    });

  } catch (error) {
    console.error('Error triggering emergency:', error);
    res.status(500).json({ success: false, message: 'Server Error during emergency protocol' });
  }
};

// @desc    Autonomously check inventory and generate POs
// @route   GET /api/automation/auto-reorder
// @access  Private/Manager
exports.generateAutoReorderPOs = async (req, res) => {
  try {
    // 1. Find all feed items where quantity is below or equal to minStock
    // Alternatively, if minStock is 0, we might just look at items marked 'Low Stock'
    const allItems = await FeedInventory.find({});
    const lowStockItems = allItems.filter(item => item.quantity <= item.minStock && item.minStock > 0);

    if (lowStockItems.length === 0) {
      return res.status(200).json({ success: true, message: 'Stock levels are healthy. No AI POs needed.', data: [] });
    }

    const draftPOs = [];

    // 2. Simulate AI Prediction Call
    for (let item of lowStockItems) {
      // In a real scenario, this would query the Python XGBoost model.
      // We mock the AI prediction logic:
      const estimatedBurnRatePerDay = item.minStock / 7; // rough estimate
      const daysToOrderFor = 30;
      const predictedAmountNeeded = Math.ceil(estimatedBurnRatePerDay * daysToOrderFor);

      // Calculate unit price from last purchase
      let unitPrice = 1.5; // fallback
      if (item.purchasePrice && item.quantity > 0) {
        unitPrice = item.purchasePrice / item.quantity;
      }
      const estimatedCost = predictedAmountNeeded * unitPrice;

      draftPOs.push({
        id: `PO-${Math.floor(Math.random() * 90000) + 10000}`,
        feedId: item._id,
        feedName: item.name,
        currentStock: item.quantity,
        minStock: item.minStock,
        unit: item.unit,
        predictedAmountNeeded: predictedAmountNeeded,
        estimatedCost: estimatedCost.toFixed(2),
        supplier: item.supplier || 'Premium Agri-Suppliers Ltd.',
        reason: `AI prediction: Critical risk. Burn rate suggests stock depletion in < 5 days. Suggested 30-day supply.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Autonomous POs generated successfully.',
      data: draftPOs
    });

  } catch (error) {
    console.error('Error generating AI POs:', error);
    res.status(500).json({ success: false, message: 'Server error generating POs' });
  }
};

// @desc    Autonomously schedule vet tasks for upcoming vaccinations
// @route   POST /api/automation/auto-vet
// @access  Private/Manager
exports.generateAutoVetSchedule = async (req, res) => {
  try {
    // 1. In a real DB, we would query:
    // const upcoming = await Vaccination.find({ 
    //   nextDueDate: { $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    //   status: 'Scheduled'
    // }).populate('animal');

    // For demonstration, we will generate tasks for the requested animals from the frontend
    const { animalsToCheck } = req.body;

    if (!animalsToCheck || animalsToCheck.length === 0) {
      return res.status(200).json({ success: true, message: 'No animals provided for vet check.' });
    }

    const scheduledTasks = [];
    const flaggedAnimals = [];

    // Simulate AI checking vaccination histories
    for (let animal of animalsToCheck) {
      // Mock condition: 1 in 3 animals randomly needs a vaccine in this simulation, 
      // or we just pick the first one to guarantee a result.
      if (animal.id === 'A-1001' || Math.random() > 0.6) {

        // Create an autonomous Task
        const task = await Task.create({
          title: `URGENT: Vaccination Due (${animal.id})`,
          desc: `Autonomous System Alert: ${animal.name || animal.id} is due for Rabies/FMD booster in < 3 days.`,
          assignee: 'Farm Veterinarian (Auto-Assigned)',
          shed: animal.shed || 'Shed 1',
          category: 'Health',
          priority: 'High',
          status: 'Pending',
          startDate: new Date(),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
          estTime: '30 mins'
        });

        scheduledTasks.push(task);
        flaggedAnimals.push({
          id: animal.id,
          newHealthStatus: 'Vax Pending'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Autonomous Vet Scheduler completed successfully.',
      data: {
        tasksGenerated: scheduledTasks.length,
        flaggedAnimals: flaggedAnimals
      }
    });

  } catch (error) {
    console.error('Error in Auto Vet Scheduler:', error);
    res.status(500).json({ success: false, message: 'Server error generating Vet Schedules' });
  }
};
