'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, Edit, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { getAddresses, addAddress, deleteAddress, setDefaultAddress } from '@/lib/customer/addresses'

export default function AddressesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    label: '',
    full_address: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }
      setUserId(user.id)
      const addressList = await getAddresses(user.id)
      setAddresses(addressList)
    } catch (error) {
      console.error('[v0] Error loading addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const result = await addAddress(userId, {
      ...formData,
      is_default: addresses.length === 0,
    } as any)

    if (result.success) {
      setFormData({ label: '', full_address: '', city: '', state: '', pincode: '' })
      setShowForm(false)
      const updatedAddresses = await getAddresses(userId)
      setAddresses(updatedAddresses)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!userId || !confirm('Delete this address?')) return
    await deleteAddress(userId, addressId)
    const updatedAddresses = await getAddresses(userId)
    setAddresses(updatedAddresses)
  }

  const handleSetDefault = async (addressId: string) => {
    if (!userId) return
    await setDefaultAddress(userId, addressId)
    const updatedAddresses = await getAddresses(userId)
    setAddresses(updatedAddresses)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading addresses...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Delivery Addresses</h1>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Address</h2>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Address Label (e.g., Home, Office)"
                  value={formData.label}
                  onChange={e => setFormData({...formData, label: e.target.value})}
                  className="bg-gray-50"
                />
                <Input
                  placeholder="Full Address"
                  value={formData.full_address}
                  onChange={e => setFormData({...formData, full_address: e.target.value})}
                  required
                  className="bg-gray-50"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="City"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  required
                  className="bg-gray-50"
                />
                <Input
                  placeholder="State"
                  value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})}
                  required
                  className="bg-gray-50"
                />
                <Input
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={e => setFormData({...formData, pincode: e.target.value})}
                  required
                  className="bg-gray-50"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Save Address
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(address => (
            <div key={address.id} className="bg-white rounded-lg border border-gray-200 p-6 relative">
              {address.is_default && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Default
                </div>
              )}

              <div className="flex gap-3 mb-4">
                <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{address.label || 'Address'}</h3>
                  <p className="text-gray-600 text-sm">{address.full_address}</p>
                  <p className="text-gray-600 text-sm">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {!address.is_default && (
                  <Button
                    onClick={() => handleSetDefault(address.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  onClick={() => handleDeleteAddress(address.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {addresses.length === 0 && !showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No addresses yet</h2>
            <p className="text-gray-600">Add a delivery address to get started</p>
          </div>
        )}
      </main>
    </div>
  )
}
