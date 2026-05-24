'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { verifyAdminAccess, getAdminDetails } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

interface StatCard {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
  href?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminDetails, setAdminDetails] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    activeOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    blockedUsers: 0,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [systemStatus] = useState([
    { name: 'Database', status: 'Healthy', uptime: '99.9%' },
    { name: 'API Servers', status: 'Healthy', uptime: '99.8%' },
    { name: 'Email Service', status: 'Healthy', uptime: '100%' },
    { name: 'Storage', status: 'Healthy', uptime: '99.7%' },
  ])

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
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

      const details = await getAdminDetails(user.id)
      setAdminDetails(details)
      setIsAdmin(true)

      // Fetch statistics
      fetchStats()
    } catch (error) {
      console.error('[v0] Admin check failed:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'customer')

      // Get total vendors
      const { count: vendorsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'vendor')

      // Get active orders
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed'])

      // Get total revenue
      const { data: deliveredOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered')

      const revenue = (deliveredOrders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)

      // Get pending approvals
      const { count: pendingProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('moderation_status', 'pending')

      const { count: pendingVendors } = await supabase
        .from('vendor_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Get blocked users
      const { count: blockedCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_blocked', true)

      setStats({
        totalUsers: usersCount || 0,
        totalVendors: vendorsCount || 0,
        activeOrders: ordersCount || 0,
        totalRevenue: revenue,
        pendingApprovals: (pendingProducts || 0) + (pendingVendors || 0),
        blockedUsers: blockedCount || 0,
      })

      // Fetch recent activities from database
      fetchRecentActivities()
    } catch (error) {
      console.error('[v0] Failed to fetch stats:', error)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      // Get recent user registrations
      const { data: recentUsers } = await supabase
        .from('users')
        .select('id, email, created_at, user_type')
        .order('created_at', { ascending: false })
        .limit(2)

      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, created_at, status')
        .order('created_at', { ascending: false })
        .limit(2)

      // Get recent approved products
      const { data: approvedProducts } = await supabase
        .from('products')
        .select('id, name, updated_at')
        .eq('moderation_status', 'approved')
        .order('updated_at', { ascending: false })
        .limit(1)

      const activities = []

      // Add real activities to list
      if (recentUsers && recentUsers[0]) {
        activities.push({
          action: `User ${recentUsers[0].user_type === 'vendor' ? 'vendor' : 'registered'}`,
          time: new Date(recentUsers[0].created_at).toLocaleString(),
          icon: 'check',
          type: 'success'
        })
      }

      if (recentOrders && recentOrders[0]) {
        activities.push({
          action: `Order ${recentOrders[0].status}`,
          time: new Date(recentOrders[0].created_at).toLocaleString(),
          icon: 'check',
          type: 'success'
        })
      }

      if (approvedProducts && approvedProducts[0]) {
        activities.push({
          action: `Product approved: ${approvedProducts[0].name}`,
          time: new Date(approvedProducts[0].updated_at).toLocaleString(),
          icon: 'check',
          type: 'info'
        })
      }

      setRecentActivities(activities)
    } catch (error) {
      console.error('[v0] Failed to fetch activities:', error)
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
          <div className="text-gray-400">Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const statCards: StatCard[] = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      label: 'Total Users',
      value: stats.totalUsers,
      href: '/admin/users',
    },
    {
      icon: <Store className="w-8 h-8 text-green-600" />,
      label: 'Total Vendors',
      value: stats.totalVendors,
      href: '/admin/vendors',
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-orange-600" />,
      label: 'Active Orders',
      value: stats.activeOrders,
      trend: 'up',
      href: '/admin/orders',
    },
    {
      icon: <DollarSign className="w-8 h-8 text-purple-600" />,
      label: 'Total Revenue',
      value: `₹${Math.round(stats.totalRevenue).toLocaleString()}`,
      href: '/admin/finance',
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-red-600" />,
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      href: '/admin/products',
    },
    {
      icon: <XCircle className="w-8 h-8 text-red-500" />,
      label: 'Blocked Users',
      value: stats.blockedUsers,
    },
  ]

  const quickActions = [
    { icon: <Users className="w-5 h-5" />, label: 'Users', href: '/admin/users' },
    { icon: <Store className="w-5 h-5" />, label: 'Vendors', href: '/admin/vendors' },
    { icon: <Package className="w-5 h-5" />, label: 'Products', href: '/admin/products' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders', href: '/admin/orders' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Finance', href: '/admin/finance' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', href: '/admin/analytics' },
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-400">{adminDetails?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{adminDetails?.role}</p>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat, idx) => (
            <Link key={idx} href={stat.href || '#'}>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer h-full">
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
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, idx) => (
              <Link key={idx} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-full py-6 flex flex-col items-center gap-2 bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                >
                  {action.icon}
                  <span className="text-xs">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-700 last:border-0">
                    {activity.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : activity.type === 'warning' ? (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{activity.action}</p>
                    </div>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-white">System Status</h3>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Database', status: 'Healthy', uptime: '99.9%' },
                { name: 'API Servers', status: 'Healthy', uptime: '99.8%' },
                { name: 'Email Service', status: 'Healthy', uptime: '100%' },
                { name: 'Storage', status: 'Healthy', uptime: '99.7%' },
              ].map((service, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                  <span className="text-sm text-gray-300">{service.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{service.uptime}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Key Metrics (Current)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, change: '' },
              { label: 'Total Vendors', value: stats.totalVendors, change: '' },
              { label: 'Active Orders', value: stats.activeOrders, change: '' },
              { label: 'Total Revenue', value: `₹${Math.round(stats.totalRevenue).toLocaleString()}`, change: '' },
            ].map((metric, idx) => (
              <div key={idx} className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-white mb-2">{metric.value}</p>
                {metric.change && <p className="text-xs text-green-500">{metric.change}</p>}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
