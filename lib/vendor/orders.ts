import { supabase } from '@/lib/supabase'
import { logVendorActivity } from './shops'

export interface VendorOrder {
  id: string
  order_id: string
  user_id: string
  status: string
  total_amount: number
  commission_amount: number
  payout_amount: number
  items_count: number
  created_at: string
  updated_at: string
  delivery_date?: string
  customer_email?: string
  customer_phone?: string
}

export async function getVendorOrders(vendorId: string, filters: any = {}) {
  try {
    let query = supabase
      .from('orders')
      .select(
        `
        id, user_id, status, total_amount, created_at, updated_at,
        delivery_date, users!orders_user_id_fkey(email, phone),
        order_items(count)
      `
      )
      .eq('vendor_id', vendorId)

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(100)

    if (error) throw error
    return data as any[]
  } catch (error) {
    console.error('[v0] Error fetching vendor orders:', error)
    return []
  }
}

export async function updateOrderStatus(vendorId: string, orderId: string, newStatus: string) {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .eq('vendor_id', vendorId)
      .single()

    if (!order) throw new Error('Order not found')

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .eq('vendor_id', vendorId)

    if (error) throw error

    await logVendorActivity(
      vendorId,
      'order_status_changed',
      `Order status changed from ${order.status} to ${newStatus}`,
      'order',
      orderId,
      { status: order.status },
      { status: newStatus }
    )

    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating order status:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getOrderDetails(vendorId: string, orderId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        id, user_id, status, total_amount, delivery_address, created_at,
        users!orders_user_id_fkey(email, phone, name),
        order_items(product_id, quantity, price, products(name, description))
      `
      )
      .eq('id', orderId)
      .eq('vendor_id', vendorId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Error fetching order details:', error)
    return null
  }
}

export async function createReturnRequest(
  vendorId: string,
  orderItemId: string,
  reason: string,
  description: string
) {
  try {
    const { data, error } = await supabase
      .from('return_requests')
      .insert({
        vendor_id: vendorId,
        order_item_id: orderItemId,
        reason,
        description,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    await logVendorActivity(
      vendorId,
      'return_requested',
      `Return request created: ${reason}`,
      'return',
      data.id
    )

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error creating return request:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getReturnRequests(vendorId: string, status?: string) {
  try {
    let query = supabase
      .from('return_requests')
      .select('*')
      .eq('vendor_id', vendorId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Error fetching return requests:', error)
    return []
  }
}

export async function approveReturn(vendorId: string, returnId: string, refundAmount: number) {
  try {
    const { error } = await supabase
      .from('return_requests')
      .update({
        status: 'approved',
        refund_amount: refundAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', returnId)
      .eq('vendor_id', vendorId)

    if (error) throw error

    await logVendorActivity(
      vendorId,
      'return_approved',
      `Return approved with refund ₹${refundAmount}`,
      'return',
      returnId
    )

    return { success: true }
  } catch (error) {
    console.error('[v0] Error approving return:', error)
    return { success: false, error: (error as Error).message }
  }
}
