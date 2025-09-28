import React from "react";
import LandingPage from "./LandingPage.css";

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-text">
        <h2>Streamline Prescription Management with Precision</h2>
        <p>
          Secure, compliant, and efficient prescription digitalization for
          healthcare providers and pharmacies. Reduce errors, save time, and
          improve patient safety.
        </p>
      </div>
      <div className="hero-image">
        {/* <img src={logo192} alt="Prescription Management" /> */}
      </div>
    </section>
  );
};

export default HeroSection;
