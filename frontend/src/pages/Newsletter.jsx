import React, { useState } from "react";
import "./LandingPage.css";

const Newsletter = ({ id }) => {
  return (
    <section className="newsletter" id={id}>
      <div className="newsletter-content">
        <h4>Subscribe to our news letter to get latest updates and news.</h4>
        <form className="subscribe-form">
          <input type="email" placeholder="Enter Your Email" required />
          <button type="submit">Subscribe</button> {/* Changed from "Log In" to "Subscribe" */}
        </form>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0); // Default first item to be open

  const faqData = [
    {
      question: "What is PrescriptEase?",
      answer:
        "PrescriptEase is a secure digital prescription management platform that enables healthcare providers to create, validate, and dispense prescriptions electronically. The system streamlines communication between doctors and pharmacies while maintaining strict compliance with healthcare regulations.",
    },
    {
      question: "How does PrescriptEase work?",
      answer:
        "Our platform allows doctors to write and send digital prescriptions directly to a patient's chosen pharmacy, eliminating the need for paper scripts. The system includes validation checks and integrates with pharmacy inventory for a seamless workflow.",
    },
    {
      question: "Is PrescriptEase suitable for my practice size?",
      answer:
        "Yes, PrescriptEase is designed to be scalable. It's suitable for single-practitioner clinics, large multi-specialty hospitals, and everything in between. We offer various plans to fit the needs of your practice.",
    },
    {
      question: "Are digital prescriptions legally valid?",
      answer:
        "Absolutely. Our platform complies with all national and local regulations regarding the electronic transmission of prescriptions. All digital prescriptions generated are legally valid and secure.",
    },
  ];

  const toggleFAQ = (index) => {
    // If the clicked item is already open, close it. Otherwise, open the clicked item.
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq">
      <h3>Frequently Asked Questions</h3>
      <div className="faq-list">
        {faqData.map((item, index) => (
          <div className="faq-item" key={index}>
            <div className="faq-question" onClick={() => toggleFAQ(index)}>
              <span className="faq-number">{`0${index + 1}`}</span>
              <p>{item.question}</p>
              <button className="faq-toggle">
                {openIndex === index ? "−" : "+"}
              </button>
            </div>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const InfoSections = () => {
    return (
        <div>
            <Newsletter />
            <FAQ />
        </div>
    )
}


export default InfoSections;
