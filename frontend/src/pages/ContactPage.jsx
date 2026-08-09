import React, { useState } from 'react';
import { 
  FaLeaf, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaWhatsapp, 
  FaChevronDown, 
  FaChevronUp, 
  FaRegClock, 
  FaCheckCircle,
  FaPaperPlane,
  FaShieldAlt,
  FaHeart
} from 'react-icons/fa';

const locations = [
  {
    id: 'hq',
    name: 'Tech Headquarters',
    city: 'Bengaluru, KA',
    address: 'Vasanth Nagar, Bengaluru, Karnataka 560052',
    phone: '+91 80 4912 3456',
    x: 45, // SVG coordinates
    y: 75,
  },
  {
    id: 'research',
    name: 'R&D Farm Center',
    city: 'Coimbatore, TN',
    address: 'Pollachi Road, Coimbatore, Tamil Nadu 641021',
    phone: '+91 422 289 1234',
    x: 35,
    y: 90,
  },
  {
    id: 'support',
    name: 'Eastern Support Hub',
    city: 'Kolkata, WB',
    address: 'Salt Lake Sector V, Kolkata, West Bengal 700091',
    phone: '+91 33 2357 7890',
    x: 80,
    y: 45,
  }
];

const faqs = [
  {
    question: 'How do I register multiple farms under one account?',
    answer: 'Once logged in, navigate to your Dashboard and click "Add Farm". You can configure unique parameters, livestock types (pig/poultry), and assign dedicated managers or workers to each location individually.',
  },
  {
    question: 'Can I add workers with custom access permissions?',
    answer: 'Yes! FarmManager utilizes role-based access control (RBAC). You can assign roles such as Farm Owner, Manager, Veterinarian, or Worker. Each role has strictly configured permissions (e.g., workers can update feed logs, but only veterinarians can log medical prescriptions).',
  },
  {
    question: 'Does the application work offline for remote farm areas?',
    answer: 'Our mobile companion application supports offline data caching. You can enter feed logs, biosecurity status, and daily checks without an internet connection. Once your device reconnects, the data automatically synchronizes with the cloud.',
  },
  {
    question: 'How does the biosecurity alert system operate?',
    answer: 'Our biosecurity module monitors visitor logs, sanitation intervals, and disease reports. If a parameter falls below safe protocols or if an outbreak is reported nearby, instant alerts are dispatched via SMS, email, and WhatsApp to all registered managers.',
  },
  {
    question: 'How does the WhatsApp integration work?',
    answer: 'Through our platform, sellers and buyers can directly communicate via WhatsApp for Agri-Product Marketplace transactions. Additionally, system alerts and daily summary reports can be configured to be delivered directly to your WhatsApp number.',
  }
];

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    role: 'Farmer',
    message: '',
    subscribe: true
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Active map location state
  const [activeLocation, setActiveLocation] = useState('hq');

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim()) {
      errors.message = 'Please enter your message';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    // Simulate backend request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      role: 'Farmer',
      message: '',
      subscribe: true
    });
    setFormErrors({});
    setIsSubmitted(false);
  };

  const selectedLoc = locations.find(loc => loc.id === activeLocation) || locations[0];

  return (
    <div id="contact" className="contact-page">
      
      {/* Hero Banner Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <div className="contact-badge">
            <FaLeaf className="contact-badge-icon" />
            <span>Get in Touch</span>
          </div>
          <h1>
            Let's Start a <span className="highlight">Conversation</span>
          </h1>
          <p>
            Have questions about biosecurity tracking, system integrations, or customized 
            enterprise farm deployments? Our specialized agri-tech support team is ready to assist you.
          </p>
        </div>

        {/* Dynamic Highlight Metrics Row */}
        <div className="contact-hero-metrics">
          <div className="metric-pill">
            <div className="metric-icon"><FaRegClock /></div>
            <div className="metric-text">
              <strong>&lt; 2 Hours</strong>
              <span>Average Response</span>
            </div>
          </div>
          <div className="metric-pill">
            <div className="metric-icon"><FaShieldAlt /></div>
            <div className="metric-text">
              <strong>99.9% Secure</strong>
              <span>ISO 27001 Compliant</span>
            </div>
          </div>
          <div className="metric-pill">
            <div className="metric-icon"><FaHeart /></div>
            <div className="metric-text">
              <strong>24/7 Priority</strong>
              <span>Support Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="contact-grid-section">
        <div className="contact-grid-wrapper">
          
          {/* Left Column: Cards & Interactive Map */}
          <div className="contact-info-panel">
            <h2>Contact Information</h2>
            <p className="panel-desc">
              Reach out to us through any of our channels. Visit one of our offices, call us, 
              or chat with our representative on WhatsApp.
            </p>

            <div className="contact-cards-stack">

              {/* Phone Card */}
              <div className="contact-info-card contact-card--phone">
                <div className="card-icon-wrapper phone">
                  <FaPhoneAlt />
                </div>
                <div className="card-details">
                  <div className="card-label-row">
                    <h3>Call Support</h3>
                    <span className="card-status-badge card-status-badge--blue">Live</span>
                  </div>
                  <p className="detail-value">+91 80 4912 3456</p>
                  <p className="detail-meta">Mon - Sat, 9:00 AM – 6:00 PM IST</p>
                </div>
              </div>

              {/* Email Card */}
              <div className="contact-info-card contact-card--email">
                <div className="card-icon-wrapper email">
                  <FaEnvelope />
                </div>
                <div className="card-details">
                  <div className="card-label-row">
                    <h3>Email Address</h3>
                    <span className="card-status-badge card-status-badge--green">24/7</span>
                  </div>
                  <p className="detail-value">support@farmmanager.com</p>
                  <p className="detail-meta">For general & enterprise sales inquiries</p>
                </div>
              </div>

              {/* WhatsApp Card */}
              <div className="contact-info-card contact-card--whatsapp">
                <div className="card-icon-wrapper whatsapp">
                  <FaWhatsapp />
                </div>
                <div className="card-details">
                  <div className="card-label-row">
                    <h3>WhatsApp Helpdesk</h3>
                    <span className="card-status-badge card-status-badge--whatsapp">Instant</span>
                  </div>
                  <p className="detail-value">Chat with us on WhatsApp</p>
                  <p className="detail-meta">Automated assistance & live agents</p>
                </div>
                <a
                  href="whatsapp://send?phone=919384757913"
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-action-btn"
                >
                  Open Chat
                </a>
              </div>

            </div>

            {/* Interactive Map Visual */}
            <div className="interactive-map-container">
              <h3>Our Active Hubs</h3>
              <p className="map-instruction">Click on a location pin on the map to view details.</p>
              
              <div className="map-view-wrapper">
                {/* Custom Stylized Map SVG */}
                <svg className="stylized-map-svg" viewBox="0 0 100 100">
                  {/* Decorative background grid patterns */}
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(16, 185, 129, 0.03)" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" rx="16" />
                  
                  {/* Abstract country shape outline */}
                  <path 
                    d="M 30,20 C 35,15 45,10 60,12 C 75,14 85,25 80,45 C 75,65 90,75 70,85 C 50,95 40,85 30,92 C 20,99 15,85 22,70 C 29,55 10,45 15,35 C 20,25 25,25 30,20 Z" 
                    fill="rgba(16, 185, 129, 0.04)" 
                    stroke="rgba(16, 185, 129, 0.15)" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 2"
                  />

                  {/* Connecting lines between hubs */}
                  <path 
                    d={`M ${locations[0].x},${locations[0].y} L ${locations[1].x},${locations[1].y} L ${locations[2].x},${locations[2].y} Z`} 
                    fill="none" 
                    stroke="rgba(16, 185, 129, 0.1)" 
                    strokeWidth="1" 
                    strokeDasharray="3 3"
                  />

                  {/* Pulsing glow circles under active location */}
                  {locations.map((loc) => {
                    const isActive = loc.id === activeLocation;
                    return isActive ? (
                      <circle 
                        key={`glow-${loc.id}`}
                        cx={loc.x} 
                        cy={loc.y} 
                        r="6" 
                        fill="rgba(16, 185, 129, 0.3)"
                        className="map-glow-ring"
                      />
                    ) : null;
                  })}

                  {/* Location pins */}
                  {locations.map((loc) => {
                    const isActive = loc.id === activeLocation;
                    return (
                      <g 
                        key={loc.id} 
                        transform={`translate(${loc.x}, ${loc.y})`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setActiveLocation(loc.id)}
                      >
                        <circle 
                          r={isActive ? "4" : "3"} 
                          fill={isActive ? "var(--primary)" : "#64748b"} 
                          stroke="#ffffff" 
                          strokeWidth="1.5"
                          className="map-pin-dot"
                        />
                        {/* Interactive tooltip label */}
                        <text
                          y="-8"
                          textAnchor="middle"
                          fill={isActive ? "var(--text-main)" : "var(--text-muted)"}
                          fontSize="3.5"
                          fontWeight={isActive ? "700" : "500"}
                          className="map-pin-label"
                        >
                          {loc.city.split(',')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Selected Location Card */}
                <div className="selected-location-details animate-fade-in">
                  <span className="hub-badge">Active Pin</span>
                  <h4>{selectedLoc.name}</h4>
                  <p className="loc-address"><FaMapMarkerAlt className="loc-icon" /> {selectedLoc.address}</p>
                  <p className="loc-phone"><FaPhoneAlt className="loc-icon" /> {selectedLoc.phone}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Form Panel */}
          <div className="contact-form-panel">
            <div className="contact-form-card">
              {!isSubmitted ? (
                <>
                  <h3>Send Us a Message</h3>
                  <p className="form-subtitle">Fill out the form below and our team will get back to you within 2 hours.</p>

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="form-row-two">
                      <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={formErrors.name ? 'form-input error' : 'form-input'}
                          placeholder="Dr. John Doe"
                        />
                        {formErrors.name && <span className="input-error-msg">{formErrors.name}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={formErrors.email ? 'form-input error' : 'form-input'}
                          placeholder="john@example.com"
                        />
                        {formErrors.email && <span className="input-error-msg">{formErrors.email}</span>}
                      </div>
                    </div>

                    <div className="form-row-two">
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={formErrors.phone ? 'form-input error' : 'form-input'}
                          placeholder="+91 98765 43210"
                        />
                        {formErrors.phone && <span className="input-error-msg">{formErrors.phone}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="role">Your Role</label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="Farmer">Farm Owner / Farmer</option>
                          <option value="Manager">Farm Manager</option>
                          <option value="Veterinarian">Veterinarian</option>
                          <option value="Other">Other Partner</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">Subject *</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={formErrors.subject ? 'form-input error' : 'form-input'}
                        placeholder="e.g. Requesting Enterprise Trial"
                      />
                      {formErrors.subject && <span className="input-error-msg">{formErrors.subject}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className={formErrors.message ? 'form-input error' : 'form-input'}
                        rows="5"
                        placeholder="Write your message detail here..."
                      ></textarea>
                      {formErrors.message && <span className="input-error-msg">{formErrors.message}</span>}
                    </div>

                    <div className="form-group-checkbox">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          name="subscribe"
                          checked={formData.subscribe}
                          onChange={handleInputChange}
                        />
                        <span className="checkbox-checkmark"></span>
                        <span className="checkbox-label">
                          Subscribe to our biweekly biosecurity bulletins & agri-tech updates.
                        </span>
                      </label>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary form-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="btn-spinner"></span>
                      ) : (
                        <>
                          <FaPaperPlane className="btn-icon" /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="form-success-container animate-fade-in">
                  <div className="success-icon-wrapper">
                    <FaCheckCircle />
                  </div>
                  <h3>Message Sent Successfully!</h3>
                  <p>
                    Thank you, <strong>{formData.name}</strong>. Your message regarding 
                    "<em>{formData.subject}</em>" has been securely delivered to our team.
                  </p>
                  
                  <div className="success-summary-box">
                    <h5>Summary of Submission</h5>
                    <p><strong>Email:</strong> {formData.email}</p>
                    {formData.phone && <p><strong>Phone:</strong> {formData.phone}</p>}
                    <p><strong>Role:</strong> {formData.role}</p>
                    <p className="summary-date">Submitted on: {new Date().toLocaleDateString()}</p>
                  </div>

                  <p className="success-footer">
                    A verification email and ticket ID have been sent to your email. We will reach out shortly.
                  </p>

                  <button className="btn-outline" onClick={resetForm}>
                    Send Another Message
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="contact-faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Find immediate answers to common inquiries about the Digital Farm Management Portal.</p>
        </div>

        <div className="faq-accordion-wrapper">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                className={`faq-item ${isOpen ? 'open' : ''}`} 
                key={index}
              >
                <button 
                  className="faq-question-btn" 
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  {isOpen ? <FaChevronUp className="faq-chevron" /> : <FaChevronDown className="faq-chevron" />}
                </button>
                <div className="faq-answer-container">
                  <div className="faq-answer-content">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

export default ContactPage;
