import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreatePrescriptionModal from './CreatePrescription';
import {
  SortByDateStrategy,
  SortByDateOldestStrategy,
  PrescriptionSorter
} from '../strategies/SortStrategy';
import { PrescriptionProxy } from '../proxies/PrescriptionProxy';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function PrescriptionMain() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Strategy Pattern: Sorting and Filtering
  const [sorter] = useState(() => new PrescriptionSorter(new SortByDateStrategy()));
  const [currentSortStrategy, setCurrentSortStrategy] = useState('date-newest');

  const location = useLocation();
  const navigate = useNavigate();
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

  // Delete prescription using Proxy pattern for role-based access control
  const deletePrescription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Create axios-like object for the proxy
      const axiosLike = {
        delete: async (url, config) => {
          const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'DELETE',
            headers: config.headers
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete prescription');
          }
          return { data: await response.json() };
        }
      };

      // Use Proxy pattern to control access based on user role
      const prescriptionProxy = new PrescriptionProxy(axiosLike, token, user?.role);
      await prescriptionProxy.deletePrescription(id);

      setPrescriptions(prev => prev.filter(prescription => prescription._id !== id));
      fetchNotifications();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting prescription:', err);
      alert(err.message);
    }
  };

  // Handle prescription created from modal
  const handlePrescriptionCreated = (newPrescription) => {
    setPrescriptions(prev => [...prev, newPrescription]);
    setShowCreateModal(false);
    fetchNotifications();
  };

  // Handle prescription updated from modal
  const handlePrescriptionUpdated = (updatedPrescription) => {
    setPrescriptions(prev =>
      prev.map(p => p._id === updatedPrescription._id ? updatedPrescription : p)
    );
    setEditingPrescription(null);
    setShowCreateModal(false);
    fetchNotifications();
  };

  // Open edit modal
  const handleEditPrescription = (prescription) => {
    setEditingPrescription(prescription);
    setShowCreateModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingPrescription(null);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Strategy Pattern: Handle sort strategy change
  const handleSortChange = (strategyKey) => {
    setCurrentSortStrategy(strategyKey);

    switch (strategyKey) {
      case 'date-newest':
        sorter.setStrategy(new SortByDateStrategy());
        break;
      case 'date-oldest':
        sorter.setStrategy(new SortByDateOldestStrategy());
        break;
      default:
        sorter.setStrategy(new SortByDateStrategy());
    }
  };

  // Filter prescriptions based on active filter and search term
  const getFilteredPrescriptions = () => {
    let filtered = prescriptions;

    // Apply status filter based on active filter
    switch (activeFilter) {
      case 'validation':
        filtered = filtered.filter(prescription => prescription.status === 'unvalidated');
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

  // Strategy Pattern: Apply sorting strategy using useMemo for performance
  const filteredPrescriptions = useMemo(() => {
    const filtered = getFilteredPrescriptions();
    return sorter.sort(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptions, activeFilter, searchTerm, currentSortStrategy]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'unvalidated':
        return 'bg-yellow-100 text-yellow-800';
      case 'validated':
        return 'bg-blue-100 text-blue-800';
      case 'dispensed':
        return 'bg-green-100 text-green-800';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

          {/* Prescription-related links visible to all users */}
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
            <h2 className="text-xl font-semibold text-gray-700">{getPageTitle()}</h2>
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

        {/* Toolbar and Table Container */}
        <div className="flex-1 overflow-auto px-4 lg:px-8 py-6 bg-white">
          {/* Toolbar */}
          <div className="py-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:justify-between">
            <div className="flex items-center gap-2 lg:gap-4">
              <span className="px-3 lg:px-4 py-2 text-gray-700 text-sm lg:text-base font-medium">
                LIST
              </span>

              {/* Strategy Pattern: Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="px-3 lg:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm lg:text-base"
                >
                  <span>Filter</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isFilterOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px]">
                    <div className="p-2">
                      <p className="text-xs text-gray-500 px-2 py-1">Filter by:</p>
                      <button
                        onClick={() => {
                          handleSortChange('date-newest');
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                          currentSortStrategy === 'date-newest' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        Date (Newest First)
                      </button>
                      <button
                        onClick={() => {
                          handleSortChange('date-oldest');
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                          currentSortStrategy === 'date-oldest' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        Date (Oldest First)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-4">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 lg:w-80 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
                <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
              </div>

              {/* Hide Create Prescription button for admin users */}
              {user?.role !== 'admin' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 lg:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm lg:text-base whitespace-nowrap"
                >
                  Create Prescription
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
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
                        {/* Validation Queue: Show Validate button only */}
                        {activeFilter === 'validation' && prescription.status === 'unvalidated' && (
                          <button
                            onClick={() => validatePrescription(prescription._id)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                            title="Validate"
                          >
                            Validate
                          </button>
                        )}

                        {/* All Prescriptions: Show Edit/Delete for unvalidated */}
                        {activeFilter === 'all' && prescription.status === 'unvalidated' && (
                          <>
                            <button
                              onClick={() => handleEditPrescription(prescription)}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                              title="Edit"
                            >
                              Edit
                            </button>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => deletePrescription(prescription._id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                                title="Delete (Admin Only)"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}

                        {/* Dispensations: Show Dispense button for validated */}
                        {activeFilter === 'dispensations' && prescription.status === 'validated' && (
                          <button
                            onClick={() => dispensePrescription(prescription._id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                            title="Dispense"
                          >
                            Dispense
                          </button>
                        )}

                        {/* All Prescriptions: Show appropriate action for validated/dispensed */}
                        {activeFilter === 'all' && prescription.status === 'validated' && (
                          <button
                            onClick={() => dispensePrescription(prescription._id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                            title="Dispense"
                          >
                            Dispense
                          </button>
                        )}

                        {activeFilter === 'all' && prescription.status === 'dispensed' && (
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
      </div>

      {/* Create/Edit Prescription Modal - Only show for regular users */}
      {showCreateModal && user?.role !== 'admin' && (
        <CreatePrescriptionModal
          onClose={handleCloseModal}
          onCreated={handlePrescriptionCreated}
          onUpdated={handlePrescriptionUpdated}
          editingPrescription={editingPrescription}
        />
      )}
    </div>
  );
}