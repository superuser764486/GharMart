'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { getAllOrders, getOrderStatistics } from '@/lib/admin/orders'
import { DataTable } from '@/components/admin/DataTable'
import { supabase } from '@/lib/supabase'

export default function OrdersManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminAndLoadOrders()
  }, [statusFilter, dateFrom, dateTo])

  const checkAdminAndLoadOrders = async () => {
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

      setIsAdmin(true)
      loadOrders()
      loadStats()
    } catch (error) {
      console.error('[v0] Admin check failed:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      const result = await getAllOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: 100,
      })
      setOrders(result.orders)
    } catch (error) {
      console.error('[v0] Failed to load orders:', error)
    }
  }

  const loadStats = async () => {
    try {
      const orderStats = await getOrderStatistics(dateFrom || undefined, dateTo || undefined)
      setStats(orderStats)
    } catch (error) {
      console.error('[v0] Failed to load stats:', error)
    }
  }

  if (!isAdmin) return null

  const columns = [
    {
      key: 'id' as const,
      label: 'Order ID',
      render: (value: string) => value.substring(0, 8).toUpperCase(),
    },
    {
      key: 'customer_id' as const,
      label: 'Customer',
      render: (value: string) => value.substring(0, 8),
    },
    {
      key: 'total_amount' as const,
      label: 'Amount',
      sortable: true,
      render: (value: number) => `₹${Math.round(value).toLocaleString()}`,
    },
    {
      key: 'status' as const,
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-800',
          confirmed: 'bg-blue-100 text-blue-800',
          delivered: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        }
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        )
      },
    },
    {
      key: 'payment_status' as const,
      label: 'Payment',
      render: (value: string) => (
        <span className={`text-xs font-semibold ${value === 'paid' ? 'text-green-500' : 'text-red-500'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'created_at' as const,
      label: 'Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: string) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/orders/${value}`)}
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
          <h1 className="text-2xl font-bold text-white">Order Management</h1>
          <Button
            onClick={loadOrders}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Orders', value: stats.totalOrders },
              { label: 'Pending', value: stats.pending },
              { label: 'Confirmed', value: stats.confirmed },
              { label: 'Delivered', value: stats.delivered },
              { label: 'Cancelled', value: stats.cancelled },
            ].map((stat, idx) => (
              <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setStatusFilter('all')
                  setDateFrom('')
                  setDateTo('')
                }}
                variant="outline"
                className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading orders...</div>
          ) : orders.length > 0 ? (
            <DataTable
              columns={columns}
              data={orders}
              rowKey="id"
              striped
            />
          ) : (
            <div className="p-8 text-center text-gray-400">No orders found</div>
          )}
        </div>
      </main>
    </div>
  )
}
