import { createClient } from '@supabase/supabase-js'
import { logAdminActivity, getPlatformSetting } from '../admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Get platform earnings summary
export async function getPlatformEarnings(dateFrom?: string, dateTo?: string) {
  try {
    let query = supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('status', 'delivered')

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data: orders } = await query

    if (!orders) return null

    const commissionPercent = await getPlatformSetting('platform_commission_percent') || 10
    const totalGross = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const platformCommission = (totalGross * commissionPercent) / 100

    return {
      totalGross,
      totalOrders: orders.length,
      platformCommission,
      commissionPercent,
      avgOrderValue: Math.round((totalGross / orders.length) * 100) / 100,
    }
  } catch (error) {
    console.error('[v0] Failed to get platform earnings:', error)
    return null
  }
}

// Get vendor earnings
export async function getVendorEarnings(vendorId: string, dateFrom?: string, dateTo?: string) {
  try {
    // Get vendor's shop
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('vendor_id', vendorId)
      .single()

    if (!shop) return null

    // Get orders
    let query = supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('shop_id', shop.id)
      .eq('status', 'delivered')

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data: orders } = await query

    if (!orders) return null

    const commissionPercent = await getPlatformSetting('platform_commission_percent') || 10
    const totalGross = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const platformCommission = (totalGross * commissionPercent) / 100
    const vendorEarnings = totalGross - platformCommission

    return {
      totalGross,
      totalOrders: orders.length,
      platformCommission,
      vendorEarnings,
      commissionPercent,
      avgOrderValue: Math.round((totalGross / orders.length) * 100) / 100,
    }
  } catch (error) {
    console.error('[v0] Failed to get vendor earnings:', error)
    return null
  }
}

// Get payout logs
export async function getPayoutLogs(filters?: {
  vendor?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}) {
  try {
    let query = supabase
      .from('payout_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.vendor) {
      query = query.eq('vendor_id', filters.vendor)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const limit = filters?.limit || 50
    const offset = filters?.offset || 0

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      payouts: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[v0] Failed to get payout logs:', error)
    return { payouts: [], total: 0 }
  }
}

// Create payout for vendor
export async function createVendorPayout(
  adminId: string,
  vendorId: string,
  amount: number,
  bankAccountId: string,
  period?: { start: string; end: string }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('payout_logs')
      .insert({
        vendor_id: vendorId,
        period_start: period?.start || new Date(new Date().setDate(1)).toISOString().split('T')[0],
        period_end: period?.end || new Date().toISOString().split('T')[0],
        net_amount: amount,
        payout_method: 'bank_transfer',
        bank_account_id: bankAccountId,
        status: 'pending',
      })

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'create_payout', 'payout_logs', vendorId, { amount })

    return true
  } catch (error) {
    console.error('[v0] Failed to create payout:', error)
    return false
  }
}

// Process payout
export async function processPayout(
  adminId: string,
  payoutId: string,
  transactionId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('payout_logs')
      .update({
        status: 'processed',
        transaction_id: transactionId,
        processed_at: new Date().toISOString(),
      })
      .eq('id', payoutId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'process_payout', 'payout_logs', payoutId, { transactionId })

    return true
  } catch (error) {
    console.error('[v0] Failed to process payout:', error)
    return false
  }
}

// Get refund logs
export async function getRefundLogs(filters?: {
  status?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}) {
  try {
    let query = supabase
      .from('refunds')
      .select(`
        *,
        order:order_id (id, order_number, total_amount)
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const limit = filters?.limit || 50
    const offset = filters?.offset || 0

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      refunds: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[v0] Failed to get refund logs:', error)
    return { refunds: [], total: 0 }
  }
}

// Get finance summary
export async function getFinanceSummary() {
  try {
    // Get data from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const fromDate = thirtyDaysAgo.toISOString()

    const platformEarnings = await getPlatformEarnings(fromDate)
    const { payouts } = await getPayoutLogs({ dateFrom: fromDate, limit: 1000, offset: 0 })
    const { refunds } = await getRefundLogs({ dateFrom: fromDate, limit: 1000, offset: 0 })

    const totalPayouts = payouts?.reduce((sum, p) => sum + p.net_amount, 0) || 0
    const totalRefunds = refunds?.reduce((sum, r) => sum + r.amount, 0) || 0

    return {
      platformEarnings,
      totalPayouts,
      totalRefunds,
      netProfit: (platformEarnings?.platformCommission || 0) - totalPayouts - totalRefunds,
    }
  } catch (error) {
    console.error('[v0] Failed to get finance summary:', error)
    return null
  }
}

// Export financial data
export async function exportFinancialData(
  dateFrom: string,
  dateTo: string,
  format: 'csv' | 'json' = 'csv'
) {
  try {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)

    const { data: payouts } = await supabase
      .from('payout_logs')
      .select('*')
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)

    const { data: refunds } = await supabase
      .from('refunds')
      .select('*')
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)

    const data = {
      orders: orders || [],
      payouts: payouts || [],
      refunds: refunds || [],
      exportDate: new Date().toISOString(),
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else {
      // Generate CSV
      const lines: string[] = []
      
      // Orders section
      lines.push('ORDERS')
      lines.push('id,shop_id,customer_id,total_amount,status,created_at')
      orders?.forEach(order => {
        lines.push(`${order.id},${order.shop_id},${order.customer_id},${order.total_amount},${order.status},${order.created_at}`)
      })
      
      lines.push('')
      lines.push('PAYOUTS')
      lines.push('id,vendor_id,period_start,period_end,net_amount,status,created_at')
      payouts?.forEach(payout => {
        lines.push(`${payout.id},${payout.vendor_id},${payout.period_start},${payout.period_end},${payout.net_amount},${payout.status},${payout.created_at}`)
      })
      
      lines.push('')
      lines.push('REFUNDS')
      lines.push('id,order_id,amount,reason,status,created_at')
      refunds?.forEach(refund => {
        lines.push(`${refund.id},${refund.order_id},${refund.amount},${refund.reason},${refund.status},${refund.created_at}`)
      })

      return lines.join('\n')
    }
  } catch (error) {
    console.error('[v0] Failed to export financial data:', error)
    return null
  }
}
