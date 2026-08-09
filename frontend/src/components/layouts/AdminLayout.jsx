import React, { useState } from 'react';
import '../../styles/admin.css';
import {
  FaLeaf, FaHome, FaBuilding, FaUsers, FaPaw, FaSyringe, FaBug,
  FaSeedling, FaPills, FaUserMd, FaHardHat, FaClipboardList,
  FaTasks, FaWalking, FaTractor, FaShieldAlt, FaChartBar,
  FaBell, FaHistory, FaDatabase, FaCog, FaUserCircle, FaSignOutAlt,
  FaSearch, FaChevronDown, FaBars, FaChevronRight
} from 'react-icons/fa';

const AdminLayout = ({ children, activeMenu, setActiveMenu }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (id) => {
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const menuItems = [
    {
      title: 'Overview', items: [
        { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> }
      ]
    },
    {
      title: 'Core Modules', items: [
        {
          id: 'farms', label: 'Farm Management', icon: <FaBuilding />,
          submenus: ['All Farms', 'Pending Approvals', 'Approved Farms', 'Rejected Farms']
        },
        {
          id: 'users', label: 'User Management', icon: <FaUsers />,
          submenus: ['Farm Owners', 'Farm Managers', 'Veterinarians', 'Workers']
        },
        { id: 'animals', label: 'Animal Management', icon: <FaPaw /> },
        { id: 'vaccinations', label: 'Vaccinations', icon: <FaSyringe /> },
        { id: 'diseases', label: 'Disease Monitoring', icon: <FaBug /> },
        { id: 'feed', label: 'Feed Inventory', icon: <FaSeedling /> },
        { id: 'medicine', label: 'Medicine Inventory', icon: <FaPills /> }
      ]
    },
    {
      title: 'Staff & Ops', items: [
        { id: 'veterinarians', label: 'Veterinarians', icon: <FaUserMd /> },
        { id: 'workers', label: 'Workers', icon: <FaHardHat /> },
        { id: 'attendance', label: 'Attendance', icon: <FaClipboardList /> },
        { id: 'tasks', label: 'Tasks', icon: <FaTasks /> },
        { id: 'visitors', label: 'Visitors', icon: <FaWalking /> },
        { id: 'vehicles', label: 'Vehicles', icon: <FaTractor /> },
        { id: 'biosecurity', label: 'Biosecurity', icon: <FaShieldAlt /> }
      ]
    },
    {
      title: 'System', items: [
        { id: 'reports', label: 'Reports & Analytics', icon: <FaChartBar /> },
        { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
        { id: 'audit', label: 'Audit Logs', icon: <FaHistory /> },
        {
          id: 'master', label: 'Master Data', icon: <FaDatabase />,
          submenus: ['Animal Breeds', 'Vaccines', 'Diseases', 'Feed Categories', 'Medicine Categories']
        },
        { id: 'settings', label: 'System Settings', icon: <FaCog /> }
      ]
    }
  ];

  const handleMenuClick = (item) => {
    if (item.submenus) {
      toggleMenu(item.id);
    } else {
      if (setActiveMenu) setActiveMenu(item.id);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', width: sidebarOpen ? '260px' : '0' }}>
        <div className="admin-sidebar-header">
          <FaLeaf style={{ color: 'var(--primary)', fontSize: '1.5rem' }} />
          <h2>FarmManager</h2>
        </div>

        <div className="admin-sidebar-menu">
          {menuItems.map((category, idx) => (
            <div key={idx} className="menu-category">
              <div className="menu-category-title">{category.title}</div>
              {category.items.map(item => (
                <div key={item.id}>
                  <div
                    className={`menu-item ${(activeMenu === item.id || (activeMenu && activeMenu.startsWith(item.id + '-')) || expandedMenus[item.id]) ? 'active' : ''}`}
                    onClick={() => handleMenuClick(item)}
                    style={{ justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="menu-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.submenus && (
                      <FaChevronDown style={{
                        fontSize: '0.75rem',
                        transform: expandedMenus[item.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }} />
                    )}
                  </div>

                  {/* Submenus */}
                  {item.submenus && expandedMenus[item.id] && (
                    <div style={{ backgroundColor: '#f9fafb', borderLeft: '3px solid #e5e7eb', marginLeft: '1rem', padding: '0.5rem 0' }}>
                      {item.submenus.map((sub, sIdx) => {
                        const subId = `${item.id}-${sub.toLowerCase().replace(/\s+/g, '-')}`;
                        const isSubActive = activeMenu === subId;
                        return (
                          <div key={sIdx} style={{
                            padding: '0.5rem 1.5rem 0.5rem 2rem',
                            fontSize: '0.875rem',
                            color: isSubActive ? 'var(--primary)' : '#4b5563',
                            fontWeight: isSubActive ? '600' : 'normal',
                            cursor: 'pointer'
                          }}
                            onClick={() => {
                              if (setActiveMenu) setActiveMenu(subId);
                            }}
                            onMouseEnter={(e) => { if (!isSubActive) e.currentTarget.style.color = 'var(--primary)'; }}
                            onMouseLeave={(e) => { if (!isSubActive) e.currentTarget.style.color = '#4b5563'; }}
                          >
                            • {sub}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="admin-sidebar-menu" style={{ borderTop: '1px solid #e5e7eb', marginTop: 'auto', flex: 'none', paddingBottom: '1rem' }}>
          <div
            className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`}
            onClick={() => { if (setActiveMenu) setActiveMenu('profile'); }}
          >
            <span className="menu-icon"><FaUserCircle /></span>
            <span>Profile</span>
          </div>
          <div className="menu-item" onClick={() => window.location.hash = 'home'} style={{ color: '#ef4444' }}>
            <span className="menu-icon"><FaSignOutAlt /></span>
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="action-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FaBars />
            </button>
            <div className="header-search">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search farms, users, animals..." />
              <span className="search-kbd">⌘K</span>
            </div>
          </div>

          <div className="header-actions">
            <button className="action-btn">
              <FaBell />
              <span className="notification-badge">5</span>
            </button>

            <div className="header-profile" onClick={() => { if (setActiveMenu) setActiveMenu('profile'); }}>
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=059669&color=fff" alt="Admin" />
              <div className="profile-info">
                <span className="profile-name">System Admin</span>
                <span className="profile-role">Super Admin</span>
              </div>
              <FaChevronDown style={{ fontSize: '0.75rem', color: '#6b7280' }} />
            </div>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
