import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ToastContainer from '../components/ToastContainer';

const DrugPage = () => {
  const { user } = useAuth();
  const [drugs, setDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
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
      // The backend will automatically create a global notification
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

  useEffect(() => {
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
      {/* Sidebar - Only Drug Inventory */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-semibold">
            Prescript<span className="text-blue-500">Ease</span>
          </h1>
        </div>

        <nav className="flex-1 px-4">
          {/* Only Drug Inventory link in sidebar */}
          <NavLink to="/drug-inventory" className={navClass}>
            <span>💊</span>
            <span>Drug Inventory</span>
          </NavLink>

          {/* Notifications Link */}
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
          <button className="w-full bg-red-400 hover:bg-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2">
            <span>→</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">DRUG INVENTORY</h2>
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
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <span className="text-gray-700">
                {user?.name || 'Admin'} {user?.role === 'admin' && '(Admin)'}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
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
                placeholder="Search for medicine name, ID, or group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Add Drug
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {filteredDrugs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              {drugs.length === 0
                ? "No drugs in inventory. Add your first drug to get started."
                : "No drugs match your search."}
            </div>
          ) : (
            <table className="w-full bg-white rounded-lg border border-gray-200">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 w-12">
                    <input type="checkbox" className="w-4 h-4" />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Medicine</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Medicine ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Group Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrugs.map((drug) => (
                  <tr key={drug._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <input type="checkbox" className="w-4 h-4" />
                    </td>
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