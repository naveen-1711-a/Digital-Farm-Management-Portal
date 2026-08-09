import React, { useState, useEffect } from 'react';
import { FaPaw, FaSyringe, FaExclamationTriangle, FaSeedling, FaPills, FaUsers, FaTasks, FaHome, FaCalendarCheck, FaSpinner, FaHeartbeat, FaClipboardList, FaFileAlt, FaFilePdf, FaFileExcel, FaFileCsv, FaShieldAlt, FaUserClock, FaCog, FaBell, FaKey, FaHistory, FaChevronRight, FaBuilding, FaQrcode, FaEdit, FaTrash } from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import farmDashboardService from '../../services/farmDashboardService';

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [reportType, setReportType] = useState('Animal Report');
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
            condition: data.weather[0].main,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
            city: data.name
          });
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
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

    const fetchDashboardData = async () => {
      try {
        const response = await farmDashboardService.getDashboardData();
        if (response.success) setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading || !dashboardData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px', color: '#4f46e5', fontSize: '1.2rem', gap: '1rem' }}>
        <FaSpinner className="fa-spin" /> Loading Dashboard...
      </div>
    );
  }

  const totalAnimals = dashboardData.stats?.animals || 1250;
  const vaxDue = dashboardData.stats?.vaxDue || 18;
  const sickAnimals = dashboardData.stats?.sick || 6;
  const healthyAnimals = dashboardData.stats?.healthy || (totalAnimals - sickAnimals - 20);

  // Stats for other cards
  const feedTons = dashboardData.stats?.feed || "2.5";
  const medicines = dashboardData.stats?.medicine || 12;
  const activeWorkers = dashboardData.stats?.workers || 28;
  const totalWorkers = dashboardData.summaries?.worker?.total || 32;
  const sheds = dashboardData.stats?.sheds || 10;
  const visitors = dashboardData.stats?.visitors || 5;

  // Chart data
  const populationData = dashboardData.charts?.monthlyReg?.length > 1 ? dashboardData.charts.monthlyReg.map(m => ({ name: m.name, animals: m.total })) : [
    { name: 'Jan', animals: 1100 }, { name: 'Feb', animals: 1150 },
    { name: 'Mar', animals: 1200 }, { name: 'Apr', animals: 1180 },
    { name: 'May', animals: 1230 }, { name: 'Jun', animals: 1250 },
  ];
  const animalDist = dashboardData.charts?.animalDist?.length > 0 ? dashboardData.charts.animalDist : [
    { name: 'Cattle', value: 500, color: '#3b82f6' },
    { name: 'Poultry', value: 750, color: '#f59e0b' },
  ];
  const feedData = dashboardData.charts?.feedConsumption?.length > 1 ? dashboardData.charts.feedConsumption.map(f => ({ name: f.name, kg: f.usage })) : [
    { name: 'Mon', kg: 120 }, { name: 'Tue', kg: 130 }, { name: 'Wed', kg: 125 },
    { name: 'Thu', kg: 140 }, { name: 'Fri', kg: 135 }, { name: 'Sat', kg: 150 }, { name: 'Sun', kg: 145 },
  ];

  const recentActivities = dashboardData.timeline?.length > 0 ? dashboardData.timeline : [
    { activity: 'Animal Weight Updated',    icon: <FaPaw />,               iconBg: '#eff6ff', iconColor: '#3b82f6', desc: 'Cow #4092 weight logged as 450kg',          by: 'Dr. Smith',  time: '10 mins ago' },
    { activity: 'Vaccination Completed',    icon: <FaSyringe />,            iconBg: '#ecfdf5', iconColor: '#10b981', desc: 'Batch A poultry received ND vaccine',       by: 'Vet Team',   time: '45 mins ago' },
    { activity: 'Feed Added',               icon: <FaSeedling />,           iconBg: '#f0fdf4', iconColor: '#22c55e', desc: 'Shed 3 feeders replenished with 50kg',     by: 'Worker John',time: '2 hours ago' },
    { activity: 'Medicine Used',            icon: <FaPills />,              iconBg: '#fef2f2', iconColor: '#ef4444', desc: 'Antibiotics given to Sick Cow #102',       by: 'Dr. Smith',  time: '3 hours ago' },
    { activity: 'Attendance Marked',        icon: <FaUserClock />,          iconBg: '#eef2ff', iconColor: '#6366f1', desc: 'Morning shift logged in (28 present)',     by: 'System',     time: 'Today 07:00 AM' },
    { activity: 'Disease Reported',         icon: <FaExclamationTriangle />,iconBg: '#fff7ed', iconColor: '#f97316', desc: 'Suspected mastitis reported in Shed 1',    by: 'Manager',    time: 'Yesterday' },
  ];

  // Helper — stat card matching admin dashboard exactly
  const StatCard = ({ icon, label, value, borderColor, iconBg, iconColor }) => (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb',
      borderLeft: `5px solid ${borderColor}`, position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}>
      <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.15rem' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', lineHeight: 1.2 }}>{value}</div>
      </div>
    </div>
  );

  // Helper — summary row
  const SummaryRow = ({ label, value, valueColor }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
      <span style={{ color: '#374151' }}>{label}</span>
      <strong style={{ color: valueColor || '#111827', fontWeight: '600' }}>{value}</strong>
    </div>
  );

  // Helper — section panel
  const SummaryPanel = ({ title, children }) => (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {title}
      </div>
      {children}
    </div>
  );

  // Helper — chart panel
  const ChartPanel = ({ title, children }) => (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', margin: '0 0 1.25rem 0' }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', margin: 0 }}>Dashboard Overview</h1>
          <p style={{ color: '#6b7280', margin: '0.3rem 0 0 0', fontWeight: '500' }}>Welcome back! Here's what's happening on the farm today.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {weatherData && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.4rem 1.25rem', borderRadius: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', color: '#374151', fontWeight: '600', fontSize: '0.9rem' }}>
               <img src={weatherData.icon} alt="weather" style={{ width: '28px', height: '28px' }} />
               {weatherData.temp}°C, {weatherData.condition} <span style={{ color: '#9ca3af', fontSize: '0.8rem', marginLeft: '0.2rem' }}>in {weatherData.city}</span>
             </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', padding: '0.6rem 1.25rem', borderRadius: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', color: '#4f46e5', fontWeight: '600', fontSize: '0.9rem' }}>
            <FaCalendarCheck /> {currentDate}
          </div>
        </div>
      </div>

      {/* ─── Row 1: 4 cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <StatCard icon={<FaPaw />}              label="Total Animals"          value={totalAnimals.toLocaleString()} borderColor="#3b82f6" iconBg="#eff6ff" iconColor="#3b82f6" />
        <StatCard icon={<FaHeartbeat />}         label="Healthy Animals"        value={healthyAnimals.toLocaleString()} borderColor="#10b981" iconBg="#ecfdf5" iconColor="#10b981" />
        <StatCard icon={<FaExclamationTriangle />} label="Sick Animals"         value={sickAnimals}                   borderColor="#ef4444" iconBg="#fef2f2" iconColor="#ef4444" />
        <StatCard icon={<FaSyringe />}           label="Vaccinations Due"        value={vaxDue}                        borderColor="#f59e0b" iconBg="#fffbeb" iconColor="#f59e0b" />
      </div>

      {/* ─── Row 2: 4 cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <StatCard icon={<FaSeedling />}          label="Feed Stock"             value={`${feedTons} Tons`}  borderColor="#22c55e" iconBg="#f0fdf4" iconColor="#16a34a" />
        <StatCard icon={<FaPills />}             label="Medicines Available"    value={medicines}        borderColor="#eab308" iconBg="#fefce8" iconColor="#a16207" />
        <StatCard icon={<FaUsers />}             label="Workers Present Today"  value={`${activeWorkers} / ${totalWorkers}`}   borderColor="#6366f1" iconBg="#eef2ff" iconColor="#4338ca" />
        <StatCard icon={<FaTasks />}             label="Pending Tasks"          value={dashboardData.stats?.pendingTasks || 15}        borderColor="#f97316" iconBg="#fff7ed" iconColor="#c2410c" />
      </div>

      {/* ─── Row 3: 4 cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={<FaHome />}              label="Active Sheds"           value={sheds}        borderColor="#14b8a6" iconBg="#f0fdfa" iconColor="#0d9488" />
        <StatCard icon={<FaShieldAlt />}         label="Biosecurity Checks"     value={dashboardData.stats?.biosecurity || '8 / 10'}    borderColor="#8b5cf6" iconBg="#f5f3ff" iconColor="#7c3aed" />
        <StatCard icon={<FaUserClock />}         label="Attendance Rate"        value={totalWorkers ? `${Math.round((activeWorkers/totalWorkers)*100)}%` : '87.5%'}     borderColor="#06b6d4" iconBg="#ecfeff" iconColor="#0891b2" />
        <StatCard icon={<FaBell />}              label="Notifications"          value={`${dashboardData.notifications?.length || 3} New`}     borderColor="#f43f5e" iconBg="#fff1f2" iconColor="#e11d48" />
      </div>

      {/* ─── Analytics Charts ─── */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FaClipboardList style={{ color: '#4f46e5' }} /> Analytics Overview
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <ChartPanel title="📈 Animal Population Trend (Last 6 Months)">
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={populationData}>
                <defs>
                  <linearGradient id="colorAnimals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="animals" stroke="#4f46e5" strokeWidth={2.5} fill="url(#colorAnimals)" dot={{ r: 4, fill: '#4f46e5' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
        <ChartPanel title="🥧 Animal Distribution">
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={animalDist} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                  {animalDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
        <ChartPanel title="📊 Feed Consumption (Weekly)">
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="kg" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      {/* ─── Module Summaries ─── */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FaClipboardList style={{ color: '#4f46e5' }} /> Module Summaries
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>

        {/* Animal Summary */}
        <SummaryPanel title={<><FaPaw style={{ color: '#3b82f6' }} /> Animal Summary</>}>
          <SummaryRow label="Total Animals"   value={totalAnimals.toLocaleString()} />
          <SummaryRow label="Healthy"         value={healthyAnimals.toLocaleString()} valueColor="#16a34a" />
          <SummaryRow label="Sick"            value={sickAnimals}                    valueColor="#dc2626" />
          <SummaryRow label="Isolation"       value={dashboardData.summaries?.animal?.isolation || 20}                             valueColor="#d97706" />
          <SummaryRow label="Vaccinations Due" value={vaxDue}                        valueColor="#d97706" />
          <SummaryRow label="Sold This Month" value={dashboardData.summaries?.animal?.sold || 45} />
          <SummaryRow label="New This Month"  value={dashboardData.summaries?.animal?.new || 12}  valueColor="#16a34a" />
        </SummaryPanel>

        {/* Feed + Medicine Summary stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SummaryPanel title={<><FaSeedling style={{ color: '#22c55e' }} /> Feed Summary</>}>
            <SummaryRow label="Available Stock"    value={`${feedTons} Tons`}     />
            <SummaryRow label="Today's Consump."   value={dashboardData.summaries?.feed?.today || "120 kg"}       />
            <SummaryRow label="Monthly Consump."   value={dashboardData.summaries?.feed?.monthly || "3.2 Tons"}     />
            <SummaryRow label="Low Stock Items"    value={dashboardData.summaries?.feed?.lowStock || "Poultry Mix"}  valueColor="#dc2626" />
            <SummaryRow label="Next Delivery"      value="Jul 28"       />
          </SummaryPanel>
          <SummaryPanel title={<><FaPills style={{ color: '#f59e0b' }} /> Medicine Summary</>}>
            <SummaryRow label="Available"     value={`${medicines} units`}  />
            <SummaryRow label="Near Expiry"   value={`${dashboardData.summaries?.medicine?.nearExpiry || 12} batches`} valueColor="#dc2626" />
            <SummaryRow label="Today's Usage" value={`${dashboardData.summaries?.medicine?.todayUsage || 8} units`}    />
            <SummaryRow label="Expired"       value={`${dashboardData.summaries?.medicine?.expired || 2} items`}    valueColor="#dc2626" />
          </SummaryPanel>
        </div>

        {/* Worker + Biosecurity Summary stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SummaryPanel title={<><FaUsers style={{ color: '#6366f1' }} /> Worker Summary</>}>
            <SummaryRow label="Total Workers"  value={totalWorkers} />
            <SummaryRow label="Present Today"  value={activeWorkers}   valueColor="#16a34a" />
            <SummaryRow label="Absent"         value={dashboardData.summaries?.worker?.absent || 2}    valueColor="#dc2626" />
            <SummaryRow label="On Leave"       value={dashboardData.summaries?.worker?.leave || 2}    valueColor="#d97706" />
            <SummaryRow label="Pending Tasks"  value={dashboardData.summaries?.worker?.pendingTasks || 15}   valueColor="#d97706" />
          </SummaryPanel>
          <SummaryPanel title={<><FaShieldAlt style={{ color: '#8b5cf6' }} /> Biosecurity Summary</>}>
            <SummaryRow label="Today Visitors"  value={visitors} />
            <SummaryRow label="Today Vehicles"  value={dashboardData.summaries?.biosecurity?.vehicles || 3} />
            <SummaryRow label="PPE Compliance"  value={dashboardData.summaries?.biosecurity?.ppe || "96%"}      valueColor="#16a34a" />
            <SummaryRow label="Cleaning"        value={dashboardData.summaries?.biosecurity?.cleaning || "Done"}     valueColor="#16a34a" />
            <SummaryRow label="Sanitization"    value={dashboardData.summaries?.biosecurity?.sanitization || "Pending"}  valueColor="#d97706" />
          </SummaryPanel>
        </div>

        {/* Reports & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SummaryPanel title={<><FaFileAlt style={{ color: '#4f46e5' }} /> Reports &amp; Export</>}>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 1rem 0' }}>Generate detailed analysis reports for any module.</p>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.875rem', color: '#374151', background: '#f9fafb', marginBottom: '1rem', outline: 'none' }}>
              <option>Animal Report</option>
              <option>Feed Report</option>
              <option>Medicine Report</option>
              <option>Worker Report</option>
              <option>Vaccination Report</option>
            </select>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ flex: 1, padding: '0.5rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><FaFilePdf /> PDF</button>
              <button style={{ flex: 1, padding: '0.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><FaFileExcel /> Excel</button>
              <button style={{ flex: 1, padding: '0.5rem', background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><FaFileCsv /> CSV</button>
            </div>
          </SummaryPanel>
          <SummaryPanel title={<><FaCog style={{ color: '#6b7280' }} /> Settings &amp; Profile</>}>
            {[
              { label: 'Farm Profile', icon: <FaBuilding />, color: '#3b82f6' },
              { label: 'Notification Settings', icon: <FaBell />, color: '#f59e0b' },
              { label: 'Change Password', icon: <FaKey />, color: '#6366f1' },
              { label: 'Login History', icon: <FaHistory />, color: '#10b981' },
            ].map(({ label, icon, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: '0.875rem' }}
                onMouseEnter={e => e.currentTarget.querySelector('span').style.color = color}
                onMouseLeave={e => e.currentTarget.querySelector('span').style.color = '#3b82f6'}>
                <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', transition: 'color 0.2s' }}>
                  <span style={{ color }}>{icon}</span> {label}
                </span>
                <FaChevronRight style={{ color: '#d1d5db', fontSize: '0.7rem' }} />
              </div>
            ))}
          </SummaryPanel>
        </div>
      </div>

      {/* ─── Recent Activities Table ─── */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FaClipboardList style={{ color: '#4f46e5' }} /> Recent Activities
      </h2>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Activity', 'Description', 'Performed By', 'Time'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentActivities.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem' }}>
                  <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: row.iconBg || '#eef2ff', color: row.iconColor || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{row.icon || <FaHistory/>}</span>
                  {row.activity || row.title}
                </td>
                <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>{row.desc || row.description}</td>
                <td style={{ padding: '1rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500' }}>{row.by || row.user}</td>
                <td style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>{row.time || new Date(row.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ManagerDashboard;
