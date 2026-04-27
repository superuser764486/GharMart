'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { User, MapPin, Settings, LogOut, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/profile');
      setUser(response.data.user);
    } catch (err) {
      console.error('Failed to load profile:', err);
      // If user is not authenticated, redirect to login
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        router.push('/auth/signin');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout').catch(() => {
        // Endpoint may not exist yet, that's ok
      });
      document.cookie = 'accessToken=; Max-Age=0; path=/;';
      document.cookie = 'refreshToken=; Max-Age=0; path=/;';
      router.push('/auth/signin');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/auth/signin');
    }
  };

  const menuItems = [
    {
      icon: User,
      title: 'My Profile',
      description: 'Edit your personal information',
      href: '/account/profile',
    },
    {
      icon: MapPin,
      title: 'My Addresses',
      description: 'Manage your delivery addresses',
      href: '/account/addresses',
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Preferences and notifications',
      href: '/account/settings',
    },
  ];

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Loading your account...</p>
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
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow p-8 text-white mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user?.full_name || 'Welcome'}</h1>
                <p className="text-blue-100 mt-1">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="w-full bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h2>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Logout Button */}
          <div className="mt-8 p-6 bg-white rounded-lg shadow">
            <Button
              onClick={handleLogout}
              className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
