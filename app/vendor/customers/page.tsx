'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, Filter, TrendingUp, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { getVendorCustomers, getTopCustomers, getCustomerSegmentation } from '@/lib/vendor/customers'

export default function VendorCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [topCustomers, setTopCustomers] = useState<any[]>([])
  const [segments, setSegments] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('spent')

  useEffect(() => {
    checkVendor()
  }, [])

  const checkVendor = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', user.id)
        .single()

      if (!userData || userData.role !== 'vendor') {
        router.push('/')
        return
      }

      setVendorId(userData.id)
      
      const [customersList, topCustomersList, customerSegments] = await Promise.all([
        getVendorCustomers(userData.id),
        getTopCustomers(userData.id, 5),
        getCustomerSegmentation(userData.id),
      ])
      
      setCustomers(customersList)
      setTopCustomers(topCustomersList)
      setSegments(customerSegments)
    } catch (error) {
      console.error('[v0] Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-gray-400">Loading customers...</div>
      </div>
    )
  }

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'spent') return b.total_spent - a.total_spent
    if (sortBy === 'orders') return b.total_orders - a.total_orders
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Customer Management</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Segments */}
        {segments && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">VIP Customers</p>
              <p className="text-2xl font-bold text-purple-400">{segments.vip}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Regular</p>
              <p className="text-2xl font-bold text-blue-400">{segments.regular}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Occasional</p>
              <p className="text-2xl font-bold text-green-400">{segments.occasional}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-white">{customers.length}</p>
            </div>
          </div>
        )}

        {/* Top Customers */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Top Customers</h3>
          <div className="space-y-3">
            {topCustomers.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div>
                  <p className="text-white font-medium">{c.name}</p>
                  <p className="text-sm text-gray-400">{c.total_orders} orders</p>
                </div>
                <p className="text-green-400 font-semibold">₹{c.total_spent.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="spent">Sort by Spent</option>
            <option value="orders">Sort by Orders</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Customers Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Orders</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Total Spent</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Avg Order</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="px-6 py-4 text-gray-300">{customer.name}</td>
                      <td className="px-6 py-4 text-gray-400">{customer.email}</td>
                      <td className="px-6 py-4 text-blue-400">{customer.total_orders}</td>
                      <td className="px-6 py-4 text-green-400 font-semibold">₹{customer.total_spent.toFixed(0)}</td>
                      <td className="px-6 py-4 text-gray-300">₹{(customer.total_spent / Math.max(customer.total_orders, 1)).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No customers found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
