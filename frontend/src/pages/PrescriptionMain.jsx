import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreatePrescriptionModal from './CreatePrescription';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function PrescriptionMain() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  const location = useLocation();
  const { user, logout } = useAuth();

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
      setError(err.message);
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

  // Determine active filter based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('validation-queue')) {
      setActiveFilter('validation');
    } else if (path.includes('dispensations')) {
      setActiveFilter('dispensations');
    } else {
      setActiveFilter('all');
    }
  }, [location.pathname]);

  // Validate prescription
  const validatePrescription = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/validate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate prescription');
      }

      const updatedPrescription = await response.json();
      setPrescriptions(prev => 
        prev.map(prescription => 
          prescription._id === id ? updatedPrescription : prescription
        )
      );

      fetchNotifications();
    } catch (err) {
      setError(err.message);
      console.error('Error validating prescription:', err);
    }
  };

  // Dispense prescription
  const dispensePrescription = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/dispense`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to dispense prescription');
      }

      const result = await response.json();
      setPrescriptions(prev => 
        prev.map(prescription => 
          prescription._id === id ? result.prescription : prescription
        )
      );

      fetchNotifications();
    } catch (err) {
      setError(err.message);
      console.error('Error dispensing prescription:', err);
    }
  };

  // Cancel prescription
  const cancelPrescription = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel prescription');
      }

      const updatedPrescription = await response.json();
      setPrescriptions(prev => 
        prev.map(prescription => 
          prescription._id === id ? updatedPrescription : prescription
        )
      );

      fetchNotifications();
    } catch (err) {
      setError(err.message);
      console.error('Error canceling prescription:', err);
    }
  };

  // Handle prescription created from modal
  const handlePrescriptionCreated = (newPrescription) => {
    setPrescriptions(prev => [...prev, newPrescription]);
    setShowCreateModal(false);
    fetchNotifications();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Filter prescriptions based on active filter and search term
  const getFilteredPrescriptions = () => {
    let filtered = prescriptions;

    // Apply status filter based on active filter
    switch (activeFilter) {
      case 'validation':
        filtered = filtered.filter(prescription => prescription.status === 'pending');
        break;
      case 'dispensations':
        filtered = filtered.filter(prescription => prescription.status === 'validated');
        break;
      case 'all':
      default:
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(prescription =>
        prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medications?.some(med => 
          med.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        prescription.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPrescriptions = getFilteredPrescriptions();

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'validated':
        return 'bg-blue-100 text-blue-800';
      case 'dispensed':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get page title based on active filter
  const getPageTitle = () => {
    switch (activeFilter) {
      case 'validation':
        return 'VALIDATION QUEUE';
      case 'dispensations':
        return 'DISPENSATIONS';
      default:
        return 'PRESCRIPTIONS';
    }
  };

  // Get description based on active filter
  const getPageDescription = () => {
    switch (activeFilter) {
      case 'validation':
        return "Prescriptions pending validation";
      case 'dispensations':
        return "Validated prescriptions ready for dispensing";
      default:
        return "All prescriptions";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unread notifications count
  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  // Auto-refresh data
  useEffect(() => {
    fetchPrescriptions();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const navClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
      isActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-xl">Loading prescriptions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
        <button 
          onClick={fetchPrescriptions}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-semibold">
            Prescript<span className="text-blue-500">Ease</span>
          </h1>
        </div>

        <nav className="flex-1 px-4">
          <NavLink to="/landing" className={navClass}>
            <span>🏠</span>
            <span>Home</span>
          </NavLink>

          {/* Show prescription-related links only to regular users */}
          {user?.role !== 'admin' && (
            <>
              <NavLink to="/prescriptions" className={navClass}>
                <span>📄</span>
                <span>All Prescriptions</span>
              </NavLink>

              <NavLink to="/validation-queue" className={navClass}>
                <span>✅</span>
                <span>Validation Queue</span>
              </NavLink>

              <NavLink to="/dispensations" className={navClass}>
                <span>📦</span>
                <span>Dispensations</span>
              </NavLink>
            </>
          )}

          {/* Show drug inventory only to admin users */}
          {user?.role === 'admin' && (
            <NavLink to="/drug-inventory" className={navClass}>
              <span>💊</span>
              <span>Drug Inventory</span>
            </NavLink>
          )}

          {/* Notifications visible to all users */}
          <NavLink to="/notifications" className={navClass}>
            <span>🔔</span>
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
            <span>→</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-700">{getPageTitle()}</h2>
            <div className="flex items-center gap-4">
              <NavLink to="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg">
                <span>🔔</span>
                {getUnreadNotificationsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getUnreadNotificationsCount()}
                  </span>
                )}
              </NavLink>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-gray-700">
                  {user?.name || 'User'} {user?.role === 'admin' && '(Admin)'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-sm">{getPageDescription()}</p>
        </div>

        {/* Toolbar - Hide Create Prescription button for admin users */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              LIST
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <span>Filter</span>
              <span>🔻</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for patients, medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
            </div>
            
            {/* Hide Create Prescription button for admin users */}
            {user?.role !== 'admin' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
              >
                Create Prescription
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {prescriptions.length === 0 
                ? "No prescriptions found. Create your first prescription!" 
                : activeFilter === 'validation'
                ? "No prescriptions pending validation."
                : activeFilter === 'dispensations'
                ? "No prescriptions ready for dispensing."
                : "No prescriptions match your search."}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Age</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Medications</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Expiry</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((prescription) => (
                  <tr key={prescription._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-800 font-medium">
                      {prescription.patientName}
                    </td>
                    <td className="py-4 px-4 text-gray-800">
                      {prescription.patientAge}
                    </td>
                    <td className="py-4 px-4">
                      {prescription.medications?.map((med, index) => (
                        <div key={index} className="mb-3 last:mb-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{med.name}</span>
                            {med.stockChecked && (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  med.stockAvailable
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                                title={med.inventoryError || 'Available in inventory'}
                              >
                                {med.stockAvailable ? '✓ In Stock' : '✗ Out of Stock'}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 ml-2">
                            <div>Dosage: {med.dosage || 'Not specified'}</div>
                            <div>Frequency: {med.frequency || 'Not specified'}</div>
                            <div>Duration: {med.duration || 'Not specified'}</div>
                          </div>
                          {med.inventoryError && !med.stockAvailable && (
                            <div className="text-xs text-red-600 ml-2 mt-1">
                              {med.inventoryError}
                            </div>
                          )}
                        </div>
                      ))}
                    </td>
                    <td className="py-4 px-4 text-gray-800">
                      {formatDate(prescription.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-gray-800">
                      {formatDate(prescription.expiryDate)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(prescription.status)}`}>
                        {prescription.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {prescription.status === 'pending' && (
                          <button 
                            onClick={() => validatePrescription(prescription._id)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                            title="Validate"
                          >
                            Validate
                          </button>
                        )}
                        {prescription.status === 'validated' && (
                          <button 
                            onClick={() => dispensePrescription(prescription._id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                            title="Dispense"
                          >
                            Dispense
                          </button>
                        )}
                        {(prescription.status === 'pending' || prescription.status === 'validated') && (
                          <button 
                            onClick={() => cancelPrescription(prescription._id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        )}
                        {prescription.status === 'dispensed' && (
                          <span className="text-sm text-gray-500">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Prescription Modal - Only show for regular users */}
      {showCreateModal && user?.role !== 'admin' && (
        <CreatePrescriptionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePrescriptionCreated}
        />
      )}
    </div>
  );
}