import { createClient } from '@supabase/supabase-js'
import { logAdminActivity } from '../admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Get pending vendor requests
export async function getPendingVendorRequests(limit: number = 50, offset: number = 0) {
  try {
    const { data, error, count } = await supabase
      .from('vendor_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      requests: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[v0] Failed to get pending vendor requests:', error)
    return { requests: [], total: 0 }
  }
}

// Get vendor request details
export async function getVendorRequestDetails(requestId: string) {
  try {
    const { data, error } = await supabase
      .from('vendor_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Failed to get vendor request details:', error)
    return null
  }
}

// Approve vendor request
export async function approveVendorRequest(
  adminId: string,
  requestId: string,
  notes?: string
): Promise<boolean> {
  try {
    const request = await getVendorRequestDetails(requestId)
    if (!request) throw new Error('Request not found')

    // Create vendor user account
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: request.email,
        phone: request.phone,
        full_name: request.shop_name,
        role: 'vendor',
        is_active: true,
      })
      .select()
      .single()

    if (userError) throw userError

    // Create shop for vendor
    const { error: shopError } = await supabase
      .from('shops')
      .insert({
        vendor_id: user.id,
        name: request.shop_name,
        category_id: request.category_id,
        address: request.address,
        city: request.city,
        state: request.state,
        pincode: request.pincode,
        is_approved: true,
        is_active: true,
        rating: 5,
      })

    if (shopError) throw shopError

    // Update vendor request status
    const { error: updateError } = await supabase
      .from('vendor_requests')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (updateError) throw updateError

    // Log activity
    await logAdminActivity(adminId, 'approve_vendor', 'vendor_requests', requestId, {
      vendorEmail: request.email,
      notes,
    })

    return true
  } catch (error) {
    console.error('[v0] Failed to approve vendor request:', error)
    return false
  }
}

// Reject vendor request
export async function rejectVendorRequest(
  adminId: string,
  requestId: string,
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('vendor_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'reject_vendor', 'vendor_requests', requestId, { reason })

    return true
  } catch (error) {
    console.error('[v0] Failed to reject vendor request:', error)
    return false
  }
}

// Get all vendors with statistics
export async function getAllVendors(filters?: {
  status?: 'active' | 'suspended' | 'pending'
  search?: string
  limit?: number
  offset?: number
}) {
  try {
    let query = supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .eq('role', 'vendor')
      .order('created_at', { ascending: false })

    if (filters?.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`
      )
    }

    const limit = filters?.limit || 50
    const offset = filters?.offset || 0

    const { data: vendors, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get shop details for each vendor
    const vendorsWithDetails = await Promise.all(
      (vendors || []).map(async (vendor) => {
        const { data: shop } = await supabase
          .from('shops')
          .select('id, name, is_active, is_suspended, rating')
          .eq('vendor_id', vendor.id)
          .single()

        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('shop_id', shop?.id)

        return {
          ...vendor,
          shop: shop || null,
          totalOrders: orders?.length || 0,
          totalRevenue: orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        }
      })
    )

    return {
      vendors: vendorsWithDetails,
      total: count || 0,
    }
  } catch (error) {
    console.error('[v0] Failed to get vendors:', error)
    return { vendors: [], total: 0 }
  }
}

// Suspend vendor
export async function suspendVendor(adminId: string, vendorId: string, reason: string): Promise<boolean> {
  try {
    // Update user status
    const { error: userError } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', vendorId)

    if (userError) throw userError

    // Suspend all vendor's shops
    const { error: shopError } = await supabase
      .from('shops')
      .update({ is_suspended: true })
      .eq('vendor_id', vendorId)

    if (shopError) throw shopError

    // Log activity
    await logAdminActivity(adminId, 'suspend_vendor', 'users', vendorId, { reason })

    return true
  } catch (error) {
    console.error('[v0] Failed to suspend vendor:', error)
    return false
  }
}

// Activate vendor
export async function activateVendor(adminId: string, vendorId: string): Promise<boolean> {
  try {
    // Update user status
    const { error: userError } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', vendorId)

    if (userError) throw userError

    // Activate vendor's shops
    const { error: shopError } = await supabase
      .from('shops')
      .update({ is_suspended: false })
      .eq('vendor_id', vendorId)

    if (shopError) throw shopError

    // Log activity
    await logAdminActivity(adminId, 'activate_vendor', 'users', vendorId)

    return true
  } catch (error) {
    console.error('[v0] Failed to activate vendor:', error)
    return false
  }
}

// Get vendor performance metrics
export async function getVendorMetrics(vendorId: string) {
  try {
    // Get shop
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('vendor_id', vendorId)
      .single()

    if (!shop) return null

    // Get orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('shop_id', shop.id)

    // Get reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('shop_id', shop.id)

    const totalOrders = orders?.length || 0
    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    // Orders this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    const ordersThisMonth = orders?.filter(o => new Date(o.created_at) >= thisMonth).length || 0

    return {
      totalOrders,
      totalRevenue,
      avgRating,
      ordersThisMonth,
      completionRate: totalOrders > 0 
        ? Math.round(((orders?.filter(o => o.status === 'delivered').length || 0) / totalOrders) * 100)
        : 0,
    }
  } catch (error) {
    console.error('[v0] Failed to get vendor metrics:', error)
    return null
  }
}

// Get vendor statistics
export async function getVendorStatistics() {
  try {
    const { data: vendors } = await supabase
      .from('users')
      .select('id, is_active, created_at')
      .eq('role', 'vendor')

    const totalVendors = vendors?.length || 0
    const activeVendors = vendors?.filter(v => v.is_active).length || 0

    // Get active shops
    const { data: shops } = await supabase
      .from('shops')
      .select('id, is_suspended')

    const activeShops = shops?.filter(s => !s.is_suspended).length || 0

    // Get suspended count
    const suspendedVendors = vendors?.filter(v => !v.is_active).length || 0

    return {
      totalVendors,
      activeVendors,
      suspendedVendors,
      activeShops,
    }
  } catch (error) {
    console.error('[v0] Failed to get vendor statistics:', error)
    return {
      totalVendors: 0,
      activeVendors: 0,
      suspendedVendors: 0,
      activeShops: 0,
    }
  }
}
