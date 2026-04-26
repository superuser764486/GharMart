import { supabase } from '@/lib/supabase'

export interface DailyStat {
  date: string
  total_orders: number
  total_revenue: number
  commission_amount: number
  payout_amount: number
  refund_amount: number
  returns_count: number
}

export interface VendorStats {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalRefunds: number
  pendingOrders: number
  completedOrders: number
  activeProducts: number
  totalCustomers: number
}

export async function getVendorStats(vendorId: string): Promise<VendorStats | null> {
  try {
    // Get total revenue and orders
    const { data: orderStats } = await supabase
      .from('orders')
      .select('total_amount, status')
      .eq('vendor_id', vendorId)

    const orders = orderStats || []
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const totalOrders = orders.length
    const completedOrders = orders.filter(o => o.status === 'delivered').length
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length

    // Get refund stats
    const { data: refundStats } = await supabase
      .from('return_requests')
      .select('refund_amount')
      .eq('vendor_id', vendorId)
      .eq('status', 'approved')

    const totalRefunds = (refundStats || []).reduce((sum, r) => sum + (r.refund_amount || 0), 0)

    // Get product count
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('is_active', true)

    // Get unique customer count
    const { count: customerCount } = await supabase
      .from('orders')
      .select('user_id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .distinct()

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalRefunds,
      pendingOrders,
      completedOrders,
      activeProducts: productCount || 0,
      totalCustomers: customerCount || 0,
    }
  } catch (error) {
    console.error('[v0] Error fetching vendor stats:', error)
    return null
  }
}

export async function getDailyStats(vendorId: string, days = 30): Promise<DailyStat[]> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('revenue_analytics')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error
    return (data || []) as DailyStat[]
  } catch (error) {
    console.error('[v0] Error fetching daily stats:', error)
    return []
  }
}

export async function getTopProducts(vendorId: string, limit = 5) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, price, stock, is_active')
      .eq('vendor_id', vendorId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Error fetching top products:', error)
    return []
  }
}

export async function getRevenueByCategory(vendorId: string) {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('products(category), quantity, price')
      .eq('vendor_id', vendorId)

    if (error) throw error

    // Group by category
    const categoryStats: { [key: string]: { revenue: number; orders: number } } = {}
    ;(data || []).forEach(item => {
      const category = item.products?.category || 'Other'
      if (!categoryStats[category]) {
        categoryStats[category] = { revenue: 0, orders: 0 }
      }
      categoryStats[category].revenue += (item.price || 0) * (item.quantity || 0)
      categoryStats[category].orders += item.quantity || 0
    })

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      ...stats,
    }))
  } catch (error) {
    console.error('[v0] Error fetching category revenue:', error)
    return []
  }
}

export async function getPayoutHistory(vendorId: string, limit = 12) {
  try {
    const { data, error } = await supabase
      .from('payout_logs')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Error fetching payout history:', error)
    return []
  }
}

export async function calculatePayoutDue(vendorId: string): Promise<number> {
  try {
    // Get total earnings from delivered orders
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('vendor_id', vendorId)
      .eq('status', 'delivered')

    const totalEarnings = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)

    // Get total payouts
    const { data: payouts } = await supabase
      .from('payout_logs')
      .select('amount')
      .eq('vendor_id', vendorId)

    const totalPayouts = (payouts || []).reduce((sum, p) => sum + (p.amount || 0), 0)

    // Calculate pending payout (with 5% commission)
    const payoutDue = totalEarnings * 0.95 - totalPayouts

    return Math.max(0, payoutDue)
  } catch (error) {
    console.error('[v0] Error calculating payout:', error)
    return 0
  }
}
