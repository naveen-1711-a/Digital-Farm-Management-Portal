import React from 'react';
import {
  FaShieldAlt, FaChartLine, FaTractor,
  FaUserMd, FaLock, FaCogs,
  FaBell, FaMapMarkerAlt, FaLeaf, FaChartBar,
} from 'react-icons/fa';
import { GiPig, GiFarmer } from 'react-icons/gi';
import { MdMonitor, MdAnalytics } from 'react-icons/md';

const features = [
  {
    icon: <FaShieldAlt />,
    title: 'Biosecurity Management',
    desc: 'Track visitor logs, sanitization schedules, and disease prevention protocols across all farm units in real time.',
    category: 'Biosecurity',
    color: 'emerald',
    badge: 'Core',
  },
  {
    icon: <GiPig />,
    title: 'Animal Registration',
    desc: 'Maintain detailed records of breed, age, health status, weight logs, and RFID tags for every animal.',
    category: 'Livestock',
    color: 'rose',
    badge: 'Popular',
  },
  {
    icon: <FaChartLine />,
    title: 'Real-time Reports',
    desc: 'Generate farm-wise population stats, mortality rates, and performance analytics with one click.',
    category: 'Analytics',
    color: 'blue',
    badge: 'New',
  },
  {
    icon: <FaTractor />,
    title: 'Feed & Inventory',
    desc: 'Automate stock alerts, daily feed consumption tracking, and supplier management with smart thresholds.',
    category: 'Operations',
    color: 'amber',
    badge: 'Core',
  },
  {
    icon: <FaUserMd />,
    title: 'Veterinary Records',
    desc: 'Log diagnoses, prescriptions, vaccination schedules, and treatment history for every animal.',
    category: 'Livestock',
    color: 'violet',
    badge: 'Popular',
  },
  {
    icon: <FaLock />,
    title: 'Role-based Access',
    desc: 'Assign custom roles — Admin, Vet, Manager, Worker — each with tailored access and permissions.',
    category: 'Biosecurity',
    color: 'teal',
    badge: 'Core',
  },
  {
    icon: <FaBell />,
    title: 'Smart Alerts',
    desc: 'Receive instant notifications for critical events — disease outbreaks, feed shortages, or mortality spikes.',
    category: 'Analytics',
    color: 'amber',
    badge: 'New',
  },
  {
    icon: <FaMapMarkerAlt />,
    title: 'Multi-Farm Overview',
    desc: 'Manage all your farm locations from one unified dashboard with location-wise performance breakdowns.',
    category: 'Operations',
    color: 'blue',
    badge: 'New',
  },
];

const steps = [
  {
    step: '01',
    icon: <GiFarmer />,
    title: 'Register Your Farm',
    desc: 'Set up your farm profile, add multiple locations, and invite your team members with defined roles in minutes.',
    tag: 'Quick Setup',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    glow: 'rgba(16,185,129,0.35)',
  },
  {
    step: '02',
    icon: <GiPig />,
    title: 'Add Your Livestock',
    desc: 'Register all animals with RFID tags, breed details, health history, and weight data from day one.',
    tag: 'Data Entry',
    gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)',
    glow: 'rgba(59,130,246,0.35)',
  },
  {
    step: '03',
    icon: <MdMonitor />,
    title: 'Monitor & Manage',
    desc: 'Use the live dashboard to track biosecurity events, feed consumption, vet records, and alerts — daily.',
    tag: 'Live Dashboard',
    gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    glow: 'rgba(139,92,246,0.35)',
  },
  {
    step: '04',
    icon: <MdAnalytics />,
    title: 'Analyse & Grow',
    desc: 'Generate farm-wide reports, spot performance trends, and make confident data-driven decisions for profit.',
    tag: 'Insights',
    gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
    glow: 'rgba(251,191,36,0.35)',
  },
];

const stats = [
  { number: '10K+', label: 'Farms Managed' },
  { number: '2M+', label: 'Animals Tracked' },
  { number: '99.9%', label: 'Uptime' },
  { number: '50+', label: 'Features' },
];

const colorMap = {
  emerald: { border: '#10b981', iconBg: 'rgba(16,185,129,0.12)', iconColor: '#059669' },
  rose:    { border: '#fb7185', iconBg: 'rgba(251,113,133,0.12)', iconColor: '#e11d48' },
  blue:    { border: '#60a5fa', iconBg: 'rgba(59,130,246,0.12)',  iconColor: '#2563eb' },
  amber:   { border: '#fbbf24', iconBg: 'rgba(251,191,36,0.12)',  iconColor: '#d97706' },
  violet:  { border: '#a78bfa', iconBg: 'rgba(139,92,246,0.12)',  iconColor: '#7c3aed' },
  teal:    { border: '#2dd4bf', iconBg: 'rgba(45,212,191,0.12)',  iconColor: '#0d9488' },
};

function FeaturesPage() {
  return (
    <div id="features-page" className="features-page">

      {/* Hero */}
      <section className="fp-hero">
        <div className="fp-hero-inner">
          <div className="fp-badge">
            <FaCogs className="fp-badge-icon" />
            <span>Platform Features</span>
          </div>
          <h1>Everything You Need to <span className="highlight">Run a Smart Farm</span></h1>
          <p>
            From biosecurity to analytics, FarmManager brings every aspect of your livestock
            operation into one powerful, easy-to-use platform.
          </p>
          <div className="fp-hero-stats">
            {stats.map((s, i) => (
              <div className="fp-stat" key={i}>
                <span className="fp-stat-num">{s.number}</span>
                <span className="fp-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="fp-grid-section">
        <div className="section-header">
          <h2>Powerful Features</h2>
          <p>Built for every role — from farm workers to administrators.</p>
        </div>

        <div className="fp-cards-grid">
          {features.map((feature, i) => {
            const c = colorMap[feature.color];
            return (
              <div
                className="fp-card"
                key={i}
                style={{ '--card-border': c.border }}
              >
                <div
                  className="fp-card-icon"
                  style={{ background: c.iconBg, color: c.iconColor }}
                >
                  {feature.icon}
                </div>
                <h3 className="fp-card-title">{feature.title}</h3>
                <p className="fp-card-desc">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works */}
      <section className="fp-how-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get up and running in four simple steps.</p>
        </div>

        <div className="fp-steps-wrapper">
          {/* Connecting line */}
          <div className="fp-steps-line" />

          <div className="fp-steps-grid">
            {steps.map((s, i) => (
              <div className="fp-step" key={i}>
                {/* Gradient circle */}
                <div
                  className="fp-step-circle"
                  style={{ background: s.gradient, boxShadow: `0 8px 24px ${s.glow}` }}
                >
                  <span className="fp-step-icon">{s.icon}</span>
                  <span className="fp-step-num">{s.step}</span>
                </div>

                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <div className="fp-step-arrow">›</div>
                )}

                <div className="fp-step-card">
                  <span
                    className="fp-step-tag"
                    style={{ background: s.gradient }}
                  >
                    {s.tag}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default FeaturesPage;
