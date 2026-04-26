import { createClient } from '@supabase/supabase-js'
import { logAdminActivity } from '../admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface AdminUser {
  id: string
  email: string
  phone: string
  name: string
  role: string
  is_active: boolean
  blocked: boolean
  created_at: string
  last_login: string | null
  total_orders: number
  total_spent: number
}

// Get all users with filtering
export async function getAllUsers(filters?: {
  role?: string
  status?: 'active' | 'blocked' | 'inactive'
  search?: string
  limit?: number
  offset?: number
}) {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.role && filters.role !== 'all') {
      query = query.eq('role', filters.role)
    }

    if (filters?.status === 'blocked') {
      query = query.eq('is_blocked', true)
    } else if (filters?.status === 'inactive') {
      query = query.eq('is_active', false)
    } else if (filters?.status === 'active') {
      query = query.eq('is_active', true).eq('is_blocked', false)
    }

    if (filters?.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`
      )
    }

    const limit = filters?.limit || 50
    const offset = filters?.offset || 0

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      users: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[v0] Failed to get users:', error)
    return { users: [], total: 0 }
  }
}

// Get user details with order history
export async function getUserDetails(userId: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) return null

    // Get user orders count and total spent
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total_amount')
      .eq('customer_id', userId)

    const totalOrders = orders?.length || 0
    const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    return {
      ...user,
      totalOrders,
      totalSpent,
    }
  } catch (error) {
    console.error('[v0] Failed to get user details:', error)
    return null
  }
}

// Block user
export async function blockUser(adminId: string, userId: string, reason?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_blocked: true,
        block_reason: reason,
        blocked_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'block_user', 'users', userId, { reason })

    return true
  } catch (error) {
    console.error('[v0] Failed to block user:', error)
    return false
  }
}

// Unblock user
export async function unblockUser(adminId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_blocked: false,
        block_reason: null,
        blocked_at: null,
      })
      .eq('id', userId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'unblock_user', 'users', userId)

    return true
  } catch (error) {
    console.error('[v0] Failed to unblock user:', error)
    return false
  }
}

// Soft delete user
export async function deleteUser(adminId: string, userId: string, reason?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_deleted: true,
        is_active: false,
        deletion_reason: reason,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'delete_user', 'users', userId, { reason })

    return true
  } catch (error) {
    console.error('[v0] Failed to delete user:', error)
    return false
  }
}

// Get user activity logs
export async function getUserActivityLogs(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('[v0] Failed to get user activity:', error)
    return []
  }
}

// Update user info (admin only)
export async function updateUserInfo(
  adminId: string,
  userId: string,
  updates: { email?: string; phone?: string; full_name?: string }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'update_user_info', 'users', userId, updates)

    return true
  } catch (error) {
    console.error('[v0] Failed to update user info:', error)
    return false
  }
}

// Get user statistics
export async function getUserStatistics() {
  try {
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, created_at, is_blocked, is_active')

    if (usersError) throw usersError

    const totalUsers = allUsers?.length || 0
    const activeUsers = allUsers?.filter(u => u.is_active && !u.is_blocked).length || 0
    const blockedUsers = allUsers?.filter(u => u.is_blocked).length || 0

    // Calculate new users this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const newUsersThisMonth = allUsers?.filter(u => new Date(u.created_at) >= thisMonth).length || 0

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      newUsersThisMonth,
      inactiveUsers: totalUsers - activeUsers - blockedUsers,
    }
  } catch (error) {
    console.error('[v0] Failed to get user statistics:', error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      blockedUsers: 0,
      newUsersThisMonth: 0,
      inactiveUsers: 0,
    }
  }
}
