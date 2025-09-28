import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get('/api/notifications', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axiosInstance.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setNotifications(notifications.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notif => !notif.isRead);
      
      for (const notif of unreadNotifications) {
        await axiosInstance.put(`/api/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }

      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'prescription': return '💊';
      case 'appointment': return '📅';
      case 'system': return '🔔';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'prescription': return 'bg-blue-50 border-blue-200';
      case 'appointment': return 'bg-green-50 border-green-200';
      case 'system': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 text-sm mt-1">
                {notifications.filter(n => !n.isRead).length} unread notifications
              </p>
            </div>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread ({notifications.filter(n => !n.isRead).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'read' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Read ({notifications.filter(n => n.isRead).length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You're all caught up! No notifications to display."
                  : filter === 'unread'
                  ? "No unread notifications. Great job staying updated!"
                  : "No read notifications yet."
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'prescription': return '💊';
      case 'appointment': return '📅';
      case 'system': return '🔔';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'prescription': return 'border-l-blue-500';
      case 'appointment': return 'border-l-green-500';
      case 'system': return 'border-l-purple-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-300 p-4 transition-all hover:shadow-md ${
        !notification.isRead ? 'border-l-4 ' + getNotificationColor(notification.type) : ''
      } ${!notification.isRead ? 'bg-blue-50' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="text-2xl mt-1">{getNotificationIcon(notification.type)}</div>
          
          <div className="flex-1">
            <h3 className={`font-medium ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
              {notification.title}
            </h3>
            <p className="text-gray-600 mt-1">{notification.message}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>{formatTime(notification.createdAt)}</span>
              <span className="capitalize">{notification.type}</span>
              {!notification.isRead && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  New
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`flex space-x-2 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification._id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              title="Mark as read"
            >
              ✓ Read
            </button>
          )}
          <button
            onClick={() => onDelete(notification._id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Delete notification"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;