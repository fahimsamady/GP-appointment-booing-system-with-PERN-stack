import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Tabs } from 'flowbite-react';
import { Mail, Bell, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import axiosWithAuth from '../middelware/axiosWithAuth';

function Inbox() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axiosWithAuth().get('/api/user/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axiosWithAuth().put(`/api/user/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axiosWithAuth().delete(`/api/user/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosWithAuth().put('/api/user/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Clock className="w-5 h-5" />;
      case 'prescription':
        return <CheckCircle className="w-5 h-5" />;
      case 'reminder':
        return <Bell className="w-5 h-5" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'blue';
      case 'prescription':
        return 'green';
      case 'reminder':
        return 'yellow';
      case 'alert':
        return 'red';
      default:
        return 'gray';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.is_read;
    return notif.type === activeTab;
  });

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inbox</h1>
            <p className="text-gray-600">Your notifications and messages</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} color="light" size="sm">
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Tabs.Group>
        <Tabs.Item title="All" active={activeTab === 'all'}>
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No notifications</p>
                </div>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`${!notification.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full bg-${getNotificationColor(notification.type)}-100`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          {!notification.is_read && (
                            <Badge color="blue" size="sm">New</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          color="light"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        color="light"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tabs.Item>

        <Tabs.Item title={`Unread (${unreadCount})`} active={activeTab === 'unread'}>
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-600">All caught up! No unread notifications</p>
                </div>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className="border-l-4 border-l-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full bg-${getNotificationColor(notification.type)}-100`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          <Badge color="blue" size="sm">New</Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        color="light"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                      <Button
                        size="sm"
                        color="light"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tabs.Item>

        <Tabs.Item title="Appointments" active={activeTab === 'appointment'}>
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No appointment notifications</p>
                </div>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`${!notification.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          {!notification.is_read && (
                            <Badge color="blue" size="sm">New</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          color="light"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        color="light"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tabs.Item>
      </Tabs.Group>
    </div>
  );
}

export default Inbox;
