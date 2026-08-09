import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  FaBuilding, FaCheckCircle, FaUsers, FaPaw, FaSyringe, FaBug, FaSeedling, FaPills,
  FaHardHat, FaUserMd, FaWalking, FaBell, FaPlus, FaFileAlt, FaTractor, FaShieldAlt,
  FaCloudRain, FaWind, FaCloudSun, FaHeartbeat, FaMoneyBillWave,
  FaCalendarAlt, FaClipboardList, FaBullhorn, FaCheck,
  FaChartLine, FaTint, FaMapMarkerAlt, FaCalendarDay, FaFilePdf, FaFileExcel, FaFileCsv
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import farmDashboardService from '../../services/farmDashboardService';
import api from '../../services/api';

const customStyles = `
  .farm-dashboard { font-family: 'Inter', sans-serif; color: #1e293b; padding-bottom: 2rem; }
  .grid-12 { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
  .col-2 { grid-column: span 2; }
  .col-3 { grid-column: span 3; }
  .col-4 { grid-column: span 4; }
  .col-6 { grid-column: span 6; }
  .col-8 { grid-column: span 8; }
  .col-12 { grid-column: span 12; }
  
  .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(229, 231, 235, 0.8); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); padding: 1.5rem; transition: transform 0.2s; }
  .glass-card:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
  
  .stat-card-v2 { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-radius: 16px; color: white; position: relative; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
  .stat-card-v2::after { content: ''; position: absolute; right: -20px; top: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.15); border-radius: 50%; }
  
  .bg-grad-1 { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
  .bg-grad-2 { background: linear-gradient(135deg, #10b981 0%, #047857 100%); }
  .bg-grad-3 { background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%); }
  .bg-grad-4 { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
  .bg-grad-5 { background: linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%); }
  .bg-grad-6 { background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%); }
  .bg-grad-7 { background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); }
  .bg-grad-8 { background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); }
  
  .stat-value-lg { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.25rem; letter-spacing: -0.025em; }
  .stat-label { font-size: 0.8rem; opacity: 0.9; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-icon-bg { background: rgba(255,255,255,0.25); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; backdrop-filter: blur(4px); }
  
  .mini-stat-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .mini-stat-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
  
  .section-title { font-size: 1.125rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
  .sub-title { font-size: 0.9rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase; }
  
  .list-item { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
  .list-item:last-child { border-bottom: none; }
  
  .timeline-item { display: flex; gap: 1rem; padding-bottom: 1.25rem; position: relative; }
  .timeline-item::before { content: ''; position: absolute; left: 6px; top: 24px; bottom: 0; width: 2px; background: #e2e8f0; }
  .timeline-item:last-child::before { display: none; }
  .timeline-dot { width: 14px; height: 14px; border-radius: 50%; background: #3b82f6; z-index: 1; margin-top: 4px; border: 3px solid white; box-shadow: 0 0 0 1px #e2e8f0; }
  
  .quick-action-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1rem; }
  .quick-action-btn-v2 { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; padding: 1.25rem 1rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #334155; font-weight: 600; font-size: 0.875rem; transition: all 0.2s; cursor: pointer; text-align: center; }
  .quick-action-btn-v2:hover { background: #f0fdf4; border-color: #86efac; color: #166534; transform: translateY(-3px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .quick-action-btn-v2 .icon { font-size: 1.5rem; margin-bottom: 0.25rem; }
  
  .badge { padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
  
  .calendar-day { border: 1px solid #e2e8f0; padding: 0.5rem; min-height: 80px; font-size: 0.8rem; background: #f8fafc; border-radius: 8px; }
  .calendar-day.active { background: white; border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
  .calendar-event { background: #dbeafe; color: #1e40af; padding: 2px 4px; border-radius: 4px; margin-top: 4px; font-size: 0.7rem; }
  
  @media (max-width: 1200px) {
    .col-2 { grid-column: span 4; }
    .col-3 { grid-column: span 6; }
    .col-4 { grid-column: span 6; }
    .col-6 { grid-column: span 12; }
    .col-8 { grid-column: span 12; }
  }
`;

const FarmAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [charts, setCharts] = useState(null);

  const [calendarEvents, setCalendarEvents] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat = 28.6139, lon = 77.2090) => {
      try {
        const apiKey = 'ae2a8880fa36ad780d3890473eccc44a';
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await res.json();
        if (data && data.main) {
          setWeatherData({
            temp: Math.round(data.main.temp),
            humidity: data.main.humidity,
            condition: data.weather[0].main,
            wind: `${Math.round(data.wind.speed * 3.6)} km/h`,
            rain: data.clouds ? `${data.clouds.all}%` : "0%"
          });
        }
      } catch (err) {
        console.error("Weather error:", err);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather()
      );
    } else {
      fetchWeather();
    }

    const fetchAll = async () => {
      // Fetch dashboard data
      try {
        const response = await farmDashboardService.getDashboardData();
        if (response.success) {
          setDashboardData(response.data);
          setCharts(response.data.charts);
        } else {
          toast.error('Failed to load dashboard data.');
        }
      } catch (err) {
        console.error("Failed to fetch from backend", err);
        toast.error('Failed to load data from MongoDB.');
      } finally {
        setLoading(false);
      }

      // Fetch calendar events separately
      try {
        const calRes = await api.get('/calendar');
        if (calRes.data.success) {
          setCalendarEvents(calRes.data.events);
        }
      } catch (err) {
        console.error('Calendar fetch failed:', err);
      }
    };
    fetchAll();
  }, []);

  const fallbackMockData = {
    overview: {
      healthScore: 92,
      farmName: "Green Valley Farm",
      regNo: "FARM-2026-0899",
      area: "120 Acres",
      sheds: 14,
      weather: { temp: 24, humidity: 65, condition: "Partly Cloudy", rain: "10%", wind: "12 km/h" }
    },
    stats: {
      animals: 16500, pigs: 4500, poultry: 12000,
      vaxDue: 124, vaxDone: 850, sick: 210, healthy: 16290,
      feed: 25.0, medicine: 350, workers: 45, vets: 3,
      sheds: 14, visitors: 12, biosecurity: 8, pendingTasks: 15
    },
    livestockAnalytics: {
      new: 120, sold: 45, dead: 2, pregnant: 85, chicks: 3000
    },
    financialAnalytics: {
      feedExpense: 12000, medExpense: 3500, vaxExpense: 1500,
      workerSalary: 8000, income: 45000, expenses: 25000, profit: 20000
    },
    summaries: {
      animal: { total: 16500, healthy: 16290, sick: 210, recovered: 180, pregnant: 85, growing: 15000, sold: 45, dead: 2 },
      feed: { available: '25 Tons', today: '1.2 Tons', monthly: '35 Tons', lowStock: 'Starter Feed', recent: '10 Tons (Aug 1)' },
      medicine: { available: 350, expired: 2, nearExpiry: 5, todayUsage: 12 },
      worker: { total: 45, present: 40, absent: 2, leave: 3, pendingTasks: 15 },
      biosecurity: { visitors: 12, vehicles: 4, ppe: '98%', cleaning: 'Completed', sanitization: 'Pending', footbath: 'Completed' }
    },
    tasks: [
      { text: "Vaccinate Shed A", done: true },
      { text: "Clean Shed C", done: true },
      { text: "Feed Pig Section", done: true },
      { text: "Health Check", done: false },
      { text: "Medicine Distribution", done: false }
    ],
    announcements: [
      { title: "Tomorrow Vaccination", type: "Info", color: "blue" },
      { title: "Holiday Notice", type: "Alert", color: "yellow" },
      { title: "Maintenance Work", type: "Warning", color: "red" }
    ],
    timeline: [
      { time: "09:00", event: "Animal Registered" },
      { time: "09:20", event: "Feed Stock Updated" },
      { time: "09:30", event: "Vaccination Completed" },
      { time: "10:00", event: "Visitor Entry" },
      { time: "10:20", event: "Worker Attendance" },
      { time: "11:00", event: "Disease Reported" }
    ],
    notifications: [
      { text: "Vaccination due tomorrow", type: "warning" },
      { text: "Feed stock below 20%", type: "danger" },
      { text: "Medicine expires in 5 days", type: "warning" },
      { text: "Disease detected in Shed B", type: "danger" },
      { text: "Worker absent today", type: "info" },
      { text: "Biosecurity checklist pending", type: "warning" }
    ]
  };

  const fallbackCharts = {
    animalDist: [ { name: 'Pig', value: 4500, color: '#f43f5e' }, { name: 'Poultry', value: 12000, color: '#f59e0b' } ],
    breedDist: [ { name: 'Large White', value: 2000, color: '#3b82f6' }, { name: 'Landrace', value: 1500, color: '#10b981' }, { name: 'Duroc', value: 1000, color: '#8b5cf6' } ],
    monthlyReg: [ { name: 'Jan', total: 120 }, { name: 'Feb', total: 95 }, { name: 'Mar', total: 140 }, { name: 'Apr', total: 110 }, { name: 'May', total: 160 }, { name: 'Jun', total: 180 } ],
    vaccinationStatus: [ { name: 'Completed', value: 850, color: '#10b981' }, { name: 'Due', value: 124, color: '#f59e0b' }, { name: 'Overdue', value: 12, color: '#ef4444' } ],
    diseaseMonitor: [ { name: 'W1', healthy: 16000, sick: 400, recovered: 100 }, { name: 'W2', healthy: 16200, sick: 350, recovered: 150 }, { name: 'W3', healthy: 16100, sick: 500, recovered: 200 }, { name: 'W4', healthy: 16300, sick: 210, recovered: 400 } ],
    feedConsumption: [ { name: 'W1', usage: 4500 }, { name: 'W2', usage: 4800 }, { name: 'W3', usage: 4200 }, { name: 'W4', usage: 5100 } ],
    medicineUsage: [ { name: 'W1', usage: 120 }, { name: 'W2', usage: 150 }, { name: 'W3', usage: 110 }, { name: 'W4', usage: 180 } ],
    workerAttendance: [ { name: 'Present', value: 40, color: '#10b981' }, { name: 'Absent', value: 2, color: '#ef4444' }, { name: 'Leave', value: 3, color: '#f59e0b' } ],
    financials: [ { name: 'Jan', revenue: 42000, expense: 18000 }, { name: 'Feb', revenue: 45000, expense: 18500 }, { name: 'Mar', revenue: 39000, expense: 19000 }, { name: 'Apr', revenue: 48000, expense: 21000 }, { name: 'May', revenue: 52000, expense: 20000 }, { name: 'Jun', revenue: 49000, expense: 25000 } ],
    expenseBreakdown: [ { name: 'Feed', value: 12000, color: '#f59e0b' }, { name: 'Salary', value: 8000, color: '#3b82f6' }, { name: 'Medicine', value: 3500, color: '#ef4444' }, { name: 'Vaccines', value: 1500, color: '#10b981' } ]
  };

  if (loading || !dashboardData || !charts) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold' }}>Loading Comprehensive Farm Data...</div>;
  }

  return (
    <div className="farm-dashboard">
      <style>{customStyles}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Farm Owner Dashboard</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontWeight: '500' }}>Welcome, {dashboardData.overview.farmName} Owner</p>
        </div>
      </div>

      {/* Row 1: Farm Overview, Weather, Health Score */}
      <div className="grid-12">
        <div className="col-6 glass-card">
          <div className="section-title"><FaBuilding style={{color: '#3b82f6'}} /> Farm Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
             <div className="list-item"><span style={{color: '#64748b'}}>Profile</span> <strong>{dashboardData.overview.farmName}</strong></div>
             <div className="list-item"><span style={{color: '#64748b'}}>Status</span> <span className="badge badge-green">Active</span></div>
             <div className="list-item"><span style={{color: '#64748b'}}>Reg No</span> <strong>{dashboardData.overview.regNo}</strong></div>
             <div className="list-item"><span style={{color: '#64748b'}}>Area</span> <strong>{dashboardData.overview.area}</strong></div>
             <div className="list-item"><span style={{color: '#64748b'}}>Sheds</span> <strong>{dashboardData.overview.sheds} Active</strong></div>
             <div className="list-item"><span style={{color: '#64748b'}}>Location</span> <a href="#" style={{color: '#3b82f6', fontWeight: '600', textDecoration: 'none'}}><FaMapMarkerAlt /> Google Maps</a></div>
          </div>
        </div>
        
        <div className="col-3 stat-card-v2" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
          <div style={{ width: '100%', zIndex: 1 }}>
            <div className="section-title" style={{color: 'rgba(255,255,255,0.9)'}}><FaCloudSun /> Today's Weather</div>
            <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1 }}>{(weatherData || dashboardData.overview.weather).temp}°C</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '500', opacity: 0.9, marginBottom: '1rem' }}>{(weatherData || dashboardData.overview.weather).condition}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', opacity: 0.9, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.75rem' }}>
              <span><FaTint /> {(weatherData || dashboardData.overview.weather).humidity}%</span>
              <span><FaWind /> {(weatherData || dashboardData.overview.weather).wind}</span>
              <span><FaCloudRain /> {(weatherData || dashboardData.overview.weather).rain}</span>
            </div>
          </div>
        </div>

        <div className="col-3 stat-card-v2" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}>
          <div style={{ width: '100%', textAlign: 'center', zIndex: 1 }}>
            <div className="section-title" style={{color: 'rgba(255,255,255,0.9)', justifyContent: 'center'}}><FaHeartbeat /> Farm Health Score</div>
            <div style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: 1 }}>{dashboardData.overview.healthScore}%</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#a7f3d0', marginTop: '0.5rem' }}>Excellent</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.75rem' }}>
              Based on disease cases, vaccinations & biosecurity.
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: 15 Stat Cards Matrix */}
      <h2 className="section-title" style={{marginTop: '2rem'}}><FaChartLine /> Dashboard Metrics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#eff6ff', color:'#3b82f6'}}><FaPaw /></div><div><div className="stat-label">Total Animals</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.animals}</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#fdf2f8', color:'#ec4899'}}><FaPaw /></div><div><div className="stat-label">Total Pigs</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.pigs}</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#fffbeb', color:'#f59e0b'}}><FaPaw /></div><div><div className="stat-label">Total Poultry</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.poultry}</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#fef2f2', color:'#ef4444'}}><FaSyringe /></div><div><div className="stat-label">Vaccinations Due</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.vaxDue}</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#ecfdf5', color:'#10b981'}}><FaCheckCircle /></div><div><div className="stat-label">Vax Completed</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.vaxDone}</div></div></div>
        
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#fef2f2', color:'#ef4444'}}><FaBug /></div><div><div className="stat-label">Sick Animals</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.sick}</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#ecfdf5', color:'#10b981'}}><FaHeartbeat /></div><div><div className="stat-label">Healthy Animals</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.healthy}</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#f0fdf4', color:'#16a34a'}}><FaSeedling /></div><div><div className="stat-label">Feed Available</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.feed} T</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#f3e8ff', color:'#a855f7'}}><FaPills /></div><div><div className="stat-label">Med Available</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.medicine}</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#f1f5f9', color:'#475569'}}><FaHardHat /></div><div><div className="stat-label">Total Workers</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.workers}</div></div></div>
        
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#e0f2fe', color:'#0284c7'}}><FaUserMd /></div><div><div className="stat-label">Veterinarians</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.vets}</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#ffedd5', color:'#ea580c'}}><FaBuilding /></div><div><div className="stat-label">Total Sheds</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.sheds}</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#e0e7ff', color:'#4338ca'}}><FaWalking /></div><div><div className="stat-label">Today's Visitors</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.visitors}</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#fef3c7', color:'#d97706'}}><FaShieldAlt /></div><div><div className="stat-label">Biosecurity Tasks</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.biosecurity}</div></div></div>
        <div className="mini-stat-card"><div className="mini-stat-icon" style={{background:'#f3f4f6', color:'#374151'}}><FaClipboardList /></div><div><div className="stat-label">Pending Tasks</div><div style={{fontSize:'1.2rem', fontWeight:800}}>{dashboardData.stats.pendingTasks}</div></div></div>
      </div>

      {/* Analytics Charts */}
      <div className="grid-12">
        <div className="col-4 glass-card">
          <div className="section-title">Animal Distribution (Pie)</div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={charts.animalDist} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" label>{charts.animalDist.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><RechartsTooltip /><Legend /></PieChart></ResponsiveContainer>
          </div>
        </div>
        <div className="col-4 glass-card">
          <div className="section-title">Vaccination Status (Donut)</div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={charts.vaccinationStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">{charts.vaccinationStatus.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><RechartsTooltip /><Legend /></PieChart></ResponsiveContainer>
          </div>
        </div>
        <div className="col-4 glass-card">
          <div className="section-title">Worker Attendance (Pie)</div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={charts.workerAttendance} cx="50%" cy="50%" outerRadius={75} dataKey="value">{charts.workerAttendance.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><RechartsTooltip /><Legend /></PieChart></ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-12">
        <div className="col-6 glass-card">
          <div className="section-title">Disease Monitoring (Line)</div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={charts.diseaseMonitor}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><RechartsTooltip /><Legend /><Line type="monotone" dataKey="sick" stroke="#ef4444" strokeWidth={3} /><Line type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={3} /><Line type="monotone" dataKey="healthy" stroke="#3b82f6" strokeWidth={3} /></LineChart></ResponsiveContainer>
          </div>
        </div>
        <div className="col-6 glass-card">
          <div className="section-title">Monthly Animal Registration (Line)</div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={charts.monthlyReg}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><RechartsTooltip /><Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} /></LineChart></ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-12">
        <div className="col-6 glass-card">
          <div className="section-title">Monthly Feed Consumption (Bar)</div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={charts.feedConsumption}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><RechartsTooltip /><Bar dataKey="usage" fill="#10b981" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
          </div>
        </div>
        <div className="col-6 glass-card">
          <div className="section-title">Monthly Medicine Usage (Bar)</div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={charts.medicineUsage}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><RechartsTooltip /><Bar dataKey="usage" fill="#8b5cf6" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Financial & Detailed Summaries */}
      <h2 className="section-title" style={{marginTop: '2rem'}}><FaMoneyBillWave /> Financial Dashboard</h2>
      <div className="grid-12">
        <div className="col-8 glass-card">
          <div className="section-title">Profit Analysis (Monthly Revenue/Expense)</div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={charts.financials}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><RechartsTooltip /><Legend /><Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#d1fae5" /><Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#fee2e2" /></AreaChart></ResponsiveContainer>
          </div>
        </div>
        <div className="col-4 glass-card">
          <div className="section-title">Expense Breakdown</div>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={charts.expenseBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">{charts.expenseBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><RechartsTooltip /><Legend /></PieChart></ResponsiveContainer>
          </div>
          <div style={{marginTop: '1rem'}}>
             <div className="list-item"><span>Monthly Income:</span> <strong>${dashboardData.financialAnalytics.income}</strong></div>
             <div className="list-item"><span>Monthly Expenses:</span> <strong>${dashboardData.financialAnalytics.expenses}</strong></div>
             <div className="list-item"><span style={{color:'#10b981', fontWeight:'bold'}}>Net Profit:</span> <strong style={{color:'#10b981'}}>${dashboardData.financialAnalytics.profit}</strong></div>
          </div>
        </div>
      </div>

      {/* Text Summaries */}
      <h2 className="section-title" style={{marginTop: '2rem'}}><FaClipboardList /> Module Summaries</h2>
      <div className="grid-12">
        <div className="col-3 glass-card">
          <div className="sub-title">🐄 Animal Summary</div>
          <div className="list-item"><span>Total Animals</span> <strong>{dashboardData.summaries.animal.total}</strong></div>
          <div className="list-item"><span>Healthy</span> <strong style={{color:'#10b981'}}>{dashboardData.summaries.animal.healthy}</strong></div>
          <div className="list-item"><span>Sick</span> <strong style={{color:'#ef4444'}}>{dashboardData.summaries.animal.sick}</strong></div>
          <div className="list-item"><span>Recovered</span> <strong>{dashboardData.summaries.animal.recovered}</strong></div>
          <div className="list-item"><span>Pregnant (Pig)</span> <strong>{dashboardData.summaries.animal.pregnant}</strong></div>
          <div className="list-item"><span>Growing</span> <strong>{dashboardData.summaries.animal.growing}</strong></div>
          <div className="list-item"><span>Sold</span> <strong>{dashboardData.summaries.animal.sold}</strong></div>
          <div className="list-item"><span>Deceased</span> <strong>{dashboardData.summaries.animal.dead}</strong></div>
        </div>
        
        <div className="col-3 glass-card">
          <div className="sub-title">🌾 Feed Summary</div>
          <div className="list-item"><span>Available Stock</span> <strong>{dashboardData.summaries.feed.available}</strong></div>
          <div className="list-item"><span>Today's Consump.</span> <strong>{dashboardData.summaries.feed.today}</strong></div>
          <div className="list-item"><span>Monthly Consump.</span> <strong>{dashboardData.summaries.feed.monthly}</strong></div>
          <div className="list-item"><span>Low Stock</span> <strong style={{color:'#ef4444'}}>{dashboardData.summaries.feed.lowStock}</strong></div>
          <div className="list-item"><span>Recent Purchases</span> <strong>{dashboardData.summaries.feed.recent}</strong></div>
          
          <div className="sub-title" style={{marginTop: '1.5rem'}}>💊 Medicine Summary</div>
          <div className="list-item"><span>Available</span> <strong>{dashboardData.summaries.medicine.available}</strong></div>
          <div className="list-item"><span>Expired</span> <strong style={{color:'#ef4444'}}>{dashboardData.summaries.medicine.expired}</strong></div>
          <div className="list-item"><span>Near Expiry</span> <strong>{dashboardData.summaries.medicine.nearExpiry}</strong></div>
          <div className="list-item"><span>Today's Usage</span> <strong>{dashboardData.summaries.medicine.todayUsage}</strong></div>
        </div>

        <div className="col-3 glass-card">
          <div className="sub-title">👷 Worker Summary</div>
          <div className="list-item"><span>Total Workers</span> <strong>{dashboardData.summaries.worker.total}</strong></div>
          <div className="list-item"><span>Present Today</span> <strong style={{color:'#10b981'}}>{dashboardData.summaries.worker.present}</strong></div>
          <div className="list-item"><span>Absent</span> <strong style={{color:'#ef4444'}}>{dashboardData.summaries.worker.absent}</strong></div>
          <div className="list-item"><span>On Leave</span> <strong>{dashboardData.summaries.worker.leave}</strong></div>
          <div className="list-item"><span>Pending Tasks</span> <strong>{dashboardData.summaries.worker.pendingTasks}</strong></div>
          
          <div className="sub-title" style={{marginTop: '1.5rem'}}>🛡 Biosecurity Summary</div>
          <div className="list-item"><span>Today Visitors</span> <strong>{dashboardData.summaries.biosecurity.visitors}</strong></div>
          <div className="list-item"><span>Today Vehicles</span> <strong>{dashboardData.summaries.biosecurity.vehicles}</strong></div>
          <div className="list-item"><span>PPE Compliance</span> <strong>{dashboardData.summaries.biosecurity.ppe}</strong></div>
          <div className="list-item"><span>Cleaning</span> <strong>{dashboardData.summaries.biosecurity.cleaning}</strong></div>
        </div>
        
        <div className="col-3 glass-card">
          <div className="sub-title">📋 Reports & Export</div>
          <p style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'1rem'}}>Generate detailed analysis reports for any module.</p>
          <select style={{width:'100%', padding:'0.5rem', borderRadius:'8px', border:'1px solid #e2e8f0', marginBottom:'1rem'}}>
            <option>Animal Report</option>
            <option>Vaccination Report</option>
            <option>Disease Report</option>
            <option>Treatment Report</option>
            <option>Feed Report</option>
            <option>Medicine Report</option>
            <option>Attendance Report</option>
            <option>Biosecurity Report</option>
          </select>
          <div style={{display:'flex', gap:'0.5rem'}}>
             <button style={{flex:1, padding:'0.5rem', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}><FaFilePdf /> PDF</button>
             <button style={{flex:1, padding:'0.5rem', background:'#10b981', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}><FaFileExcel /> Excel</button>
             <button style={{flex:1, padding:'0.5rem', background:'#f59e0b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}><FaFileCsv /> CSV</button>
          </div>
          
          <div className="sub-title" style={{marginTop: '1.5rem'}}>⚙ Settings & Profile</div>
          <div className="list-item"><a href="#" style={{textDecoration:'none', color:'#3b82f6'}}>Farm Profile</a></div>
          <div className="list-item"><a href="#" style={{textDecoration:'none', color:'#3b82f6'}}>Notification Settings</a></div>
          <div className="list-item"><a href="#" style={{textDecoration:'none', color:'#3b82f6'}}>Change Password</a></div>
          <div className="list-item"><a href="#" style={{textDecoration:'none', color:'#3b82f6'}}>Login History</a></div>
        </div>
      </div>

      {/* Calendar & Workflow */}
      <h2 className="section-title" style={{marginTop: '2rem'}}><FaCalendarDay /> Operations & Workflow</h2>
      <div className="grid-12">
        {/* Calendar Widget */}
        <div className="col-6 glass-card">
           <div className="section-title">Monthly Calendar</div>
           <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px', marginTop:'1rem', textAlign:'center', fontWeight:'bold', fontSize:'0.8rem', color:'#64748b'}}>
              <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
           </div>
           <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px', marginTop:'0.5rem'}}>
              <div className="calendar-day">1</div>
              <div className="calendar-day">2</div>
              <div className="calendar-day">3<div className="calendar-event">Vaccination</div></div>
              <div className="calendar-day">4</div>
              <div className="calendar-day active">5<div className="calendar-event" style={{background:'#fef3c7', color:'#92400e'}}>Feed Delivery</div></div>
              <div className="calendar-day">6</div>
              <div className="calendar-day">7<div className="calendar-event" style={{background:'#fee2e2', color:'#991b1b'}}>Vet Visit</div></div>
           </div>
           <div style={{fontSize:'0.8rem', color:'#64748b', marginTop:'1rem', fontStyle:'italic'}}>* Showing current week for brevity. Full calendar available in operations.</div>
        </div>

        {/* Live Activity Timeline */}
        <div className="col-3 glass-card">
          <div className="section-title">Recent Activities</div>
          <div style={{ marginTop: '1rem' }}>
            {dashboardData.timeline.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot"></div>
                <div style={{marginTop: '-2px'}}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>{item.event}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Today at {item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Notifications */}
        <div className="col-3 glass-card">
          <div className="section-title">Notifications</div>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {dashboardData.notifications.map((item, idx) => (
              <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: item.type === 'danger' ? '#fef2f2' : (item.type === 'warning' ? '#fffbeb' : '#eff6ff'), borderLeft: `3px solid ${item.type === 'danger' ? '#ef4444' : (item.type === 'warning' ? '#f59e0b' : '#3b82f6')}` }}>
                <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: '500' }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Tasks */}
      <div className="grid-12">
         <div className="col-8 glass-card">
            <div className="section-title">⚡ Quick Actions</div>
            <div className="quick-action-grid" style={{marginTop: '1.5rem'}}>
              <button className="quick-action-btn-v2"><FaPlus className="icon" style={{color:'#3b82f6'}} /> Register Animal</button>
              <button className="quick-action-btn-v2"><FaSyringe className="icon" style={{color:'#10b981'}} /> Schedule Vax</button>
              <button className="quick-action-btn-v2"><FaBug className="icon" style={{color:'#ef4444'}} /> Report Disease</button>
              <button className="quick-action-btn-v2"><FaSeedling className="icon" style={{color:'#f59e0b'}} /> Add Feed Stock</button>
              <button className="quick-action-btn-v2"><FaPills className="icon" style={{color:'#8b5cf6'}} /> Add Medicine</button>
              <button className="quick-action-btn-v2"><FaUsers className="icon" style={{color:'#6366f1'}} /> Add Worker</button>
              <button className="quick-action-btn-v2"><FaClipboardList className="icon" style={{color:'#14b8a6'}} /> Assign Task</button>
              <button className="quick-action-btn-v2"><FaWalking className="icon" style={{color:'#ec4899'}} /> Register Visitor</button>
            </div>
         </div>
         
         <div className="col-4 glass-card">
            <div className="section-title">Upcoming Tasks</div>
            <div style={{marginTop: '0.5rem'}}>
              {dashboardData.tasks.map((task, idx) => (
                <div key={idx} className="list-item">
                  <span style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#94a3b8' : '#1e293b', fontWeight: '500' }}>{task.text}</span>
                  {task.done ? <FaCheck style={{color: '#10b981', fontSize: '1rem'}} /> : <input type="checkbox" style={{width: '16px', height: '16px'}} />}
                </div>
              ))}
            </div>
         </div>
      </div>
      
      {/* Operations & Workflow – Live Calendar */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="section-title" style={{ margin: 0 }}><FaCalendarAlt style={{ color: 'var(--primary)' }} /> Operations &amp; Workflow – Calendar</div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Current &amp; next week • Full calendar in Operations menu</span>
        </div>

        {(() => {
          const today = new Date();
          // Get Sunday of current week
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

          const eventColors = {
            'Vaccination':   { bg: '#ecfdf5', border: '#34d399', text: '#059669' },
            'Feed Delivery': { bg: '#fffbeb', border: '#fbbf24', text: '#d97706' },
            'Vet Visit':     { bg: '#eff6ff', border: '#60a5fa', text: '#2563eb' },
            'Maintenance':   { bg: '#fef2f2', border: '#f87171', text: '#dc2626' },
            'General':       { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' },
          };

          // UTC-safe comparison
          const toUTCDateStr = (d) => {
            const dt = new Date(d);
            return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,'0')}-${String(dt.getUTCDate()).padStart(2,'0')}`;
          };
          const toCellDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          const isSameDay = (evDate, cellDate) => toUTCDateStr(evDate) === toCellDateStr(cellDate);

          // Build 2 weeks = 14 days starting from startOfWeek
          const weeks = [0, 1].map(weekOffset => {
            return Array.from({ length: 7 }, (_, i) => {
              const d = new Date(startOfWeek);
              d.setDate(startOfWeek.getDate() + weekOffset * 7 + i);
              return d;
            });
          });

          const weekLabels = ['This Week', 'Next Week'];

          return (
            <div>
              {/* Day headers - rendered once */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {days.map(day => (
                  <div key={day} style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.8rem', color: '#64748b', paddingBottom: '0.5rem', borderBottom: '2px solid #f1f5f9' }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* 2 week rows */}
              {weeks.map((weekDays, wIdx) => (
                <div key={wIdx} style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: wIdx === 0 ? 'var(--primary)' : '#94a3b8', marginBottom: '0.4rem', paddingLeft: '0.25rem' }}>
                    {weekLabels[wIdx]} &bull; {weekDays[0].toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {weekDays[6].toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                    {weekDays.map((cellDate, i) => {
                      const isToday = toCellDateStr(cellDate) === toCellDateStr(today);
                      const isPast = cellDate < today && !isToday;
                      const dayEvents = calendarEvents.filter(ev => isSameDay(ev.date, cellDate));

                      return (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{ minHeight: '100px', border: `2px solid ${isToday ? 'var(--primary)' : '#e2e8f0'}`, borderRadius: '10px', padding: '0.5rem', background: isToday ? '#f0fdf4' : isPast ? '#fafafa' : 'white' }}>
                            <div style={{ fontWeight: '800', fontSize: '1rem', color: isToday ? 'var(--primary)' : isPast ? '#cbd5e1' : '#1e293b', marginBottom: '0.4rem' }}>
                              {cellDate.getDate()}
                            </div>
                            {dayEvents.length === 0 && <div style={{ fontSize: '0.65rem', color: '#e2e8f0' }}>–</div>}
                            {dayEvents.map((ev, idx) => {
                              const c = eventColors[ev.type] || eventColors['General'];
                              return (
                                <div key={idx} title={`${ev.title}${ev.description ? ' – ' + ev.description : ''}`} style={{ fontSize: '0.6rem', padding: '0.2rem 0.3rem', borderRadius: '4px', background: c.bg, borderLeft: `2px solid ${c.border}`, color: c.text, fontWeight: '600', marginBottom: '0.2rem', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {ev.title}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
          {[['Vaccination','#34d399','#ecfdf5'],['Feed Delivery','#fbbf24','#fffbeb'],['Vet Visit','#60a5fa','#eff6ff'],['Maintenance','#f87171','#fef2f2'],['General','#94a3b8','#f1f5f9']].map(([label, border, bg]) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: bg, border: `2px solid ${border}`, display: 'inline-block' }}></span>{label}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

export default FarmAdminDashboard;
