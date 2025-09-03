import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Tabs } from 'flowbite-react';
import { User, Bell, Shield, Key } from 'lucide-react';
import axiosWithAuth from '../middelware/axiosWithAuth';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
    emergency_contact: ''
  });
  const [notifications, setNotifications] = useState({
    email_reminders: true,
    sms_reminders: true,
    appointment_updates: true,
    prescription_ready: true
  });
  const [password, setPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosWithAuth().get('/api/user/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosWithAuth().put('/api/user/profile', profile);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      await axiosWithAuth().put('/api/user/notifications', notifications);
      setMessage({ type: 'success', text: 'Notification preferences updated' });
    } catch (error) {
      console.error('Error updating notifications:', error);
      setMessage({ type: 'error', text: 'Failed to update notifications' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password.new_password !== password.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      await axiosWithAuth().put('/api/user/password', password);
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPassword({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section === 'profile') {
      setProfile(prev => ({ ...prev, [field]: value }));
    } else if (section === 'notifications') {
      setNotifications(prev => ({ ...prev, [field]: value }));
    } else if (section === 'password') {
      setPassword(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {message.text && (
        <Alert color={message.type === 'success' ? 'success' : 'failure'} className="mb-4">
          {message.text}
        </Alert>
      )}

      <Tabs.Group>
        <Tabs.Item title="Profile" icon={User}>
          <Card>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.first_name}
                    onChange={(e) => handleInputChange('profile', 'first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.last_name}
                    onChange={(e) => handleInputChange('profile', 'last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone_number}
                    onChange={(e) => handleInputChange('profile', 'phone_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profile.date_of_birth}
                    onChange={(e) => handleInputChange('profile', 'date_of_birth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={profile.emergency_contact}
                    onChange={(e) => handleInputChange('profile', 'emergency_contact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={profile.address}
                  onChange={(e) => handleInputChange('profile', 'address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Card>
        </Tabs.Item>

        <Tabs.Item title="Notifications" icon={Bell}>
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Notification Preferences</h3>
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              ))}
              <Button onClick={handleNotificationUpdate} disabled={loading} className="w-full md:w-auto">
                {loading ? 'Updating...' : 'Update Notifications'}
              </Button>
            </div>
          </Card>
        </Tabs.Item>

        <Tabs.Item title="Security" icon={Shield}>
          <Card>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={password.current_password}
                  onChange={(e) => handleInputChange('password', 'current_password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password.new_password}
                  onChange={(e) => handleInputChange('password', 'new_password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={password.confirm_password}
                  onChange={(e) => handleInputChange('password', 'confirm_password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </Card>
        </Tabs.Item>
      </Tabs.Group>
    </div>
  );
}

export default Settings;
