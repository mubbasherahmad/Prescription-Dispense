import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
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
        navigate('/prescriptions');   // ✅ lowercase route
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
      <button className="login-btn" onClick={handleLoginClick}>
        Log In
      </button>
    </nav>
  );
};

export default Navbar;