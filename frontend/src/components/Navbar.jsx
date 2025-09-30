import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user && user.token) {
        try {
          const response = await axiosInstance.get('/api/notifications', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const unreadNotifications = response.data.filter(notif => !notif.isRead);
          setUnreadCount(unreadNotifications.length);
        } catch (error) {
          console.error('Error fetching notifications count:', error);
          // If notifications endpoint doesn't exist yet, set to 0
          setUnreadCount(0);
        }
      }
    };

    fetchUnreadCount();
    
    // Refresh count every 30 seconds if you want real-time updates
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            💊 PrescriptEase
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <Link
              to="/PrescriptionMain"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/prescriptions')
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              Prescriptions
            </Link>
            
            {/* Appointments Link */}
            <Link
              to="/appointments"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/appointments')
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              Appointments
            </Link>
            
            {/* Notifications Link with Badge */}
            <Link
              to="/notifications"
              className={`px-3 py-2 rounded-md transition-colors relative ${
                isActive('/notifications')
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            
            {/* Profile Link */}
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/profile')
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              Profile
            </Link>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;