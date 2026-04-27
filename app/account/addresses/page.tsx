'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, MapPin, Plus, Trash2, Edit2, Check } from 'lucide-react';
import axios from 'axios';

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  street_address: string;
  apartment_number?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export default function AddressesPage() {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: '',
    fullName: '',
    phone: '',
    streetAddress: '',
    apartmentNumber: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      setLoading(true);
      const response = await axios.get('/api/addresses');
      setAddresses(response.data.addresses);
    } catch (err) {
      setError('Failed to load addresses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.phone || !formData.streetAddress || !formData.city || !formData.state || !formData.postalCode) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/api/addresses/${editingId}`, {
          label: formData.label,
          fullName: formData.fullName,
          phone: formData.phone,
          streetAddress: formData.streetAddress,
          apartmentNumber: formData.apartmentNumber,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          isDefault: formData.isDefault,
        });
      } else {
        await axios.post('/api/addresses', {
          label: formData.label,
          fullName: formData.fullName,
          phone: formData.phone,
          streetAddress: formData.streetAddress,
          apartmentNumber: formData.apartmentNumber,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          isDefault: formData.isDefault,
        });
      }

      await fetchAddresses();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save address');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      setDeleting(id);
      await axios.delete(`/api/addresses/${id}`);
      await fetchAddresses();
    } catch (err) {
      setError('Failed to delete address');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  function handleEdit(address: Address) {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      fullName: address.full_name,
      phone: address.phone,
      streetAddress: address.street_address,
      apartmentNumber: address.apartment_number || '',
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      isDefault: address.is_default,
    });
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      label: '',
      fullName: '',
      phone: '',
      streetAddress: '',
      apartmentNumber: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: false,
    });
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Loading addresses...</p>
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
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
              <p className="text-gray-600 mt-2">Manage your delivery addresses</p>
            </div>
            {!showForm && (
              <Button
                onClick={() => {
                  resetForm();
                  setEditingId(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </Button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Address Label */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-1">Label</label>
                  <select
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select label</option>
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-1">Full Name *</label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="h-10"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-1">Phone *</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="h-10"
                  />
                </div>

                {/* Street Address */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-1">Street Address *</label>
                  <Input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className="h-10"
                  />
                </div>

                {/* Apartment/Flat Number */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-1">Apartment/Flat (Optional)</label>
                  <Input
                    type="text"
                    name="apartmentNumber"
                    value={formData.apartmentNumber}
                    onChange={handleInputChange}
                    placeholder="Apartment 123"
                    className="h-10"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-1">City *</label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Delhi"
                    className="h-10"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-1">State *</label>
                  <Input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Delhi"
                    className="h-10"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-1">Postal Code *</label>
                  <Input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="110001"
                    className="h-10"
                  />
                </div>

                {/* Default Address */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium text-gray-900">Set as default address</label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
                  >
                    {editingId ? 'Update Address' : 'Add Address'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 h-10 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses List */}
          {addresses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No addresses added yet</p>
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="mt-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              >
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="bg-white rounded-lg shadow p-6 relative">
                  {address.is_default && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      <Check className="w-4 h-4" />
                      Default
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{address.label}</h3>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Name:</strong> {address.full_name}</p>
                    <p><strong>Phone:</strong> {address.phone}</p>
                    <p><strong>Address:</strong> {address.street_address} {address.apartment_number && `${address.apartment_number},`}</p>
                    <p><strong>Location:</strong> {address.city}, {address.state} {address.postal_code}</p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => handleEdit(address)}
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(address.id)}
                      disabled={deleting === address.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting === address.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
