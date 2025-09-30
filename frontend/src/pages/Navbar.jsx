import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import "./LandingPage.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (section) => {
    switch(section) {
      case 'Home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'About':
        document.querySelector('.info-card')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'Prescriptions':
        // If user is logged in, go to prescriptions, else go to login
        if (user) {
          navigate('/PrescriptionMain');
        } else {
          navigate('/login');
        }
        break;
      case 'Contact':
        document.querySelector('.newsletter')?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  return (
    <nav className="navbar">
      <h1 className="logo">PrescriptEase</h1>
      <ul className="nav-links">
        <li onClick={() => handleNavClick('Home')}>Home</li>
        <li onClick={() => handleNavClick('About')}>About</li>
        <li onClick={() => handleNavClick('Prescriptions')}>Prescriptions</li>
        <li onClick={() => handleNavClick('Contact')}>Contact</li>
      </ul>
      {user ? (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Welcome, {user.name}</span>
          <button className="login-btn" onClick={handleLogoutClick}>
            Log Out
          </button>
        </div>
      ) : (
        <button className="login-btn" onClick={handleLoginClick}>
          Log In
        </button>
      )}
    </nav>
  );
};

export default Navbar;