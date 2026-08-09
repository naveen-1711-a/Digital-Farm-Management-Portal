import React from 'react';
import { FaLeaf, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer-main">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <FaLeaf className="logo-icon" />
              <span>FarmManager</span>
            </div>
            <p className="footer-description">
              The ultimate digital ecosystem for multi-farm pig and poultry management. Built for the modern agricultural enterprise.
            </p>
            <div className="social-links">
              <a href="#"><FaFacebook /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaLinkedin /></a>
              <a href="#"><FaInstagram /></a>
            </div>
          </div>
          
          <div className="footer-links">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Case Studies</a>
            <a href="#">Reviews</a>
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            <a href="#">Documentation</a>
            <a href="#">Veterinary Guides</a>
            <a href="#">Webinars</a>
            <a href="#contact">Support</a>
          </div>

          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Get the latest updates on farm management tech.</p>
            <div className="newsletter-input">
              <input type="email" placeholder="Enter your email" />
              <button className="btn-primary">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Digital Farm Management Portal (SIH25006). All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
