const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const connectDB = require('./config/db');

// ── Import Routes ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const farmDashboardRoutes = require('./routes/farmDashboardRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const taskRoutes = require('./routes/taskRoutes');

const animalRoutes = require('./routes/animalRoutes');
const feedInventoryRoutes = require('./routes/feedInventoryRoutes');
const workerRoutes = require('./routes/workerRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');
const medicineInventoryRoutes = require('./routes/medicineInventoryRoutes');
const biosecurityLogRoutes = require('./routes/biosecurityLogRoutes');
const diseaseRoutes = require('./routes/diseaseRoutes');
const shedRoutes = require('./routes/shedRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const automationRoutes = require('./routes/automationRoutes');
const integrityRoutes = require('./routes/integrityRoutes');
const farmGuardRoutes = require('./routes/farmGuardRoutes');

// ── Autonomous AI Agents ───────────────────────────────────────────────────
const farmIntegrityAgent = require('./agents/orchestrator/farmIntegrityAgent');
const farmGuardAgent = require('./agents/autonomous/farmGuardAgent');
const { startScheduler } = require('./agents/autonomous/agentScheduler');

const app = express();

// ── Ensure uploads directory exists ──────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    // Allow any vercel.app domain
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Serve uploaded files statically ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/farm-dashboard', farmDashboardRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/tasks', taskRoutes);

app.use('/api/animals', animalRoutes);
app.use('/api/feed-inventory', feedInventoryRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/medicine-inventory', medicineInventoryRoutes);
app.use('/api/biosecurity', biosecurityLogRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/disease', diseaseRoutes); // Alias for predictions
app.use('/api/sheds', shedRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/integrity', integrityRoutes);
app.use('/api/farmguard', farmGuardRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Digital Farm Management API is running',
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── Root Welcome Route ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Digital Farm Management API. The server is running successfully!',
    version: '1.0.0'
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // ── Initialize AI Agents ──────────────────────────────────────────────
  farmIntegrityAgent.initialize();   // Event-driven fraud/anomaly detector
  farmGuardAgent.initialize();       // Autonomous farm operations agent
  startScheduler();                  // Cron-based sensor + observation cycles

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Uploads served at http://localhost:${PORT}/uploads`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
    console.log(`🛡️  Farm Integrity Agent: ACTIVE`);
    console.log(`🤖  FarmGuard AI Autonomous Agent: ACTIVE`);
    console.log(`⏰  Autonomous Scheduler: ACTIVE`);
  });
});
