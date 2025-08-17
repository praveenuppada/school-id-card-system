import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAdminNotifications } from "../services/adminService";

export default function NotificationBell() {
  const { token, role } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && role === 'ADMIN') {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token, role]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getAdminNotifications();
      console.log("🔔 Notifications response:", response);
      
      // Handle different response structures
      let notificationsData = [];
      if (response.data && response.data.success && Array.isArray(response.data.notifications)) {
        notificationsData = response.data.notifications;
      } else if (Array.isArray(response.data)) {
        notificationsData = response.data;
      } else if (response.data && Array.isArray(response.data.notifications)) {
        notificationsData = response.data.notifications;
      } else {
        console.warn("🔔 Unexpected notifications response structure:", response.data);
        notificationsData = [];
      }
      
      console.log("🔔 Final notifications data:", notificationsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:8081/api/admin/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'EXCEL_UPLOAD':
        return '📊';
      case 'PHOTO_UPLOAD':
        return '📸';
      case 'TEACHER_UPDATE':
        return '✏️';
      case 'EXCEL_DELETE':
        return '🗑️';
      default:
        return '🔔';
    }
  };

  // Only show notification bell for admin users
  if (role !== "ADMIN") {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto"></div>
              </div>
            ) : (!Array.isArray(notifications) || notifications.length === 0) ? (
              <p className="text-gray-500 text-center py-4">No notifications</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
                        : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full ml-2 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {Array.isArray(notifications) && notifications.length > 0 && (
              <button
                onClick={fetchNotifications}
                className="w-full mt-3 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                🔄 Refresh
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
