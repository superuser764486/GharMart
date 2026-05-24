'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, LineChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { getVendorStats, getDailyStats, getRevenueByCategory, getTopProducts } from '@/lib/vendor/analytics'

export default function VendorAnalyticsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [dailyStats, setDailyStats] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30')

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
      
      const [vendorStats, daily, category, products] = await Promise.all([
        getVendorStats(userData.id),
        getDailyStats(userData.id, parseInt(dateRange)),
        getRevenueByCategory(userData.id),
        getTopProducts(userData.id, 10),
      ])
      
      setStats(vendorStats)
      setDailyStats(daily)
      setCategoryData(category)
      setTopProducts(products)
    } catch (error) {
      console.error('[v0] Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-white">{stats?.totalOrders || 0}</p>
            <p className="text-xs text-green-400 mt-2">+12% from last period</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Average Order Value</p>
            <p className="text-3xl font-bold text-white">₹{(stats?.averageOrderValue || 0).toFixed(0)}</p>
            <p className="text-xs text-green-400 mt-2">Stable vs last period</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Total Customers</p>
            <p className="text-3xl font-bold text-white">{stats?.totalCustomers || 0}</p>

          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Conversion Rate</p>
            <p className="text-3xl font-bold text-white">3.24%</p>
            <p className="text-xs text-yellow-400 mt-2">-0.5% from last period</p>
          </div>
        </div>

        {/* Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue by Category
            </h3>
            <div className="space-y-3">
              {categoryData.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-300 text-sm">{cat.category}</p>
                    <p className="text-gray-400 text-sm">₹{cat.revenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{width: `${(cat.revenue / (categoryData[0]?.revenue || 1)) * 100}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Products
            </h3>
            <div className="space-y-3">
              {topProducts.slice(0, 6).map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <p className="text-gray-300 truncate">{product.name}</p>
                  <p className="text-green-400 font-semibold text-sm">₹{product.price.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Performance */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Daily Performance ({dateRange} days)
          </h3>
          {dailyStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Orders</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Revenue</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Avg Order</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStats.slice(0, 10).map(day => (
                    <tr key={day.date} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="px-4 py-3 text-gray-300">{new Date(day.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-blue-400">{day.total_orders}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">₹{day.total_revenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                      <td className="px-4 py-3 text-gray-300">₹{(day.total_revenue / Math.max(day.total_orders, 1)).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">No data available for this period</div>
          )}
        </div>
      </main>
    </div>
  )
}
