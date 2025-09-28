import React from 'react';
import LandingPage from "./LandingPage.css";
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h2 className="footer-logo">
              Prescript<span className="logo-highlight">Ease</span>
            </h2>
            <p className="footer-description">
              Secure, compliant, and efficient prescription digitalization for healthcare providers and pharmacies. Reduce errors, save time, and improve patient safety.
            </p>
          </div>
          
          <nav className="footer-nav">
            <a href="#home" className="footer-link">Home</a>
            <a href="#about" className="footer-link">About</a>
            <a href="#prescriptions" className="footer-link">Prescriptions</a>
            <a href="#contact" className="footer-link">Contact</a>
          </nav>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            © Copyright 2024. All Rights Reserved
          </p>
          <div className="footer-legal">
            <a href="#privacy" className="footer-legal-link">Privacy Policy</a>
            <a href="#terms" className="footer-legal-link">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;