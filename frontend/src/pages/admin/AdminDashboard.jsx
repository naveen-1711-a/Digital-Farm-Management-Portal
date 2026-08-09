import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  FaBuilding, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaUsers,
  FaPaw, FaCrow, FaSyringe, FaBug, FaSeedling, FaPills,
  FaHardHat, FaUserMd, FaWalking, FaBell, FaPlus, FaFileAlt, FaCheck, FaTimes,
  FaDatabase, FaEye
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import dashboardService from '../../services/dashboardService';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fallbackStats = {
    farms: { total: 1248, approved: 1102, pending: 142, rejected: 4 },
    users: { total: 3850 },
    animals: { total: 16500, pigs: 4500, poultry: 12000 },
    vaccinations: { due: 124, completed: 850, overdue: 12, completionPct: 85 },
    diseases: { active: 38 },
    feed: { totalKg: 25000, capacityKg: 50000 },
    medicine: { alertCount: 0 },
    workers: { active: 185 },
    veterinarians: { count: 12 },
    visitors: { today: 45 },
    notifications: { pending: 8 },
    attendance: { present: 185, absent: 10, leave: 5, total: 200 }
  };

  const fallbackCharts = {
    monthlyRegData: [
      { name: 'Jan', total: 64 }, { name: 'Feb', total: 43 }, { name: 'Mar', total: 58 },
      { name: 'Apr', total: 66 }, { name: 'May', total: 66 }, { name: 'Jun', total: 61 },
      { name: 'Jul', total: 77 },
    ],
    animalDistData: [
      { name: 'Pig', value: 4500, color: '#f43f5e' },
      { name: 'Poultry', value: 12000, color: '#f59e0b' }
    ],
    vaccinationData: [
      { name: 'Completed', value: 85, color: '#10b981' },
      { name: 'Due', value: 10, color: '#f59e0b' },
      { name: 'Overdue', value: 5, color: '#ef4444' }
    ],
    diseaseData: [
      { name: 'Week 1', healthy: 16000, sick: 400, recovered: 100 },
      { name: 'Week 2', healthy: 16200, sick: 350, recovered: 150 },
      { name: 'Week 3', healthy: 16100, sick: 500, recovered: 200 },
      { name: 'Week 4', healthy: 16300, sick: 200, recovered: 400 },
    ],
    feedUsageData: [
      { name: 'Week 1', consumed: 4000 },
      { name: 'Week 2', consumed: 3800 },
      { name: 'Week 3', consumed: 4200 },
      { name: 'Week 4', consumed: 4100 },
    ],
    medUsageData: [
      { name: 'Week 1', consumed: 120 },
      { name: 'Week 2', consumed: 150 },
      { name: 'Week 3', consumed: 90 },
      { name: 'Week 4', consumed: 110 },
    ],
    attendanceData: [
      { name: 'Present', value: 185, color: '#10b981' },
      { name: 'Absent', value: 10, color: '#ef4444' },
      { name: 'Leave', value: 5, color: '#f59e0b' }
    ]
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [statsRes, chartsRes, activitiesRes, notifRes, pendingRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCharts(),
        dashboardService.getRecentActivities(),
        dashboardService.getNotifications(),
        adminService.getPendingApprovals()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (chartsRes.success) setCharts(chartsRes.data);
      if (activitiesRes.success) setActivities(activitiesRes.data);
      if (notifRes.success) setNotifications(notifRes.data);
      if (pendingRes.success) setPendingApprovals(pendingRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Fallback to mock data on error (e.g., 401 Unauthorized)
      setStats(fallbackStats);
      setCharts(fallbackCharts);
      setActivities([]);
      setNotifications([]);
      setPendingApprovals([]);
      setError(true);
      toast.error('Not logged in. Showing demo data.', { id: 'auth-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await adminService.approveFarm(id);
      if (res.success) {
        toast.success(res.message);
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      toast.error('Failed to approve farm');
    }
  };

  const handleReject = async (id) => {
    try {
      if (!window.confirm('Are you sure you want to reject this farm?')) return;
      const res = await adminService.rejectFarm(id);
      if (res.success) {
        toast.success(res.message);
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      toast.error('Failed to reject farm');
    }
  };

  if (loading || !stats || !charts) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Dashboard...</div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Admin Dashboard</h1>
          <p>Welcome Overall Admin.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaFileAlt /> Generate Reports
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => window.location.hash = 'register'}>
            <FaPlus /> Register Farm
          </button>
        </div>
      </div>

      {/* Row 1 */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '5px solid #4f46e5' }}><div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}><FaBuilding /></div><div className="stat-info"><div className="stat-title">Total Farms</div><div className="stat-value">{stats.farms.total}</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #059669' }}><div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}><FaCheckCircle /></div><div className="stat-info"><div className="stat-title">Approved Farms</div><div className="stat-value">{stats.farms.approved}</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #d97706' }}><div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}><FaHourglassHalf /></div><div className="stat-info"><div className="stat-title">Pending Farms</div><div className="stat-value">{stats.farms.pending}</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #dc2626' }}><div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}><FaTimesCircle /></div><div className="stat-info"><div className="stat-title">Rejected Farms</div><div className="stat-value">{stats.farms.rejected}</div></div></div>
      </div>

      {/* Row 2 */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '5px solid #9333ea' }}><div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}><FaUsers /></div><div className="stat-info"><div className="stat-title">Total Users</div><div className="stat-value">{stats.users.total}</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #0284c7' }}><div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}><FaPaw /></div><div className="stat-info"><div className="stat-title">Total Animals</div><div className="stat-value">{(stats.animals.total / 1000).toFixed(1)}K</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #e11d48' }}><div className="stat-icon" style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}><FaPaw /></div><div className="stat-info"><div className="stat-title">Pig Count</div><div className="stat-value">{stats.animals.pigs.toLocaleString()}</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #d97706' }}><div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}><FaCrow /></div><div className="stat-info"><div className="stat-title">Poultry Count</div><div className="stat-value">{stats.animals.poultry.toLocaleString()}</div></div></div>
      </div>

      {/* Row 3 */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '5px solid #ea580c' }}><div className="stat-icon" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}><FaSyringe /></div><div className="stat-info"><div className="stat-title">Vaccinations Due</div><div className="stat-value">{stats.vaccinations.due}</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #db2777' }}><div className="stat-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}><FaBug /></div><div className="stat-info"><div className="stat-title">Active Disease Cases</div><div className="stat-value">{stats.diseases.active}</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #16a34a' }}><div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}><FaSeedling /></div><div className="stat-info"><div className="stat-title">Feed Stock</div><div className="stat-value">{(stats.feed.totalKg / 1000).toFixed(1)} Tons</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #4338ca' }}><div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}><FaPills /></div><div className="stat-info"><div className="stat-title">Medicine Alerts</div><div className="stat-value">{stats.medicine.alertCount > 0 ? stats.medicine.alertCount : 'Adequate'}</div></div></div>
      </div>

      {/* Row 4 */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ borderLeft: '5px solid #ca8a04' }}><div className="stat-icon" style={{ backgroundColor: '#fef9c3', color: '#ca8a04' }}><FaHardHat /></div><div className="stat-info"><div className="stat-title">Active Workers</div><div className="stat-value">{stats.workers.active}</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #0369a1' }}><div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}><FaUserMd /></div><div className="stat-info"><div className="stat-title">Veterinarians</div><div className="stat-value">{stats.veterinarians.count}</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #4b5563' }}><div className="stat-icon" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}><FaWalking /></div><div className="stat-info"><div className="stat-title">Today's Visitors</div><div className="stat-value">{stats.visitors.today}</div></div></div>
        <div className="stat-card" style={{ borderLeft: '5px solid #dc2626' }}><div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}><FaBell /></div><div className="stat-info"><div className="stat-title">Pending Notifications</div><div className="stat-value">{stats.notifications.pending}</div></div></div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header"><h3>Farm Registration (Last 7 Months)</h3></div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyRegData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="total" name="Total Registered" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header"><h3>Animal Distribution</h3></div>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.animalDistData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                  {charts.animalDistData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header"><h3>Vaccination Status</h3></div>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.vaccinationData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {charts.vaccinationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header"><h3>Disease Monitoring</h3></div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.diseaseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="sick" name="Sick" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="recovered" name="Recovered" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="healthy" name="Healthy" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Feed Usage */}
        <div className="chart-card" style={{ background: '#ffffff', border: '1.5px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '700', color: '#064e3b' }}>Feed Usage</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Weekly consumption (kg)</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {[{ label: 'Total Inventory', val: `${stats.feed.totalKg} kg`, color: '#15803d' }, { label: 'Capacity', val: `${stats.feed.capacityKg} kg`, color: '#9333ea' }].map((s, i) => (
              <div key={i} style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '0.5rem 0.6rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.1rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.feedUsageData} barSize={36}>
                <defs>
                  <linearGradient id="feedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdf4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <RechartsTooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.8rem' }} itemStyle={{ color: '#4ade80' }} />
                <Bar dataKey="consumed" name="Feed (kg)" fill="url(#feedGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Medicine Usage */}
        <div className="chart-card" style={{ background: '#ffffff', border: '1.5px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '700', color: '#312e81' }}>Medicine Usage</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Weekly units dispensed</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {[{ label: 'Alerts', val: stats.medicine.alertCount, color: '#dc2626' }].map((s, i) => (
              <div key={i} style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '0.5rem 0.6rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.1rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.medUsageData} barSize={36}>
                <defs>
                  <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4338ca" stopOpacity={1} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2ff" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <RechartsTooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.8rem' }} itemStyle={{ color: '#818cf8' }} />
                <Bar dataKey="consumed" name="Units" fill="url(#medGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worker Attendance */}
        <div className="chart-card" style={{ background: '#ffffff', border: '1.5px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '700', color: '#7c2d12' }}>Worker Attendance</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Today — {stats.attendance.total} total recorded</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
            {[{ label: 'Present', val: stats.attendance.present, color: '#10b981' }, { label: 'Absent', val: stats.attendance.absent, color: '#ef4444' }, { label: 'On Leave', val: stats.attendance.leave, color: '#f59e0b' }].map((s, i) => (
              <div key={i} style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '0.5rem 0.6rem', border: `1px solid ${s.color}30`, textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.1rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: '170px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.attendanceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {charts.attendanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.8rem' }} formatter={(val, name) => [`${val} workers`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      {/* Row 4: Recent Activities & Pending Approvals */}
      <div className="tables-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="table-card">
          <div className="table-header"><h3>Recent Activities</h3></div>
          <div className="activity-list" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {activities.length === 0 && <p style={{ padding: '1rem', color: '#6b7280' }}>No recent activities found.</p>}
            {activities.map((act, idx) => (
              <div className="activity-item" key={idx}>
                <div className="activity-icon" style={{ backgroundColor: act.bg, color: act.color }}>
                  {act.icon === 'building' && <FaBuilding />}
                  {act.icon === 'bug' && <FaBug />}
                  {act.icon === 'syringe' && <FaSyringe />}
                  {act.icon === 'walking' && <FaWalking />}
                  {/* Fallback */}
                  {(!['building', 'bug', 'syringe', 'walking'].includes(act.icon)) && <FaCheckCircle />}
                </div>
                <div className="activity-content">
                  <p>{act.message}</p>
                  <span>{new Date(act.time).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="table-card">
          <div className="table-header"><h3>Pending Approvals</h3></div>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Farm</th><th>Owner</th><th>Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {pendingApprovals.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>No pending approvals.</td></tr>
                )}
                {pendingApprovals.map(farm => (
                  <tr key={farm._id}>
                    <td><strong>{farm.farmName}</strong></td>
                    <td>{farm.ownerName}</td>
                    <td>{new Date(farm.createdAt).toLocaleDateString()}</td>
                    <td><span className="status-badge pending">Pending</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" style={{color: '#3b82f6', background: '#eff6ff'}} title="View Details" onClick={() => setSelectedFarm(farm)}><FaEye /></button>
                        <button className="btn-icon approve" title="Approve" onClick={() => handleApprove(farm._id)}><FaCheck /></button>
                        <button className="btn-icon reject" title="Reject" onClick={() => handleReject(farm._id)}><FaTimes /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 5: Notifications & Quick Actions */}
      <div className="tables-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="table-card">
          <div className="table-header"><h3>Notifications</h3></div>
          <div className="activity-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {notifications.length === 0 && <p style={{ padding: '1rem', color: '#6b7280' }}>No new notifications.</p>}
            {notifications.map((notif, idx) => (
              <div className="activity-item" key={notif._id || idx}>
                <div className="activity-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  <FaBell />
                </div>
                <div className="activity-content">
                  <p><strong>{notif.title}</strong> {notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="table-card">
          <div className="table-header"><h3>Quick Actions</h3></div>
          <div className="quick-actions-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <button className="quick-action-btn" onClick={() => window.location.hash = 'register'}><div className="icon" style={{ color: '#10b981' }}><FaPlus /></div><span>Register Farm</span></button>
            <button className="quick-action-btn"><div className="icon" style={{ color: '#3b82f6' }}><FaCheckCircle /></div><span>Approve Applications</span></button>
            <button className="quick-action-btn"><div className="icon" style={{ color: '#8b5cf6' }}><FaUsers /></div><span>Create Farm Owner</span></button>
            <button className="quick-action-btn"><div className="icon" style={{ color: '#f59e0b' }}><FaPaw /></div><span>Add Breed</span></button>
            <button className="quick-action-btn"><div className="icon" style={{ color: '#ea580c' }}><FaSyringe /></div><span>Add Vaccine</span></button>
            <button className="quick-action-btn"><div className="icon" style={{ color: '#4f46e5' }}><FaFileAlt /></div><span>Generate Reports</span></button>
            <button className="quick-action-btn"><div className="icon" style={{ color: '#e11d48' }}><FaBell /></div><span>Send Notification</span></button>
            <button className="quick-action-btn"><div className="icon" style={{ color: '#4b5563' }}><FaDatabase /></div><span>Backup Database</span></button>
          </div>
        </div>
      </div>

      {/* Farm Details Modal */}
      {selectedFarm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#1e293b' }}>Farm Application Details</h2>
              <button onClick={() => setSelectedFarm(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}><FaTimes /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div><strong style={{ color: '#64748b', fontSize: '0.85rem' }}>Farm Name</strong><div style={{ fontWeight: '500', color: '#0f172a' }}>{selectedFarm.farmName}</div></div>
              <div><strong style={{ color: '#64748b', fontSize: '0.85rem' }}>Registration Number</strong><div style={{ fontWeight: '500', color: '#0f172a' }}>{selectedFarm.registrationNumber || 'N/A'}</div></div>
              <div><strong style={{ color: '#64748b', fontSize: '0.85rem' }}>Owner Name</strong><div style={{ fontWeight: '500', color: '#0f172a' }}>{selectedFarm.ownerName}</div></div>
              <div><strong style={{ color: '#64748b', fontSize: '0.85rem' }}>Owner Email</strong><div style={{ fontWeight: '500', color: '#0f172a' }}>{selectedFarm.ownerEmail}</div></div>
              <div><strong style={{ color: '#64748b', fontSize: '0.85rem' }}>Farm Type</strong><div style={{ fontWeight: '500', color: '#0f172a' }}>{selectedFarm.farmType || 'N/A'}</div></div>
              <div><strong style={{ color: '#64748b', fontSize: '0.85rem' }}>Farm Area</strong><div style={{ fontWeight: '500', color: '#0f172a' }}>{selectedFarm.farmArea || 'N/A'}</div></div>
              <div style={{ gridColumn: 'span 2' }}><strong style={{ color: '#64748b', fontSize: '0.85rem' }}>Address</strong><div style={{ fontWeight: '500', color: '#0f172a' }}>{selectedFarm.farmAddress || 'N/A'}, {selectedFarm.district || 'N/A'}, {selectedFarm.state || 'N/A'} {selectedFarm.pinCode || ''}</div></div>
              <div><strong style={{ color: '#64748b', fontSize: '0.85rem' }}>Approx Animals</strong><div style={{ fontWeight: '500', color: '#0f172a' }}>{selectedFarm.approxNumberOfAnimals || 'N/A'}</div></div>
              <div><strong style={{ color: '#64748b', fontSize: '0.85rem' }}>Number of Sheds</strong><div style={{ fontWeight: '500', color: '#0f172a' }}>{selectedFarm.numberOfSheds || 'N/A'}</div></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
               <button className="btn-secondary" onClick={() => { handleReject(selectedFarm._id); setSelectedFarm(null); }}>Reject</button>
               <button className="btn-primary" onClick={() => { handleApprove(selectedFarm._id); setSelectedFarm(null); }}>Approve Farm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
