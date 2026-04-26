import { createClient } from '@supabase/supabase-js'
import { logAdminActivity } from '../admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Get all orders with advanced filtering
export async function getAllOrders(filters?: {
  status?: string
  paymentStatus?: string
  vendor?: string
  customer?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  limit?: number
  offset?: number
}) {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus)
    }

    if (filters?.vendor) {
      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('vendor_id', filters.vendor)
        .single()

      if (shop) {
        query = query.eq('shop_id', shop.id)
      }
    }

    if (filters?.customer) {
      query = query.eq('customer_id', filters.customer)
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    if (filters?.minAmount) {
      query = query.gte('total_amount', filters.minAmount)
    }

    if (filters?.maxAmount) {
      query = query.lte('total_amount', filters.maxAmount)
    }

    const limit = filters?.limit || 50
    const offset = filters?.offset || 0

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      orders: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[v0] Failed to get orders:', error)
    return { orders: [], total: 0 }
  }
}

// Get order details with items
export async function getOrderDetails(orderId: string) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customer_id (id, email, phone, full_name),
        shop:shop_id (id, name, vendor_id),
        items:order_items (id, product_id, quantity, price)
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error

    return order
  } catch (error) {
    console.error('[v0] Failed to get order details:', error)
    return null
  }
}

// Update order status
export async function updateOrderStatus(
  adminId: string,
  orderId: string,
  status: string,
  notes?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'update_order_status', 'orders', orderId, { status, notes })

    return true
  } catch (error) {
    console.error('[v0] Failed to update order status:', error)
    return false
  }
}

// Create refund for order
export async function createRefund(
  adminId: string,
  orderId: string,
  reason: string,
  amount?: number
): Promise<boolean> {
  try {
    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('id', orderId)
      .single()

    if (!order) return false

    // Create refund
    const { error } = await supabase
      .from('refunds')
      .insert({
        order_id: orderId,
        reason,
        amount: amount || order.total_amount,
        status: 'pending',
      })

    if (error) throw error

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'refund_requested' })
      .eq('id', orderId)

    // Log activity
    await logAdminActivity(adminId, 'create_refund', 'refunds', orderId, { reason, amount })

    return true
  } catch (error) {
    console.error('[v0] Failed to create refund:', error)
    return false
  }
}

// Process refund
export async function processRefund(
  adminId: string,
  refundId: string,
  notes?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('refunds')
      .update({
        status: 'processed',
        approval_notes: notes,
        processed_by: adminId,
        processed_at: new Date().toISOString(),
      })
      .eq('id', refundId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'process_refund', 'refunds', refundId, { notes })

    return true
  } catch (error) {
    console.error('[v0] Failed to process refund:', error)
    return false
  }
}

// Cancel order
export async function cancelOrder(
  adminId: string,
  orderId: string,
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_by_admin: true,
      })
      .eq('id', orderId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'cancel_order', 'orders', orderId, { reason })

    return true
  } catch (error) {
    console.error('[v0] Failed to cancel order:', error)
    return false
  }
}

// Get order statistics
export async function getOrderStatistics(dateFrom?: string, dateTo?: string) {
  try {
    let query = supabase.from('orders').select('id, status, total_amount, created_at')

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data: orders } = await query

    if (!orders) return null

    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const statuses = {
      pending: 0,
      confirmed: 0,
      delivered: 0,
      cancelled: 0,
      refund_requested: 0,
    }

    orders.forEach(order => {
      if (order.status in statuses) {
        statuses[order.status as keyof typeof statuses]++
      }
    })

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      ...statuses,
    }
  } catch (error) {
    console.error('[v0] Failed to get order statistics:', error)
    return null
  }
}

// Get pending refunds
export async function getPendingRefunds(limit: number = 50, offset: number = 0) {
  try {
    const { data, error, count } = await supabase
      .from('refunds')
      .select(`
        *,
        order:order_id (id, order_number, customer_id, total_amount)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      refunds: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[v0] Failed to get pending refunds:', error)
    return { refunds: [], total: 0 }
  }
}

// Bulk update orders
export async function bulkUpdateOrders(
  adminId: string,
  orderIds: string[],
  updates: { status?: string; notes?: string }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .in('id', orderIds)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'bulk_update_orders', 'orders', undefined, { count: orderIds.length, updates })

    return true
  } catch (error) {
    console.error('[v0] Failed to bulk update orders:', error)
    return false
  }
}
