'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Lock, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(true);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setError('Invalid or missing reset token');
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/auth/reset-password', {
        token,
        newPassword: formData.password,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
      setValidToken(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h1>
          <p className="text-gray-600 mb-6">Enter your new password</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">{error}</p>
                {!validToken && (
                  <p className="text-sm text-red-600 mt-1">
                    <Link href="/auth/forgot-password" className="underline hover:text-red-700">
                      Request a new reset link
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-700">Password Reset Successfully!</p>
                  <p className="text-sm text-green-600 mt-1">You can now sign in with your new password. Redirecting...</p>
                </div>
              </div>
            </div>
          ) : validToken ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> New Password
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="At least 8 characters"
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">Confirm Password</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter password"
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Back to{' '}
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign In
                </Link>
              </p>
            </form>
          ) : null}
        </div>
      </main>
    </>
  );
}
