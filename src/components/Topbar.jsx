import React from 'react';
import { useLocation } from 'react-router-dom';
import './Topbar.css';

const Topbar = ({ toggleSidebar }) => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/prescriptions') return 'Prescriptions';
    if (path === '/validation') return 'Validation';
    if (path === '/dispensation') return 'Dispensation';
    return 'Dashboard';
  };

  return (
    <header className="topbar">
      <button className="menu-toggle" onClick={toggleSidebar}>
        <span>☰</span>
      </button>
      <h1 className="page-title">{getPageTitle()}</h1>
      <div className="topbar-actions">
        <input type="search" placeholder="Search..." className="search-input" />
      </div>
    </header>
  );
};

export default Topbar;
