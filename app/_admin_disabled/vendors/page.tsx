'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowLeft, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { getPendingVendorRequests, getAllVendors, getVendorStatistics } from '@/lib/admin/vendors'
import { DataTable } from '@/components/admin/DataTable'
import { supabase } from '@/lib/supabase'

export default function VendorsManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'pending'>('all')
  const [vendors, setVendors] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminId, setAdminId] = useState('')

  useEffect(() => {
    checkAdminAndLoadData()
  }, [tab, searchQuery])

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const isAdminUser = await verifyAdminAccess(user.id)
      if (!isAdminUser) {
        router.push('/')
        return
      }

      setAdminId(user.id)
      setIsAdmin(true)

      if (tab === 'pending') {
        loadPendingRequests()
      } else {
        loadVendors()
      }

      loadStats()
    } catch (error) {
      console.error('[v0] Admin check failed:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadVendors = async () => {
    try {
      const result = await getAllVendors({ search: searchQuery || undefined })
      setVendors(result.vendors)
    } catch (error) {
      console.error('[v0] Failed to load vendors:', error)
    }
  }

  const loadPendingRequests = async () => {
    try {
      const result = await getPendingVendorRequests()
      setPendingRequests(result.requests)
    } catch (error) {
      console.error('[v0] Failed to load pending requests:', error)
    }
  }

  const loadStats = async () => {
    try {
      const vendorStats = await getVendorStatistics()
      setStats(vendorStats)
    } catch (error) {
      console.error('[v0] Failed to load stats:', error)
    }
  }

  if (!isAdmin) return null

  const vendorColumns = [
    { key: 'full_name' as const, label: 'Name', sortable: true },
    { key: 'email' as const, label: 'Email', sortable: true },
    {
      key: 'shop' as const,
      label: 'Shop',
      render: (value: any) => value?.name || 'N/A',
    },
    {
      key: 'totalOrders' as const,
      label: 'Orders',
    },
    {
      key: 'totalRevenue' as const,
      label: 'Revenue',
      render: (value: any) => `₹${Math.round(value).toLocaleString()}`,
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: string) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/vendors/${value}`)}
          className="text-blue-500 hover:text-blue-600"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  const pendingColumns = [
    { key: 'shop_name' as const, label: 'Shop Name', sortable: true },
    { key: 'email' as const, label: 'Email' },
    { key: 'phone' as const, label: 'Phone' },
    { key: 'city' as const, label: 'City' },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: any) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          {value}
        </span>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: string) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/vendors/requests/${value}`)}
          className="text-blue-500 hover:text-blue-600"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-white">Vendor Management</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Vendors', value: stats.totalVendors, icon: '👥' },
              { label: 'Active Vendors', value: stats.activeVendors, icon: '✅' },
              { label: 'Suspended', value: stats.suspendedVendors, icon: '⛔' },
              { label: 'Active Shops', value: stats.activeShops, icon: '🏪' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-700 flex gap-8">
          {[
            { id: 'all', label: 'All Vendors', count: vendors.length },
            { id: 'pending', label: 'Pending Requests', count: pendingRequests.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`pb-3 font-medium transition ${
                tab === t.id
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label} {t.count > 0 && `(${t.count})`}
            </button>
          ))}
        </div>

        {/* Search */}
        {tab === 'all' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search vendors by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : tab === 'all' ? (
            <DataTable
              columns={vendorColumns}
              data={vendors}
              rowKey="id"
              striped
            />
          ) : (
            <DataTable
              columns={pendingColumns}
              data={pendingRequests}
              rowKey="id"
              striped
            />
          )}
        </div>
      </main>
    </div>
  )
}
