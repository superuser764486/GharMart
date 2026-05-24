'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { getVendorStats } from '@/lib/vendor/analytics'
import { getVendorOrders, updateOrderStatus } from '@/lib/vendor/orders'
import { getVendorShop } from '@/lib/vendor/shops'

interface StatCard {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
}

export default function VendorDashboard() {
  const router = useRouter()
  const [isVendor, setIsVendor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [shopName, setShopName] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])

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
        .select('id, user_type, name')
        .eq('id', user.id)
        .single()

      if (!userData || userData.user_type !== 'vendor') {
        router.push('/')
        return
      }

      setVendorId(userData.id)
      setIsVendor(true)

      // Fetch shop and stats
      const shop = await getVendorShop(userData.id)
      if (shop) setShopName(shop.name)

      const vendorStats = await getVendorStats(userData.id)
      if (vendorStats) setStats(vendorStats)

      const recentOrders = await getVendorOrders(userData.id)
      setOrders(recentOrders)
    } catch (error) {
      console.error('[v0] Vendor check failed:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/signin')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-gray-400">Loading vendor dashboard...</div>
        </div>
      </div>
    )
  }

  if (!isVendor) {
    return null
  }

  const statCards: StatCard[] = [
    {
      icon: <ShoppingCart className="w-8 h-8 text-blue-600" />,
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      trend: 'up',
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-600" />,
      label: 'Total Revenue',
      value: `₹${Math.round(stats?.totalRevenue || 0).toLocaleString()}`,
    },
    {
      icon: <Package className="w-8 h-8 text-purple-600" />,
      label: 'Active Products',
      value: stats?.activeProducts || 0,
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      label: 'Total Customers',
      value: stats?.totalCustomers || 0,
    },
  ]

  const navigationItems = [
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Dashboard', href: '/vendor/dashboard' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders', href: '/vendor/orders' },
    { icon: <Package className="w-5 h-5" />, label: 'Products', href: '/vendor/products' },
    { icon: <Users className="w-5 h-5" />, label: 'Customers', href: '/vendor/customers' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Earnings', href: '/vendor/earnings' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics', href: '/vendor/analytics' },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Vendor Dashboard</h1>
              <p className="text-xs text-gray-400">{shopName || 'My Shop'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/vendor/settings">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-700 rounded-lg">{stat.icon}</div>
                {stat.trend && (
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {navigationItems.map((item, idx) => (
              <Link key={idx} href={item.href}>
                <Button
                  variant="outline"
                  className="w-full h-full py-6 flex flex-col items-center gap-2 bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                >
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <Link href="/vendor/orders">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                View All
              </Button>
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Order ID</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Customer</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="px-6 py-4 text-gray-300 font-mono">{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-4 text-gray-300">{order.user_id}</td>
                      <td className="px-6 py-4 text-green-400 font-semibold">₹{order.total_amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered'
                            ? 'bg-green-900 text-green-300'
                            : order.status === 'pending'
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-blue-900 text-blue-300'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No orders yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
