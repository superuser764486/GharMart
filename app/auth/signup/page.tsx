'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/auth';
import { AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'customer' | 'vendor'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
    pincode: '',
    city: 'Delhi', // Default to Delhi
    shopName: '',
    shopCategory: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password || !formData.name) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (userType === 'vendor' && (!formData.shopName || !formData.shopCategory)) {
      setError('Please provide shop details');
      return;
    }

    try {
      setLoading(true);
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        userType,
        shopName: formData.shopName,
        shopCategory: formData.shopCategory,
        address: formData.address,
        pincode: formData.pincode,
        city: formData.city,
      });

      // Redirect based on user type
      router.push(userType === 'customer' ? '/profile' : '/vendor/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600 mb-6">Join GharMart today</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-900 mb-3 block">I am a:</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition ${
                  userType === 'customer'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setUserType('vendor')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition ${
                  userType === 'vendor'
                    ? 'border-green-600 bg-green-50 text-green-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Vendor
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Email *</label>
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

            {/* Name */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Full Name *</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
                disabled={loading}
                className="h-10"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Phone</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                disabled={loading}
                className="h-10"
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Address</label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address"
                disabled={loading}
                className="h-10"
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Pincode</label>
              <Input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="110001"
                disabled={loading}
                className="h-10"
              />
            </div>

            {/* Vendor-specific fields */}
            {userType === 'vendor' && (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-2">Shop Name *</label>
                  <Input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    placeholder="Your shop name"
                    disabled={loading}
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-2">Category *</label>
                  <select
                    name="shopCategory"
                    value={formData.shopCategory}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Kirana">Kirana</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Grains">Grains</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Meat">Meat</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Password *</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="At least 6 characters"
                disabled={loading}
                className="h-10"
              />
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
                disabled={loading}
                className="h-10"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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
