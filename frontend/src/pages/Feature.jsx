import React from "react";
import "./LandingPage.css";

const Features = ({ id }) => {
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
    <section className="features" id={id}>
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