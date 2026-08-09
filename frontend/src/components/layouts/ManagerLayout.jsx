import React, { useState, useEffect } from 'react';
import '../../styles/manager.css';
import { 
  FaLeaf, FaHome, FaPaw, FaSyringe, FaNotesMedical, 
  FaSeedling, FaPills, FaHardHat, FaUserClock, 
  FaBuilding, FaShieldAlt, FaClipboardList, FaFileAlt, 
  FaBell, FaUser, FaSignOutAlt, FaBars, FaSearch, FaStethoscope
} from 'react-icons/fa';
import VoiceAssistant from '../VoiceAssistant';

const ManagerLayout = ({ children, activeMenu, setActiveMenu }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.hash = 'home';
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
    { id: 'animals', label: 'Animals', icon: <FaPaw /> },
    { id: 'vaccinations', label: 'Vaccinations', icon: <FaSyringe /> },
    { id: 'disease', label: 'Disease & Treatment', icon: <FaNotesMedical /> },
    { id: 'veterinarian', label: 'Vet Command Center', icon: <FaStethoscope /> },
    { id: 'feed', label: 'Feed Management', icon: <FaSeedling /> },
    { id: 'medicine', label: 'Medicine Management', icon: <FaPills /> },
    { id: 'workers', label: 'Workers', icon: <FaHardHat /> },
    { id: 'attendance', label: 'Attendance', icon: <FaUserClock /> },
    { id: 'sheds', label: 'Shed Management', icon: <FaBuilding /> },
    { id: 'biosecurity', label: 'Biosecurity', icon: <FaShieldAlt /> },
    { id: 'tasks', label: 'Tasks', icon: <FaClipboardList /> },
    { id: 'reports', label: 'Reports', icon: <FaFileAlt /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'profile', label: 'Profile', icon: <FaUser /> }
  ];

  return (
    <div className="manager-layout">
      {/* Sidebar */}
      <aside className="manager-sidebar" style={{ 
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', 
        width: sidebarOpen ? '270px' : '0',
        padding: sidebarOpen ? '' : '0'
      }}>
        <div className="manager-sidebar-header">
          <FaLeaf style={{ color: '#818cf8', fontSize: '1.4rem' }} />
          <h2>FarmManager</h2>
        </div>
        
        <div className="manager-menu-list">
          {menuItems.map(item => (
            <div 
              key={item.id}
              className={`manager-menu-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => { if (setActiveMenu) setActiveMenu(item.id); }}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="manager-menu-item" onClick={handleLogout} style={{ color: '#fca5a5' }}>
            <span className="icon" style={{ color: '#fca5a5' }}><FaSignOutAlt /></span>
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="manager-main">
        {/* Header */}
        <header className="manager-header">
          <div className="mgr-header-left">
            <button className="mgr-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FaBars />
            </button>
            <div className="mgr-search">
              <FaSearch style={{ color: '#94a3b8' }} />
              <input type="text" placeholder="Search tasks, animals, stock..." />
            </div>
          </div>
          
          <div className="mgr-header-right">
            <button className="mgr-action-btn">
              <FaBell />
              <span className="mgr-badge">3</span>
            </button>
            
            <div className="mgr-profile" onClick={() => { if (setActiveMenu) setActiveMenu('profile'); }}>
              <div className="mgr-profile-info" style={{ textAlign: 'right' }}>
                <span className="mgr-profile-name">{userProfile?.name || 'Farm Manager'}</span>
                <span className="mgr-profile-role">Manager</span>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || 'Manager')}&background=e0e7ff&color=4f46e5`} alt="Manager" />
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="manager-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;
