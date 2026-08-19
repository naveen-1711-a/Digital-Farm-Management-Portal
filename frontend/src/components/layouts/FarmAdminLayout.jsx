import React, { useState } from 'react';
import '../../styles/admin.css';
import {
  FaLeaf, FaHome, FaBuilding, FaUsers, FaPaw, FaSyringe, FaBug,
  FaSeedling, FaPills, FaUserMd, FaHardHat, FaShieldAlt, FaChartBar,
  FaBell, FaCog, FaUserCircle, FaSignOutAlt, FaSearch, FaChevronDown,
  FaBars, FaPlus, FaHeart, FaMicrochip, FaCalendarAlt, FaRobot
} from 'react-icons/fa';

const FarmAdminLayout = ({ children, activeMenu, setActiveMenu }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [userProfile, setUserProfile] = useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
    }
  }, []);

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
      title: 'Livestock', items: [
        {
          id: 'animals', label: 'Animal Management', icon: <FaPaw />,
          submenus: ['All Animals', 'Register Animal', 'Animal Health', 'RFID Management']
        },
        {
          id: 'vaccinations', label: 'Vaccination Management', icon: <FaSyringe />,
          submenus: ['Vaccination Schedule', 'Due Vaccinations', 'Vaccination History']
        },
        {
          id: 'disease', label: 'Disease & Treatment', icon: <FaBug />,
          submenus: ['Disease Cases', 'Treatments', 'Isolation Records', 'Recovery Status']
        }
      ]
    },
    {
      title: 'Inventory', items: [
        {
          id: 'feed', label: 'Feed Management', icon: <FaSeedling />,
          submenus: ['Feed Inventory', 'Feed Purchase', 'Feed Consumption', 'Suppliers']
        },
        {
          id: 'medicine', label: 'Medicine Management', icon: <FaPills />,
          submenus: ['Medicine Inventory', 'Medicine Usage', 'Expiry Alerts']
        }
      ]
    },
    {
      title: 'Operations', items: [
        {
          id: 'managers', label: 'Farm Managers', icon: <FaUsers />,
          submenus: ['All Managers', 'Add Manager']
        },
        {
          id: 'workers', label: 'Worker Management', icon: <FaHardHat />,
          submenus: ['All Workers', 'Attendance', 'Leave Requests', 'Task Assignment']
        },
        {
          id: 'veterinarians', label: 'Veterinarian', icon: <FaUserMd />,
          submenus: ['Veterinarian List', 'Health Records', 'Veterinary Reports']
        },
        {
          id: 'sheds', label: 'Shed Management', icon: <FaBuilding />,
          submenus: ['All Sheds', 'Shed Capacity', 'Animal Allocation', 'Cleaning Schedule']
        },
        {
          id: 'biosecurity', label: 'Biosecurity', icon: <FaShieldAlt />,
          submenus: ['Visitor Register', 'Vehicle Register', 'PPE Checklist', 'Sanitization Logs', 'Footbath Records']
        },
        {
          id: 'calendar', label: 'Schedule & Calendar', icon: <FaCalendarAlt />
        }
      ]
    },
    {
      title: 'System', items: [
        {
          id: 'reports', label: 'Reports', icon: <FaChartBar />,
          submenus: ['Animal Reports', 'Vaccination Reports', 'Feed Reports', 'Medicine Reports', 'Attendance Reports', 'Disease Reports']
        },
        { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
        { id: 'settings', label: 'Farm Settings', icon: <FaCog /> }
      ]
    },
    {
      title: '🤖 AI Intelligence', items: [
        { id: 'integrity-overview', label: 'Farm Integrity Center', icon: <FaRobot />, highlight: true },
        { id: 'farm-guard', label: 'FarmGuard AI Live', icon: <FaMicrochip />, highlight: true },
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
          <h2>FarmOwner</h2>
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
                      <span className="menu-icon" style={item.highlight ? { color: '#f59e0b' } : {}}>{item.icon}</span>
                      <span style={item.highlight ? { color: '#f59e0b', fontWeight: 700 } : {}}>{item.label}</span>
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
            <span>My Profile</span>
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
              <input type="text" placeholder="Search animals, staff, inventory..." />
              <span className="search-kbd">⌘K</span>
            </div>
          </div>

          <div className="header-actions">
            <button className="action-btn">
              <FaBell />
              <span className="notification-badge">7</span>
            </button>

            <div className="header-profile" onClick={() => { if (setActiveMenu) setActiveMenu('profile'); }}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.ownerName || 'User')}&background=10b981&color=fff`} alt="Owner" />
              <div className="profile-info">
                <span className="profile-name">{userProfile?.ownerName || 'Farm Owner'}</span>
                <span className="profile-role">{userProfile?.role === 'farm_manager' ? 'Manager' : 'Admin'}</span>
              </div>
              <FaChevronDown style={{ fontSize: '0.75rem', color: '#6b7280' }} />
            </div>
          </div>
        </header>

        <div className="admin-content" style={{ background: '#f1f5f9', minHeight: 'calc(100vh - 70px)' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default FarmAdminLayout;
