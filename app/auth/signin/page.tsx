'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/auth';
import { getCurrentUser } from '@/lib/auth';
import { AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      await signIn({
        email: formData.email,
        password: formData.password,
      });

      // Get user details to redirect appropriately
      const user = await getCurrentUser();
      if (user) {
        if (user.user_type === 'customer') {
          router.push('/profile');
        } else if (user.user_type === 'vendor') {
          router.push('/vendor/dashboard');
        } else if (user.user_type === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-600 mb-6">Welcome back to GharMart</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                disabled={loading}
                className="h-10"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Your password"
                disabled={loading}
                className="h-10"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-semibold mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-800 mb-1"><strong>Customer:</strong> customer1@gharmart.com</p>
            <p className="text-xs text-blue-800 mb-1"><strong>Vendor:</strong> vendor1@gharmart.com</p>
            <p className="text-xs text-blue-800"><strong>Password:</strong> (use any password)</p>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
