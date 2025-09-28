import React from "react";
import LandingPage from "./LandingPage.css";
const Navbar=()=>{
    return (
        <nav className="navbar">
      <h1 className="logo">PrescriptEase</h1>
      <ul className="nav-links">
        <li>Home</li>
        <li>About</li>
        <li>Prescriptions</li>
        <li>Contact</li>
      </ul>
      <button className="login-btn">Log In</button>
    </nav>
  );
    
}

export default Navbar;