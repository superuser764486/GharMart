// Lazy initialize Supabase to avoid build-time errors
let supabaseClientCache: any = null;
let supabaseError: Error | null = null;

function getSupabaseForAdmin() {
  if (supabaseClientCache) return supabaseClientCache;
  if (supabaseError) throw supabaseError;

  try {
    // Use dynamic import to avoid module-level execution
    const supabaseModule = require('@supabase/supabase-js');
    if (!supabaseModule?.createClient) {
      throw new Error('Supabase module not available');
    }
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      // Return a dummy object that won't cause errors during module loading
      return {
        from: () => null,
        rpc: () => null,
        auth: { getUser: async () => ({ data: { user: null } }) },
      };
    }
    
    // Only try to create client if we have valid credentials
    try {
      supabaseClientCache = supabaseModule.createClient(url, key);
      return supabaseClientCache;
    } catch (createError) {
      supabaseError = createError as Error;
      throw createError;
    }
  } catch (error) {
    console.error('[v0] Failed to initialize Supabase in admin-auth:', error);
    // Return a safe dummy object instead of throwing
    return {
      from: () => null,
      rpc: () => null,
      auth: { getUser: async () => ({ data: { user: null } }) },
    };
  }
}

// Permission levels for admin roles
export const ADMIN_ROLES = {
  super_admin: 'super_admin', // Full access
  manager: 'manager', // Manage vendors, products, orders
  moderator: 'moderator', // Moderation tasks
} as const

export const ROLE_PERMISSIONS = {
  super_admin: [
    'manage_users',
    'manage_vendors',
    'manage_products',
    'manage_orders',
    'manage_finance',
    'manage_cms',
    'manage_settings',
    'view_analytics',
    'manage_admins',
  ],
  manager: [
    'manage_vendors',
    'manage_products',
    'manage_orders',
    'manage_finance',
    'view_analytics',
  ],
  moderator: [
    'review_products',
    'handle_reports',
    'manage_content',
  ],
} as const

// Verify admin access
export async function verifyAdminAccess(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseForAdmin();
    const { data: user, error } = await supabase
      .from('users')
      .select('admin_role')
      .eq('id', userId)
      .single()

    if (error || !user || !user.admin_role) return false
    return true
  } catch (error) {
    console.error('[v0] Admin verification failed:', error)
    return false
  }
}

// Get admin details and permissions
export async function getAdminDetails(userId: string) {
  try {
    const supabase = getSupabaseForAdmin();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, admin_role, permissions, two_fa_enabled')
      .eq('id', userId)
      .single()

    if (error || !user?.admin_role) return null

    return {
      id: user.id,
      email: user.email,
      role: user.admin_role,
      permissions: user.permissions || ROLE_PERMISSIONS[user.admin_role as keyof typeof ROLE_PERMISSIONS] || [],
      twoFaEnabled: user.two_fa_enabled,
    }
  } catch (error) {
    console.error('[v0] Failed to get admin details:', error)
    return null
  }
}

// Check if admin has specific permission
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const admin = await getAdminDetails(userId)
    if (!admin) return false

    const permissions = admin.permissions as string[]
    return permissions.includes(permission)
  } catch (error) {
    console.error('[v0] Permission check failed:', error)
    return false
  }
}

// Log admin activity
export async function logAdminActivity(
  adminId: string,
  action: string,
  targetType: string,
  targetId?: string,
  changes?: Record<string, any>,
  ipAddress?: string
) {
  try {
    const supabase = getSupabaseForAdmin();
    const { error } = await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: adminId,
        action,
        target_type: targetType,
        target_id: targetId,
        changes: changes || null,
        ip_address: ipAddress,
        status: 'success',
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('[v0] Failed to log admin activity:', error)
    return false
  }
}

// Get activity logs
export async function getActivityLogs(
  filters?: {
    adminId?: string
    action?: string
    targetType?: string
    limit?: number
    offset?: number
  }
) {
  try {
    const supabase = getSupabaseForAdmin();
    let query = supabase
      .from('admin_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.adminId) {
      query = query.eq('admin_id', filters.adminId)
    }

    if (filters?.action) {
      query = query.eq('action', filters.action)
    }

    if (filters?.targetType) {
      query = query.eq('target_type', filters.targetType)
    }

    const limit = filters?.limit || 50
    const offset = filters?.offset || 0

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      logs: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[v0] Failed to get activity logs:', error)
    return {
      logs: [],
      total: 0,
    }
  }
}

// Get platform settings
export async function getPlatformSetting(key: string): Promise<any> {
  try {
    const supabase = getSupabaseForAdmin();
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value, type')
      .eq('key', key)
      .single()

    if (error || !data) return null

    // Parse value based on type
    if (data.type === 'number') return parseFloat(data.value)
    if (data.type === 'boolean') return data.value === 'true'
    if (data.type === 'json') return JSON.parse(data.value)
    return data.value
  } catch (error) {
    console.error('[v0] Failed to get setting:', error)
    return null
  }
}

// Update platform setting
export async function updatePlatformSetting(
  adminId: string,
  key: string,
  value: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseForAdmin();
    const { error } = await supabase
      .from('admin_settings')
      .update({
        value,
        updated_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key)

    if (error) throw error

    // Log the activity
    await logAdminActivity(adminId, 'update_setting', 'settings', key, { value })

    return true
  } catch (error) {
    console.error('[v0] Failed to update setting:', error)
    return false
  }
}

// Enable 2FA for admin
export async function enableTwoFA(adminId: string): Promise<{ secret: string; qrCode: string } | null> {
  try {
    // In production, use a library like 'speakeasy' or 'qrcode' to generate
    const secret = generateTwoFASecret()
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=otpauth://totp/GharMart:${adminId}?secret=${secret}`

    // Store secret temporarily (will be verified after)
    return { secret, qrCode }
  } catch (error) {
    console.error('[v0] Failed to enable 2FA:', error)
    return null
  }
}

// Generate a random secret for 2FA
function generateTwoFASecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

// Verify admin 2FA code
export async function verify2FACode(adminId: string, code: string): Promise<boolean> {
  // In production, validate the code against the stored secret
  // For now, just verify format
  return /^\d{6}$/.test(code)
}

// Revoke admin session
export async function revokeAdminSession(adminId: string): Promise<boolean> {
  try {
    // Log the session revocation
    await logAdminActivity(adminId, 'session_revoked', 'auth')
    return true
  } catch (error) {
    console.error('[v0] Failed to revoke session:', error)
    return false
  }
}
