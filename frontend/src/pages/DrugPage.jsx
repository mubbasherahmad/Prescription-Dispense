import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ToastContainer from '../components/ToastContainer';

const DrugPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drugs, setDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    medicineName: '',
    medicineId: '',
    groupName: '',
    stock: ''
  });

  // Toast management
  const addToast = (message, type = 'info', description = null, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, description, duration }]);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/api/notifications', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const filteredDrugs = drugs.filter(drug =>
    drug.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.medicineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const drugData = {
        medicineName: formData.medicineName,
        medicineId: formData.medicineId,
        groupName: formData.groupName,
        stock: parseInt(formData.stock)
      };

      const response = await axiosInstance.post('/api/drugs', drugData, {
        headers: { Authorization: `Bearer ${user?.token}`, 'Content-Type': 'application/json' }
      });

      setDrugs([response.data, ...drugs]);

      // Refresh notifications after drug is added
      fetchNotifications();

      addToast('Drug added successfully!', 'success');
      setShowModal(false);
      setFormData({ medicineName: '', medicineId: '', groupName: '', stock: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error adding drug';
      addToast('Failed to add drug', 'error', errorMessage);
    }
  };

  // Get unread notifications count
  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  // Fetch drugs function
  const fetchDrugs = async () => {
    try {
      const response = await axiosInstance.get('/api/drugs', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setDrugs(response.data);
    } catch (error) {
      console.error('Error fetching drugs:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (user) {
      fetchDrugs();
      fetchNotifications();
    }
  }, [user]);

  const navClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
      isActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

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
            <h2 className="text-xl font-semibold text-gray-700">DRUG INVENTORY</h2>
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
              <button
                onClick={fetchDrugs}
                className="px-3 lg:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm lg:text-base"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
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

              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 lg:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm lg:text-base whitespace-nowrap"
                >
                  Add Drug
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {filteredDrugs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {drugs.length === 0
                  ? "No drugs in inventory. Add your first drug to get started."
                  : "No drugs match your search."}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Medicine</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Medicine ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Group Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrugs.map((drug) => (
                    <tr key={drug._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-800 font-medium">{drug.medicineName}</td>
                      <td className="py-4 px-4 text-gray-800">{drug.medicineId}</td>
                      <td className="py-4 px-4 text-gray-800">{drug.groupName}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          drug.stock > 20
                            ? 'bg-green-100 text-green-800'
                            : drug.stock > 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {drug.stock} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Drug Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Drug</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleChange}
                  placeholder="e.g., Lisinopril - 10 mg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine ID *</label>
                <input
                  type="text"
                  name="medicineId"
                  value={formData.medicineId}
                  onChange={handleChange}
                  placeholder="e.g., 1213241401"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleChange}
                  placeholder="e.g., Generic Medicine"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="e.g., 350"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition duration-200"
                >
                  Add Drug
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default DrugPage;
