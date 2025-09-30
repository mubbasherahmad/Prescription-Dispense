// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './components/Layout';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Profile from './pages/Profile';
// import Prescriptions from './pages/Prescriptions';
// import LandingPage from './pages/LandingPage';
// import PrescriptionMain from './pages/PrescriptionMain';
// import Appointments from './pages/Appointments';
// import Notifications from './pages/Notifications';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Redirect root to login page */}
//         <Route path="/" element={<Navigate to="/login" replace />} />
        
//         {/* Landing Page - accessible after login */}
//         <Route path="/landing" element={<LandingPage />} />
        
//         {/* Public Routes */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/PrescriptionMain" element={<PrescriptionMain />} />
        
        
//         {/* Protected Routes with Layout */}
//         <Route path="/*" element={
//           <Layout>
//             <Routes>
//               <Route path="/prescriptions" element={<Prescriptions />} />
//               <Route path="/appointments" element={<Appointments />} />
//               <Route path="/notifications" element={<Notifications />} />
//               <Route path="/profile" element={<Profile />} />
//             </Routes>
//           </Layout>
//         } />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Prescriptions from './pages/Prescriptions';
import LandingPage from './pages/LandingPage';
import PrescriptionMain from './pages/PrescriptionMain';
import Appointments from './pages/Appointments';
import Notifications from './pages/Notifications';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes (no Navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/PrescriptionMain" element={<PrescriptionMain />} />

        {/* Protected routes (with Navbar inside Layout) */}
        <Route element={<Layout />}>
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
