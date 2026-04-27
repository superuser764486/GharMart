'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, User, Mail, Phone, Calendar, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  profile_photo_url?: string;
  date_of_birth?: string;
  gender?: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    preferredLanguage: 'en',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/profile');
      setUser(response.data.user);
      setFormData({
        fullName: response.data.user.full_name,
        phone: response.data.user.phone || '',
        dateOfBirth: response.data.user.date_of_birth || '',
        gender: response.data.user.gender || '',
        preferredLanguage: response.data.user.preferred_language || 'en',
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setUpdating(true);
      const response = await axios.put('/api/users/profile', {
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        preferredLanguage: formData.preferredLanguage,
      });

      setUser(response.data.user);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Loading profile...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account information</p>
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

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Account Info Display */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>

              {/* Full Name */}
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  disabled={updating}
                  className="h-10"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  disabled={updating}
                  className="h-10"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date of Birth
                </label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={updating}
                  className="h-10"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={updating}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">Preferred Language</label>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleInputChange}
                  disabled={updating}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={updating}
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
