import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function Dashboard() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch prescriptions from backend
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error('Failed to fetch prescriptions');
      }

      const data = await response.json();
      setPrescriptions(data);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications for the badge
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate KPIs
  const totalPrescriptions = prescriptions.length;
  const validatedPrescriptions = prescriptions.filter(p => p.status === 'validated').length;
  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'dispensed').length;

  // Get unread notifications count
  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
      isActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-80 flex flex-col fixed lg:relative h-full z-40 transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`} style={{ backgroundColor: '#F9FAFB' }}>
        <div className="p-6">
          <h1 className="text-2xl font-semibold">
            Prescript<span className="text-blue-500">Ease</span>
          </h1>
        </div>

        <nav className="flex-1 px-4">
          <NavLink to="/dashboard" className={navClass} onClick={() => setIsSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </NavLink>

          {/* Show prescription-related links only to regular users */}
          {user?.role !== 'admin' && (
            <>
              <NavLink to="/prescriptions" className={navClass} onClick={() => setIsSidebarOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>All Prescriptions</span>
              </NavLink>

              <NavLink to="/validation-queue" className={navClass} onClick={() => setIsSidebarOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Validation Queue</span>
              </NavLink>

              <NavLink to="/dispensations" className={navClass} onClick={() => setIsSidebarOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Dispensations</span>
              </NavLink>
            </>
          )}

          {/* Drug Inventory visible to all users */}
          <NavLink to="/drug-inventory" className={navClass} onClick={() => setIsSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Drug Inventory</span>
          </NavLink>

          {/* Notifications visible to all users */}
          <NavLink to="/notifications" className={navClass} onClick={() => setIsSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>Notifications</span>
            {getUnreadNotificationsCount() > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                {getUnreadNotificationsCount()}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-400 hover:bg-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 pt-16 lg:pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700">DASHBOARD</h2>
            <div className="flex items-center gap-4">
              <NavLink to="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {getUnreadNotificationsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getUnreadNotificationsCount()}
                  </span>
                )}
              </NavLink>
              <NavLink to="/profile" className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-gray-700 hidden sm:inline">
                  {user?.name || 'User'} {user?.role === 'admin' && '(Admin)'}
                </span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="flex-1 overflow-auto px-4 lg:px-8 py-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Prescriptions */}
            <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Total Prescriptions</h3>
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-800">{totalPrescriptions}</p>
              <p className="text-sm text-gray-500 mt-2">All prescriptions in the system</p>
            </div>

            {/* Validated */}
            <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Validated</h3>
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-800">{validatedPrescriptions}</p>
              <p className="text-sm text-gray-500 mt-2">Ready for dispensing</p>
            </div>

            {/* Dispensed */}
            <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Dispensed</h3>
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-800">{dispensedPrescriptions}</p>
              <p className="text-sm text-gray-500 mt-2">Successfully completed</p>
            </div>
          </div>

          {/* Recent Prescriptions and Dispensed Prescriptions Tables */}
          <div className="mt-8 space-y-6">
            {/* Recent Prescriptions */}
            <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Recent Prescriptions</h3>
                <button
                  onClick={() => navigate('/prescriptions')}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  View All →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.slice(0, 5).map((prescription) => (
                      <tr key={prescription._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800 text-sm">{prescription.patientName}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            prescription.status === 'unvalidated' ? 'bg-yellow-100 text-yellow-800' :
                            prescription.status === 'validated' ? 'bg-blue-100 text-blue-800' :
                            prescription.status === 'dispensed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {prescription.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                    {prescriptions.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-6 px-4 text-center text-gray-500 text-sm">
                          No prescriptions available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recently Dispensed Prescriptions */}
            <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Recently Dispensed</h3>
                <button
                  onClick={() => navigate('/dispensations')}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  View All →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Medications</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions
                      .filter(p => p.status === 'dispensed')
                      .slice(0, 5)
                      .map((prescription) => (
                        <tr key={prescription._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-800 text-sm">{prescription.patientName}</td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {prescription.medications?.length || 0} medication(s)
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    {prescriptions.filter(p => p.status === 'dispensed').length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-6 px-4 text-center text-gray-500 text-sm">
                          No dispensed prescriptions available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
