import React, { useState, useEffect } from 'react';
import './styles/index.css';
import { FaLeaf, FaBars, FaTimes } from 'react-icons/fa';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import DiseasePredictionPage from './pages/DiseasePredictionPage';
import AIPredictionHub from './pages/AIPredictionHub';
import FarmadminSignuppage from './pages/auth/FarmadminSignuppage';
import LoginPage from './pages/auth/LoginPage';
import Footer from './components/Footer';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import FarmAdminLayout from './components/layouts/FarmAdminLayout';
import FarmAdminDashboard from './pages/farmAdmin/FarmAdminDashboard';
import AddFarmManager from './pages/farmAdmin/AddFarmManager';
import AllFarmManagers from './pages/farmAdmin/AllFarmManagers';
import FarmCalendar from './pages/farmAdmin/FarmCalendar';
import ManagerLayout from './components/layouts/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AnimalManagement from './pages/manager/AnimalManagement';
import VaccinationManagement from './pages/manager/VaccinationManagement';
import DiseaseTreatment from './pages/manager/DiseaseTreatment';
import FeedManagement from './pages/manager/FeedManagement';
import MedicineManagement from './pages/manager/MedicineManagement';
import WorkerManagement from './pages/manager/WorkerManagement';
import AttendanceManagement from './pages/manager/AttendanceManagement';
import ShedManagement from './pages/manager/ShedManagement';
import BiosecurityManagement from './pages/manager/BiosecurityManagement';
import TasksManagement from './pages/manager/TasksManagement';
import ReportsManagement from './pages/manager/ReportsManagement';
import NotificationsManagement from './pages/manager/NotificationsManagement';
import ProfileManagement from './pages/manager/ProfileManagement';
import VeterinarianManagement from './pages/manager/VeterinarianManagement';
import IntegrityCenter from './pages/manager/IntegrityCenter';
import IntegrityOverview from './pages/farmAdmin/IntegrityOverview';
import FarmGuardDashboard from './pages/farmAdmin/FarmGuardDashboard';
import { Toaster } from 'react-hot-toast';
import VoiceAssistant from './components/VoiceAssistant';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [activeAdminMenu, setActiveAdminMenu] = useState('dashboard');
  const [activeFarmAdminMenu, setActiveFarmAdminMenu] = useState('dashboard');
  const [activeManagerMenu, setActiveManagerMenu] = useState('dashboard');
  const [selectedRole, setSelectedRole] = useState('Overall Admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync with URL hash on load and changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'about') setActivePage('about');
      else if (hash === 'features') setActivePage('features');
      else if (hash === 'contact') setActivePage('contact');
      else if (hash === 'ai-disease-prediction') setActivePage('ai-disease-prediction');
      else if (hash === 'ai-feed-prediction') setActivePage('ai-feed-prediction');
      else if (hash === 'ai-medicine-prediction') setActivePage('ai-medicine-prediction');
      else if (hash === 'register') setActivePage('register');
      else if (hash === 'login') setActivePage('login');
      else if (hash === 'admin-dashboard') setActivePage('admin-dashboard');
      else if (hash === 'farm-dashboard') setActivePage('farm-dashboard');
      else if (hash === 'manager-dashboard') setActivePage('manager-dashboard');
      else setActivePage('home');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page) => {
    setActivePage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleGlobalLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('home');
  };

  const handleVoiceNavigate = (target) => {
    if (target.startsWith('role-')) {
      if (target === 'role-manager') setSelectedRole('Manager');
      else if (target === 'role-owner') setSelectedRole('Farm Admin');
      else if (target === 'role-admin') setSelectedRole('Overall Admin');
      navigate('login');
      return;
    }

    const globalPages = ['home', 'about', 'features', 'contact', 'login', 'register', 'admin-dashboard', 'farm-dashboard', 'manager-dashboard', 'ai-disease-prediction', 'ai-feed-prediction', 'ai-medicine-prediction'];
    if (globalPages.includes(target)) {
      navigate(target);
    } else if (activePage === 'admin-dashboard') {
      setActiveAdminMenu(target);
    } else if (activePage === 'farm-dashboard') {
      setActiveFarmAdminMenu(target);
    } else if (activePage === 'manager-dashboard') {
      setActiveManagerMenu(target);
    } else {
      navigate(target);
    }
  };

  const renderContent = () => {
    if (activePage === 'admin-dashboard') {
      return (
        <AdminLayout activeMenu={activeAdminMenu} setActiveMenu={setActiveAdminMenu}>
          {activeAdminMenu === 'profile' ? <AdminProfile /> : <AdminDashboard />}
        </AdminLayout>
      );
    }

    if (activePage === 'farm-dashboard') {
      let FarmContent;
      if (activeFarmAdminMenu === 'managers-add-manager') {
        FarmContent = <AddFarmManager />;
      } else if (activeFarmAdminMenu === 'managers-all-managers') {
        FarmContent = <AllFarmManagers />;
      } else if (activeFarmAdminMenu === 'calendar') {
        FarmContent = <FarmCalendar />;
      } else if (activeFarmAdminMenu === 'integrity-overview') {
        FarmContent = <IntegrityOverview />;
      } else if (activeFarmAdminMenu === 'farm-guard') {
        FarmContent = <FarmGuardDashboard />;
      } else {
        FarmContent = <FarmAdminDashboard />;
      }

      return (
        <FarmAdminLayout activeMenu={activeFarmAdminMenu} setActiveMenu={setActiveFarmAdminMenu}>
          {FarmContent}
        </FarmAdminLayout>
      );
    }

    if (activePage === 'manager-dashboard') {
      let ManagerContent;
      switch (activeManagerMenu) {
        case 'animals': ManagerContent = <AnimalManagement />; break;
        case 'vaccinations': ManagerContent = <VaccinationManagement />; break;
        case 'disease': ManagerContent = <DiseaseTreatment />; break;
        case 'veterinarian': ManagerContent = <VeterinarianManagement />; break;
        case 'feed': ManagerContent = <FeedManagement />; break;
        case 'medicine': ManagerContent = <MedicineManagement />; break;
        case 'workers': ManagerContent = <WorkerManagement />; break;
        case 'attendance': ManagerContent = <AttendanceManagement />; break;
        case 'sheds': ManagerContent = <ShedManagement />; break;
        case 'biosecurity': ManagerContent = <BiosecurityManagement />; break;
        case 'tasks': ManagerContent = <TasksManagement />; break;
        case 'reports': ManagerContent = <ReportsManagement />; break;
        case 'notifications': ManagerContent = <NotificationsManagement />; break;
        case 'profile': ManagerContent = <ProfileManagement />; break;
        case 'integrity': ManagerContent = <IntegrityCenter />; break;
        case 'farm-guard': ManagerContent = <FarmGuardDashboard />; break;
        default: ManagerContent = <ManagerDashboard />; break;
      }

      return (
        <ManagerLayout activeMenu={activeManagerMenu} setActiveMenu={setActiveManagerMenu}>
          {ManagerContent}
        </ManagerLayout>
      );
    }

    return (
      <div className="app-container">
        <nav className="navbar">
          <div className="logo" onClick={() => navigate('home')} style={{ cursor: 'pointer' }}>
            <FaLeaf className="logo-icon" />
            <span>Poultry AI</span>
          </div>

          {/* Desktop nav links */}
          <ul className="nav-links">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); navigate('home'); }} style={{ color: activePage === 'home' ? 'var(--primary)' : '' }}>Home</a></li>
            <li><a href="#features" onClick={(e) => { e.preventDefault(); navigate('features'); }} style={{ color: activePage === 'features' ? 'var(--primary)' : '' }}>Features</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); navigate('about'); }} style={{ color: activePage === 'about' ? 'var(--primary)' : '' }}>About</a></li>
            <li><a href="#ai-disease-prediction" onClick={(e) => { e.preventDefault(); navigate('ai-disease-prediction'); }} style={{ color: activePage === 'ai-disease-prediction' ? 'var(--primary)' : '' }}>AI Disease</a></li>
            <li><a href="#ai-feed-prediction" onClick={(e) => { e.preventDefault(); navigate('ai-feed-prediction'); }} style={{ color: activePage === 'ai-feed-prediction' ? 'var(--primary)' : '' }}>AI Feed</a></li>
            <li><a href="#contact" onClick={(e) => { e.preventDefault(); navigate('contact'); }} style={{ color: activePage === 'contact' ? 'var(--primary)' : '' }}>Contact</a></li>
            <li><a href="#register" onClick={(e) => { e.preventDefault(); navigate('register'); }} style={{ color: activePage === 'register' ? 'var(--primary)' : '' }}>Sign Up</a></li>
          </ul>

          {/* Desktop action buttons */}
          <div className="nav-actions">
            <button className="btn-secondary" onClick={() => navigate('login')}>Login</button>
            <button className="btn-primary" onClick={() => navigate('register')}>Get Started</button>
          </div>

          {/* Hamburger button (mobile only) */}
          <button
            className={`hamburger-btn${mobileMenuOpen ? ' open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </nav>

        {/* Mobile menu overlay */}
        <div className={`mobile-menu-overlay${mobileMenuOpen ? ' active' : ''}`} onClick={() => setMobileMenuOpen(false)} />

        {/* Mobile slide-in menu */}
        <div className={`mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
          <div className="mobile-menu-header">
            <div className="logo">
              <FaLeaf className="logo-icon" />
              <span>Poultry AI</span>
            </div>
            <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
              <FaTimes />
            </button>
          </div>
          <nav className="mobile-nav">
            <button className={`mobile-nav-link${activePage === 'home' ? ' active' : ''}`} onClick={() => navigate('home')}>
              🏠 Home
            </button>
            <button className={`mobile-nav-link${activePage === 'features' ? ' active' : ''}`} onClick={() => navigate('features')}>
              ⚡ Features
            </button>
            <button className={`mobile-nav-link${activePage === 'about' ? ' active' : ''}`} onClick={() => navigate('about')}>
              ℹ️ About
            </button>
            <button className={`mobile-nav-link${activePage === 'ai-disease-prediction' ? ' active' : ''}`} onClick={() => navigate('ai-disease-prediction')}>
              🦠 AI Disease Prediction
            </button>
            <button className={`mobile-nav-link${activePage === 'ai-feed-prediction' ? ' active' : ''}`} onClick={() => navigate('ai-feed-prediction')}>
              🌾 AI Feed Prediction
            </button>
            <button className={`mobile-nav-link${activePage === 'contact' ? ' active' : ''}`} onClick={() => navigate('contact')}>
              📞 Contact
            </button>
            <button className={`mobile-nav-link${activePage === 'register' ? ' active' : ''}`} onClick={() => navigate('register')}>
              ✨ Sign Up
            </button>
          </nav>
          <div className="mobile-menu-actions">
            <button className="btn-secondary mobile-btn-full" onClick={() => navigate('login')}>Login</button>
            <button className="btn-primary mobile-btn-full" onClick={() => navigate('register')}>Get Started</button>
          </div>
        </div>

        <main>
          {activePage === 'about' ? <AboutPage /> :
            activePage === 'features' ? <FeaturesPage /> :
              activePage === 'contact' ? <ContactPage /> :
                activePage === 'ai-disease-prediction' ? <DiseasePredictionPage /> :
                  (activePage === 'ai-feed-prediction' || activePage === 'ai-medicine-prediction') ? <AIPredictionHub /> :
                    activePage === 'register' ? <FarmadminSignuppage /> :
                      activePage === 'login' ? <LoginPage initialRole={selectedRole} /> :
                        <HomePage />}
        </main>

        <Footer />
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <VoiceAssistant onNavigate={handleVoiceNavigate} onLogout={handleGlobalLogout} />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
