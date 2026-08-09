import React from 'react';
import { FaLeaf, FaUsers, FaBullseye, FaLightbulb, FaShieldAlt, FaHandshake } from 'react-icons/fa';
import { GiPig, GiFarmer } from 'react-icons/gi';

const teamMembers = [
  {
    name: 'Mohammed Suhail J',
    role: 'Chief Veterinarian & Co-Founder',
    bio: 'Over 15 years in livestock health management. Passionate about integrating technology with animal welfare.',
    icon: <GiFarmer />,
  },
  {
    name: 'Mukesh S',
    role: 'Lead Software Engineer',
    bio: 'Full-stack developer specializing in agri-tech platforms and real-time data systems.',
    icon: <FaLightbulb />,
  },
  {
    name: 'Muralidharan S',
    role: 'Farm Operations Expert',
    bio: 'Seasoned farm manager with deep expertise in biosecurity protocols and feed management.',
    icon: <GiPig />,
  },
  {
    name: 'Naveen A',
    role: 'Data & Analytics Lead',
    bio: 'Transforms raw farm data into actionable insights that drive productivity and profit.',
    icon: <FaShieldAlt />,
  },
];

const values = [
  {
    icon: <FaBullseye />,
    title: 'Our Mission',
    description:
      'To empower farmers and farm managers with intelligent digital tools that simplify operations, improve animal welfare, and boost profitability.',
  },
  {
    icon: <FaUsers />,
    title: 'Our Vision',
    description:
      'A world where every farm, large or small, has access to cutting-edge management technology — making sustainable agriculture the global standard.',
  },
  {
    icon: <FaHandshake />,
    title: 'Our Values',
    description:
      'Transparency, innovation, and farmer-first thinking guide every decision we make. We build for the people working the land, not around them.',
  },
];

function AboutPage() {
  return (
    <div id="about" className="about-page">

      {/* Hero Banner */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-badge">
            <FaLeaf className="about-badge-icon" />
            <span>About Us</span>
          </div>
          <h1>
            Built for Farmers, <span className="highlight">Powered by Technology</span>
          </h1>
          <p>
            FarmManager was founded by a team of veterinarians, engineers, and farm experts who
            understood that modern agriculture deserved modern tools. We bridge the gap between
            the field and the future.
          </p>
        </div>
        <div className="about-hero-visual">
          <div className="about-hero-card">
            <div className="about-stat-ring">
              <span className="ring-number">10K+</span>
              <span className="ring-label">Farms Served</span>
            </div>
          </div>
          <div className="about-hero-card accent">
            <div className="about-stat-ring">
              <span className="ring-number">98%</span>
              <span className="ring-label">Satisfaction Rate</span>
            </div>
          </div>
          <div className="about-hero-card">
            <div className="about-stat-ring">
              <span className="ring-number">5+</span>
              <span className="ring-label">Years of Innovation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="about-values-section">
        <div className="section-header">
          <h2>What Drives Us</h2>
          <p>Our principles guide every feature we build and every farm we serve.</p>
        </div>
        <div className="about-values-grid">
          {values.map((v, i) => (
            <div className="about-value-card" key={i}>
              <div className="about-value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story-section">
        <div className="about-story-text">
          <h2>Our Story</h2>
          <p>
            FarmManager began in 2019 when our co-founder, Dr. Ananya Rajan, struggled to manage
            health records for over 500 pigs across three farms using paper logs and spreadsheets.
            She partnered with Arjun Menon to build a simple digital tracker — and what started
            as an internal tool quickly became the platform you see today.
          </p>
          <p>
            We have since grown into a full-suite farm management portal, serving thousands of
            farms across the country. Our platform now supports multi-farm oversight, real-time
            biosecurity monitoring, automated feeding schedules, and detailed veterinary records
            — all from a single dashboard.
          </p>
          <div className="specialty-tags">
            <div className="specialty-card pig">
              <span className="specialty-emoji">🐷</span>
              <span className="specialty-label">Pig Farming</span>
              <div className="specialty-bar"></div>
            </div>
            <div className="specialty-card poultry">
              <span className="specialty-emoji">🐔</span>
              <span className="specialty-label">Poultry</span>
              <div className="specialty-bar"></div>
            </div>
            <div className="specialty-card analytics">
              <span className="specialty-emoji">📊</span>
              <span className="specialty-label">Analytics</span>
              <div className="specialty-bar"></div>
            </div>
            <div className="specialty-card biosecurity">
              <span className="specialty-emoji">🔒</span>
              <span className="specialty-label">Biosecurity</span>
              <div className="specialty-bar"></div>
            </div>
            <div className="specialty-card veterinary">
              <span className="specialty-emoji">💊</span>
              <span className="specialty-label">Veterinary</span>
              <div className="specialty-bar"></div>
            </div>
          </div>
        </div>
        <div className="about-story-visual">
          <div className="story-timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-year">2019</span>
                <p>Founded with a vision to digitize farm management</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-year">2021</span>
                <p>Launched multi-farm dashboard & biosecurity module</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-year">2023</span>
                <p>Reached 5,000+ farms with real-time analytics</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-year">2025</span>
                <p>10,000+ farms managed — expanding globally</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team-section">
        <div className="section-header">
          <h2>Meet the Team</h2>
          <p>The passionate people behind FarmManager's mission.</p>
        </div>
        <div className="about-team-grid">
          {teamMembers.map((member, i) => (
            <div className="about-team-card" key={i}>
              <div className={member.photo ? 'team-avatar team-avatar--photo' : 'team-avatar'}>
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="team-avatar-img"
                  />
                ) : (
                  <div className="team-avatar-icon">{member.icon}</div>
                )}
              </div>
              <h3>{member.name}</h3>
              <span className="team-role">{member.role}</span>
              <p>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <div className="about-cta-content">
          <h2>Ready to Transform Your Farm?</h2>
          <p>Join thousands of farmers already using FarmManager to operate smarter.</p>
          <div className="about-cta-buttons">
            <button className="btn-primary large">Get Started Free</button>
            <button className="btn-outline large">Contact Us</button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default AboutPage;
