import React from 'react';
import LandingPage from './LandingPage';


const InfoCard = () => {
  return (
    <div className="info-card">
      <div className="info-content">
        <div className="info-text">
          <h3>Transforming Healthcare Communication</h3>
          <p>
            Traditional paper prescriptions create delays, errors, and compliance challenges. 
            PrescriptEase bridges the gap between doctors and pharmacists with secure digital 
            workflows that ensure accuracy and regulatory compliance.
          </p>
        </div>
        <div className="info-image">
          <img 
            src="/Doctor.png" 
            alt="Healthcare professional writing prescription" 
          />
        </div>
      </div>
    </div>
  );
};

export default InfoCard;