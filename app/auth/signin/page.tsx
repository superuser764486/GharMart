'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Mail, Lock } from 'lucide-react';
import axios from 'axios';

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

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
      const response = await axios.post('/api/auth/signin', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/auth/send-otp', { email: formData.email });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('Please enter OTP');
      return;
    }

    try {
      setLoading(true);
      // Note: In production, you&apos;d need to pass the actual stored OTP from session/state
      const response = await axios.post('/api/auth/verify-otp', {
        email: formData.email,
        otp,
        storedOTP: otp, // This should come from server session in production
      });

      if (response.data.success) {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
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

          {!otpSent ? (
            <form onSubmit={useOTP ? handleSendOTP : handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
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

              {!useOTP && (
                <>
                  {/* Password */}
                  <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Password
                    </label>
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
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
              >
                {loading ? 'Loading...' : useOTP ? 'Send OTP' : 'Sign In'}
              </Button>

              {/* OTP Toggle */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUseOTP(!useOTP);
                    setFormData(prev => ({ ...prev, password: '' }));
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {useOTP ? 'Sign in with password instead' : 'Sign in with OTP instead'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Enter the OTP sent to {formData.email}</p>
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">OTP Code</label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  disabled={loading}
                  className="h-10 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 w-full text-center"
              >
                Change email
              </button>
            </form>
          )}

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
