import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import PrescriptionMain from './pages/PrescriptionMain';
import DrugPage from './pages/DrugPage';
import Notifications from './pages/Notifications';
function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to landing page */}
        <Route path="/" element={<Navigate to="/landing" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Prescription routes - all use the same component with different filters */}
        <Route path="/prescriptions" element={<PrescriptionMain />} />
        <Route path="/validation-queue" element={<PrescriptionMain />} />
        <Route path="/dispensations" element={<PrescriptionMain />} />

        {/* Protected routes */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/drug-inventory" element={<DrugPage />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Router>
  );
}

export default App;