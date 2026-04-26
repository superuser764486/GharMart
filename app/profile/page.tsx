'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Check } from 'lucide-react';
import { getCurrentUser, updateUserProfile, signOut } from '@/lib/auth';
import { User } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
    city: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth/signin');
        return;
      }
      setUser(currentUser);
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        pincode: currentUser.pincode || '',
        city: currentUser.city || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!user) return;

    try {
      setSaving(true);
      await updateUserProfile(user.id, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
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
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-gray-200 rounded-lg h-64 animate-pulse" />
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <p className="text-gray-600">Not signed in</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">Profile updated successfully</p>
              </div>
            )}

            {/* User Info */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-2">Email</label>
                  <Input
                    type="email"
                    value={user.email}
                    disabled
                    className="h-10 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-2">Account Type</label>
                  <Input
                    value={user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
                    disabled
                    className="h-10 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">Full Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  disabled={saving}
                  className="h-10"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  disabled={saving}
                  className="h-10"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">Address</label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  disabled={saving}
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-2">Pincode</label>
                  <Input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="110001"
                    disabled={saving}
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-2">City</label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    disabled={saving}
                    className="h-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-10"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>

            {/* Sign Out */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
