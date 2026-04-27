'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Bell, Globe, Lock, LogOut } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [preferences, setPreferences] = useState({
    preferredLanguage: 'en',
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/preferences');
      setPreferences(response.data.preferences);
    } catch (err) {
      setError('Failed to load preferences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePreferencesUpdate() {
    setError('');
    setSuccess('');

    try {
      setUpdating(true);
      await axios.put('/api/users/preferences', preferences);
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setUpdating(false);
    }
  }

  async function handleLogout() {
    try {
      // Clear auth cookies by calling logout endpoint if exists
      await axios.post('/api/auth/logout').catch(() => {
        // Endpoint may not exist yet, that's ok
      });
      
      // Clear cookies and redirect
      document.cookie = 'accessToken=; Max-Age=0; path=/;';
      document.cookie = 'refreshToken=; Max-Age=0; path=/;';
      router.push('/auth/signin');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/auth/signin');
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account preferences</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Preferences Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            {/* Language Settings */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <Globe className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Language</h2>
                  <p className="text-sm text-gray-600 mb-4">Choose your preferred language for the app</p>
                  <select
                    value={preferences.preferredLanguage}
                    onChange={(e) =>
                      setPreferences(prev => ({
                        ...prev,
                        preferredLanguage: e.target.value,
                      }))
                    }
                    className="w-full md:w-64 h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="fr">French (Français)</option>
                    <option value="de">German (Deutsch)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <Bell className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>

                  {/* Master Toggle */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">All Notifications</p>
                        <p className="text-sm text-gray-600">Enable or disable all notification types</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.notificationsEnabled}
                          onChange={(e) =>
                            setPreferences(prev => ({
                              ...prev,
                              notificationsEnabled: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Individual Toggles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Order updates, promotions, etc.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) =>
                            setPreferences(prev => ({
                              ...prev,
                              emailNotifications: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                          disabled={!preferences.notificationsEnabled}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Delivery updates via text</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.smsNotifications}
                          onChange={(e) =>
                            setPreferences(prev => ({
                              ...prev,
                              smsNotifications: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                          disabled={!preferences.notificationsEnabled}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-600">In-app and browser notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.pushNotifications}
                          onChange={(e) =>
                            setPreferences(prev => ({
                              ...prev,
                              pushNotifications: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                          disabled={!preferences.notificationsEnabled}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <Button
                onClick={handlePreferencesUpdate}
                disabled={updating}
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
              >
                {updating ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Security</h2>
                  <p className="text-sm text-gray-600 mb-4">Manage your account security settings</p>

                  <div className="space-y-3">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Change Password
                    </Button>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Two-Factor Authentication
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <LogOut className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Session</h2>
                  <p className="text-sm text-gray-600 mb-4">Log out from your account</p>

                  <Button
                    onClick={handleLogout}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
