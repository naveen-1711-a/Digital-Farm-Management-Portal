import React from 'react';
import {
   FaTractor, FaShieldAlt, FaChartLine, FaCheckCircle,
   FaUserPlus, FaHome, FaArrowRight, FaBrain, FaMobileAlt, FaChartPie
} from 'react-icons/fa';
import { GiPig, GiChicken } from 'react-icons/gi';
import { motion } from 'framer-motion';

const fadeInUp = {
   hidden: { opacity: 0, y: 30 },
   visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
   hidden: { opacity: 1 },
   visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
   }
};

function HomePage() {
   return (
      <div className="home-page">
         {/* HERO SECTION */}
         <section id="home" className="hero-section">
            <motion.div
               className="hero-content"
               initial="hidden"
               animate="visible"
               variants={staggerContainer}
            >
               <motion.h1 variants={fadeInUp}>
                  Digital Farm Management <span className="highlight">Portal</span>
               </motion.h1>
               <motion.p variants={fadeInUp}>
                  Digitize all operations for your multi-farm pig and poultry management. Improve efficiency, biosecurity, and real-time monitoring.
               </motion.p>
               <motion.div className="hero-buttons" variants={fadeInUp}>
                  <button className="btn-primary large">Get Started</button>
                  <button className="btn-outline large">Explore Features</button>
               </motion.div>

               <motion.div className="trust-badges" variants={fadeInUp}>
                  <span><FaCheckCircle className="trust-icon" /> Multi-Farm Support</span>
                  <span><FaCheckCircle className="trust-icon" /> Real-Time Monitoring</span>
                  <span><FaCheckCircle className="trust-icon" /> Secure Role-Based Access</span>
               </motion.div>

               <motion.div className="fp-hero-stats" variants={staggerContainer}>
                  <motion.div className="fp-stat" variants={fadeInUp}>
                     <span className="fp-stat-num">10K+</span>
                     <span className="fp-stat-label">Farms Managed</span>
                  </motion.div>
                  <motion.div className="fp-stat" variants={fadeInUp}>
                     <span className="fp-stat-num">2M+</span>
                     <span className="fp-stat-label">Animals Tracked</span>
                  </motion.div>
                  <motion.div className="fp-stat" variants={fadeInUp}>
                     <span className="fp-stat-num">99.9%</span>
                     <span className="fp-stat-label">Uptime</span>
                  </motion.div>
                  <motion.div className="fp-stat" variants={fadeInUp}>
                     <span className="fp-stat-num">50+</span>
                     <span className="fp-stat-label">Features</span>
                  </motion.div>
               </motion.div>
            </motion.div>
         </section>

         {/* CORE FEATURES SECTION */}
         <section id="features" className="features-section">
            <motion.div
               className="section-header"
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.3 }}
               variants={fadeInUp}
            >
               <h2>Powerful Features</h2>
               <p>Everything you need to manage your livestock efficiently from a single dashboard.</p>
            </motion.div>
            <motion.div
               className="features-grid"
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.1 }}
               variants={staggerContainer}
            >
               <motion.div className="feature-card" variants={fadeInUp} whileHover={{ y: -10, transition: { duration: 0.2 } }}>
                  <div className="feature-icon"><FaShieldAlt /></div>
                  <h3>Biosecurity Management</h3>
                  <p>Track visitors, sanitization, and strictly monitor disease prevention practices.</p>
               </motion.div>
               <motion.div className="feature-card" variants={fadeInUp} whileHover={{ y: -10, transition: { duration: 0.2 } }}>
                  <div className="feature-icon"><GiPig /></div>
                  <h3>Animal Registration</h3>
                  <p>Maintain detailed logs of breed, age, health status, and RFID tags for all animals.</p>
               </motion.div>
               <motion.div className="feature-card" variants={fadeInUp} whileHover={{ y: -10, transition: { duration: 0.2 } }}>
                  <div className="feature-icon"><FaChartLine /></div>
                  <h3>Real-time Reports</h3>
                  <p>Generate farm-wise statistics, population data, and medicine usage at a glance.</p>
               </motion.div>
               <motion.div className="feature-card" variants={fadeInUp} whileHover={{ y: -10, transition: { duration: 0.2 } }}>
                  <div className="feature-icon"><FaTractor /></div>
                  <h3>Feed & Inventory</h3>
                  <p>Automate stock alerts, daily consumption tracking, and supplier management.</p>
               </motion.div>
            </motion.div>
         </section>

         {/* AI CAPABILITIES SECTION */}
         <section className="fp-grid-section" style={{ background: '#f8fafc' }}>
            <motion.div
               className="section-header"
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.3 }}
               variants={fadeInUp}
            >
               <h2>AI-Powered Insights</h2>
               <p>Leverage cutting-edge machine learning to predict outcomes and optimize operations.</p>
            </motion.div>

            <motion.div
               className="fp-cards-grid"
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.1 }}
               variants={staggerContainer}
            >
               <motion.div className="fp-card" variants={fadeInUp} style={{ '--card-border': '#8b5cf6' }}>
                  <div className="fp-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                     <FaBrain />
                  </div>
                  <h3 className="fp-card-title">Feed Cost Prediction</h3>
                  <p className="fp-card-desc">Our AI analyzes historical data, market trends, and seasonal shifts to forecast your feed expenses months in advance.</p>
               </motion.div>

               <motion.div className="fp-card" variants={fadeInUp} style={{ '--card-border': '#ef4444' }}>
                  <div className="fp-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                     <GiChicken />
                  </div>
                  <h3 className="fp-card-title">Poultry Disease Alert</h3>
                  <p className="fp-card-desc">Identify early signs of disease spread in your sheds using predictive modeling, allowing for rapid intervention.</p>
               </motion.div>

               <motion.div className="fp-card" variants={fadeInUp} style={{ '--card-border': '#0ea5e9' }}>
                  <div className="fp-card-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                     <FaChartPie />
                  </div>
                  <h3 className="fp-card-title">Yield Optimization</h3>
                  <p className="fp-card-desc">Get tailored recommendations on feed mix and environmental controls to maximize animal growth and farm yield.</p>
               </motion.div>
            </motion.div>
         </section>

         {/* HOW IT WORKS SECTION */}
         <section className="fp-how-section">
            <motion.div
               className="section-header"
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.3 }}
               variants={fadeInUp}
            >
               <h2>How It Works</h2>
               <p>Get your farm digitized and operational in four simple steps.</p>
            </motion.div>

            <motion.div
               className="fp-steps-wrapper"
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.2 }}
               variants={staggerContainer}
            >
               <div className="fp-steps-line"></div>
               <div className="fp-steps-grid">
                  {/* Step 1 */}
                  <motion.div className="fp-step" variants={fadeInUp}>
                     <div className="fp-step-circle" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%), #10b981', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}>
                        <span className="fp-step-icon"><FaUserPlus /></span>
                        <span className="fp-step-num">STEP 1</span>
                     </div>
                     <FaArrowRight className="fp-step-arrow" />
                     <div className="fp-step-card">
                        <span className="fp-step-tag" style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}>Register</span>
                        <h4 className="fp-step-title" style={{ fontSize: '1.1rem', margin: 0 }}>Create Account</h4>
                        <p className="fp-step-desc" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Sign up and set up your admin profile with secure role-based access.</p>
                     </div>
                  </motion.div>

                  {/* Step 2 */}
                  <motion.div className="fp-step" variants={fadeInUp}>
                     <div className="fp-step-circle" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%), #3b82f6', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)' }}>
                        <span className="fp-step-icon"><FaHome /></span>
                        <span className="fp-step-num">STEP 2</span>
                     </div>
                     <FaArrowRight className="fp-step-arrow" />
                     <div className="fp-step-card">
                        <span className="fp-step-tag" style={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}>Setup</span>
                        <h4 className="fp-step-title" style={{ fontSize: '1.1rem', margin: 0 }}>Configure Farm</h4>
                        <p className="fp-step-desc" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Add your sheds, feed silos, and configure environmental parameters.</p>
                     </div>
                  </motion.div>

                  {/* Step 3 */}
                  <motion.div className="fp-step" variants={fadeInUp}>
                     <div className="fp-step-circle" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%), #f59e0b', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)' }}>
                        <span className="fp-step-icon"><GiPig /></span>
                        <span className="fp-step-num">STEP 3</span>
                     </div>
                     <FaArrowRight className="fp-step-arrow" />
                     <div className="fp-step-card">
                        <span className="fp-step-tag" style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}>Add Data</span>
                        <h4 className="fp-step-title" style={{ fontSize: '1.1rem', margin: 0 }}>Log Livestock</h4>
                        <p className="fp-step-desc" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Register animal batches, assign RFID tags, and input baseline health data.</p>
                     </div>
                  </motion.div>

                  {/* Step 4 */}
                  <motion.div className="fp-step" variants={fadeInUp}>
                     <div className="fp-step-circle" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%), #8b5cf6', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)' }}>
                        <span className="fp-step-icon"><FaMobileAlt /></span>
                        <span className="fp-step-num">STEP 4</span>
                     </div>
                     <div className="fp-step-card">
                        <span className="fp-step-tag" style={{ background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }}>Monitor</span>
                        <h4 className="fp-step-title" style={{ fontSize: '1.1rem', margin: 0 }}>Track & Predict</h4>
                        <p className="fp-step-desc" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Use dashboard analytics and AI alerts to manage daily operations smoothly.</p>
                     </div>
                  </motion.div>
               </div>
            </motion.div>
         </section>

         {/* CTA SECTION */}
         <section className="cta-section" style={{ padding: '6rem 8%', background: 'linear-gradient(135deg, var(--primary) 0%, #047857 100%)', textAlign: 'center', color: '#fff' }}>
            <motion.div
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.3 }}
               variants={fadeInUp}
               style={{ maxWidth: '800px', margin: '0 auto' }}
            >
               <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff' }}>Ready to Modernize Your Farm?</h2>
               <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9, color: '#ecfdf5' }}>
                  Join thousands of farmers improving their efficiency, animal health, and profitability with our all-in-one digital platform.
               </p>
               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn-primary large" style={{ background: '#fff', color: 'var(--primary)' }}>Start Your Free Trial</button>
                  <button className="btn-outline large" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>Schedule Demo</button>
               </div>
            </motion.div>
         </section>
      </div>
   );
}

export default HomePage;
