'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, User, Mail, Phone, Lock } from 'lucide-react';
import axios from 'axios';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields');
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

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Phone must be a valid 10-digit number');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/auth/signup', {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone || null,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign up');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600 mb-6">Join GharMart for seamless grocery shopping</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-semibold">Account created successfully! Redirecting...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name *
              </label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                disabled={loading || success}
                className="h-10"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                disabled={loading || success}
                className="h-10"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone (Optional)
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="9876543210"
                disabled={loading || success}
                className="h-10"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Password *
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="At least 8 characters"
                disabled={loading || success}
                className="h-10"
              />
              <p className="text-xs text-gray-500 mt-1">Must contain uppercase, lowercase, and numbers</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Confirm Password *</label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter password"
                disabled={loading || success}
                className="h-10"
              />
            </div>

            {/* Terms Agreement */}
            <div className="text-xs text-gray-600">
              <p>By creating an account, you agree to our <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link></p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full h-10 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : success ? 'Account Created!' : 'Create Account'}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
