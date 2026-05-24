'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { getPlatformEarnings, getFinanceSummary, getPayoutLogs, getRefundLogs } from '@/lib/admin/finance'
import { DataTable } from '@/components/admin/DataTable'
import { supabase } from '@/lib/supabase'

export default function FinanceManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [financeSummary, setFinanceSummary] = useState<any>(null)
  const [platformEarnings, setPlatformEarnings] = useState<any>(null)
  const [payouts, setPayouts] = useState<any[]>([])
  const [refunds, setRefunds] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminAndLoadFinance()
  }, [])

  const checkAdminAndLoadFinance = async () => {
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
      loadFinanceData()
    } catch (error) {
      console.error('[v0] Admin check failed:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadFinanceData = async () => {
    try {
      const [summary, earnings, payoutData, refundData] = await Promise.all([
        getFinanceSummary(),
        getPlatformEarnings(),
        getPayoutLogs({ limit: 20 }),
        getRefundLogs({ limit: 20 }),
      ])

      setFinanceSummary(summary)
      setPlatformEarnings(earnings)
      setPayouts(payoutData.payouts)
      setRefunds(refundData.refunds)
    } catch (error) {
      console.error('[v0] Failed to load finance data:', error)
    }
  }

  if (!isAdmin) return null

  const payoutColumns = [
    {
      key: 'vendor_id' as const,
      label: 'Vendor ID',
      render: (value: string) => value.substring(0, 8),
    },
    {
      key: 'period_start' as const,
      label: 'Period',
      render: (value: string, item: any) => `${new Date(value).toLocaleDateString()} - ${new Date(item.period_end).toLocaleDateString()}`,
    },
    {
      key: 'net_amount' as const,
      label: 'Amount',
      render: (value: number) => `₹${Math.round(value).toLocaleString()}`,
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'processed' ? 'bg-green-100 text-green-800' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
  ]

  const refundColumns = [
    {
      key: 'order_id' as const,
      label: 'Order ID',
      render: (value: string) => value.substring(0, 8).toUpperCase(),
    },
    {
      key: 'amount' as const,
      label: 'Amount',
      render: (value: number) => `₹${Math.round(value).toLocaleString()}`,
    },
    {
      key: 'reason' as const,
      label: 'Reason',
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'processed' ? 'bg-green-100 text-green-800' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
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
          <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        {financeSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { 
                label: 'Platform Commission',
                value: `₹${Math.round(financeSummary.platformEarnings?.platformCommission || 0).toLocaleString()}`,
              },
              {
                label: 'Total Payouts',
                value: `₹${Math.round(financeSummary.totalPayouts || 0).toLocaleString()}`,
              },
              {
                label: 'Total Refunds',
                value: `₹${Math.round(financeSummary.totalRefunds || 0).toLocaleString()}`,
              },
              {
                label: 'Net Profit',
                value: `₹${Math.round(financeSummary.netProfit || 0).toLocaleString()}`,
              },
            ].map((card, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">{card.label}</p>
                <p className="text-3xl font-bold text-white mb-2">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Platform Earnings Details */}
        {platformEarnings && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Platform Earnings (Last 30 Days)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', value: platformEarnings.totalOrders },
                { label: 'Gross Revenue', value: `₹${Math.round(platformEarnings.totalGross).toLocaleString()}` },
                { label: 'Commission %', value: `${platformEarnings.commissionPercent}%` },
                { label: 'Avg Order Value', value: `₹${Math.round(platformEarnings.avgOrderValue).toLocaleString()}` },
              ].map((stat, idx) => (
                <div key={idx} className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payouts */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Vendor Payouts</h3>
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            {payouts.length > 0 ? (
              <DataTable columns={payoutColumns} data={payouts} rowKey="id" striped />
            ) : (
              <div className="p-8 text-center text-gray-400">No payouts found</div>
            )}
          </div>
        </div>

        {/* Refunds */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Refunds</h3>
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            {refunds.length > 0 ? (
              <DataTable columns={refundColumns} data={refunds} rowKey="id" striped />
            ) : (
              <div className="p-8 text-center text-gray-400">No refunds found</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
