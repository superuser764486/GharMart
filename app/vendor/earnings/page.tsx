'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, TrendingUp, CreditCard, Wallet, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { getVendorStats, calculatePayoutDue, getPayoutHistory } from '@/lib/vendor/analytics'

export default function VendorEarningsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [payoutDue, setPayoutDue] = useState(0)
  const [payoutHistory, setPayoutHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [vendorId, setVendorId] = useState<string | null>(null)

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
      
      const [vendorStats, due, history] = await Promise.all([
        getVendorStats(userData.id),
        calculatePayoutDue(userData.id),
        getPayoutHistory(userData.id),
      ])
      
      setStats(vendorStats)
      setPayoutDue(due)
      setPayoutHistory(history)
    } catch (error) {
      console.error('[v0] Error loading earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-gray-400">Loading earnings...</div>
      </div>
    )
  }

  const commission = stats ? stats.totalRevenue * 0.05 : 0
  const netRevenue = stats ? stats.totalRevenue - commission : 0

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Earnings & Payouts</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Gross Revenue */}
          <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-green-300 text-sm font-semibold">Gross Revenue</p>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-2">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
            <p className="text-green-300 text-sm">{stats?.totalOrders || 0} orders completed</p>
          </div>

          {/* Net Earnings */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-blue-300 text-sm font-semibold">Net Earnings</p>
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-2">₹{netRevenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
            <p className="text-blue-300 text-sm">After 5% platform commission</p>
          </div>

          {/* Commission */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Platform Commission (5%)</p>
            <p className="text-2xl font-bold text-red-400">₹{commission.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
            <p className="text-gray-500 text-xs mt-2">Automatically deducted from payouts</p>
          </div>

          {/* Payout Due */}
          <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 border border-yellow-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-yellow-300 text-sm font-semibold">Payout Due</p>
              <CreditCard className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">₹{payoutDue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
            <Button size="sm" className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white w-full">
              Request Payout
            </Button>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Average Order Value</p>
            <p className="text-2xl font-bold text-white">₹{(stats?.averageOrderValue || 0).toFixed(0)}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Total Refunds</p>
            <p className="text-2xl font-bold text-red-400">₹{(stats?.totalRefunds || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Completed Orders</p>
            <p className="text-2xl font-bold text-green-400">{stats?.completedOrders || 0}</p>
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Payout History</h3>
            <Button size="sm" variant="outline" className="bg-gray-700 border-gray-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {payoutHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutHistory.map(payout => (
                    <tr key={payout.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="px-6 py-4 text-gray-300">{new Date(payout.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-green-400 font-semibold">₹{payout.amount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payout.status === 'completed' ? 'bg-green-900 text-green-300' :
                          payout.status === 'processing' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 capitalize">{payout.payment_method || 'Bank Transfer'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No payouts yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
