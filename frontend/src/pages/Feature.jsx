import React from "react";
import LandingPage from "./LandingPage.css";

const Features = () => {
  const featureData = [
    {
      title: "Prescription Digitalization",
      desc: "Advanced multi-layer validation system ensures prescription accuracy and safety before dispensation.",
    },
    {
      title: "Prescription Validation",
      desc: "Advanced multi-layer validation system ensures prescription accuracy.",
    },
    {
      title: "Prescription Dispensation",
      desc: "Streamlined dispensation workflow with real-time inventory management.",
    },
  ];

  return (
    <section className="features">
      <h3>Our Main Features</h3>
      <div className="feature-cards">
        {featureData.map((f, i) => (
          <div className="card" key={i}>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
