import { supabase } from '@/lib/supabase'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  total_orders: number
  total_spent: number
  last_order_date?: string
  rating?: number
}

export async function getVendorCustomers(vendorId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id, name, email, phone,
        orders!orders_user_id_fkey(
          id, total_amount, created_at
        )
      `
      )
      .eq('role', 'customer')
      .limit(limit)

    if (error) throw error

    return (data || []).map(customer => {
      const orders = customer.orders || []
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        total_orders: orders.length,
        total_spent: orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
        last_order_date: orders[orders.length - 1]?.created_at,
      }
    })
  } catch (error) {
    console.error('[v0] Error fetching customers:', error)
    return []
  }
}

export async function getCustomerDetails(vendorId: string, customerId: string) {
  try {
    const { data: customer } = await supabase
      .from('users')
      .select('*')
      .eq('id', customerId)
      .single()

    if (!customer) throw new Error('Customer not found')

    // Get customer orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', customerId)
      .eq('vendor_id', vendorId)

    // Get reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', customerId)

    return {
      ...customer,
      orders: orders || [],
      reviews: reviews || [],
      totalSpent: (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0),
    }
  } catch (error) {
    console.error('[v0] Error fetching customer details:', error)
    return null
  }
}

export async function getTopCustomers(vendorId: string, limit = 10) {
  try {
    const customers = await getVendorCustomers(vendorId, 1000)
    
    return customers
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, limit)
  } catch (error) {
    console.error('[v0] Error fetching top customers:', error)
    return []
  }
}

export async function getCustomerSegmentation(vendorId: string) {
  try {
    const customers = await getVendorCustomers(vendorId, 1000)

    const segments = {
      vip: customers.filter(c => c.total_spent > 10000).length,
      regular: customers.filter(c => c.total_spent >= 1000 && c.total_spent <= 10000).length,
      occasional: customers.filter(c => c.total_spent < 1000 && c.total_orders > 0).length,
      inactive: customers.filter(c => c.total_orders === 0).length,
    }

    return segments
  } catch (error) {
    console.error('[v0] Error getting customer segments:', error)
    return { vip: 0, regular: 0, occasional: 0, inactive: 0 }
  }
}

export async function getCustomerRetention(vendorId: string, days = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('user_id')
      .eq('vendor_id', vendorId)
      .gte('created_at', startDate.toISOString())

    const { data: allTimeOrders } = await supabase
      .from('orders')
      .select('user_id')
      .eq('vendor_id', vendorId)

    const recentCustomers = new Set((recentOrders || []).map(o => o.user_id))
    const allCustomers = new Set((allTimeOrders || []).map(o => o.user_id))

    const repeatedCustomers = [...recentCustomers].filter(id => {
      const { count } = supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
        .eq('user_id', id)
      return count && count > 1
    }).length

    return {
      newCustomers: recentCustomers.size - repeatedCustomers,
      repeatedCustomers,
      retentionRate: allCustomers.size > 0 ? (repeatedCustomers / allCustomers.size) * 100 : 0,
    }
  } catch (error) {
    console.error('[v0] Error calculating retention:', error)
    return { newCustomers: 0, repeatedCustomers: 0, retentionRate: 0 }
  }
}
