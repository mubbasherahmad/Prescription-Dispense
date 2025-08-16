import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import PrescriptionsPage from './pages/PrescriptionsPage';
import ValidationPage from './pages/ValidationPage';
import DispensationPage from './pages/DispensationPage';

const App = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/validation" element={<ValidationPage />} />
          <Route path="/dispensation" element={<DispensationPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
