import { supabase } from '@/lib/supabase'

export interface ShopDetails {
  id: string
  name: string
  description: string
  category: string
  latitude: number
  longitude: number
  address: string
  is_active: boolean
  opening_hours: {
    [key: string]: { open: string; close: string; is_open: boolean }
  }
  delivery_time_minutes: number
  minimum_order_value: number
  commission_percentage: number
  avg_rating: number
  total_reviews: number
}

export async function getVendorShop(vendorId: string): Promise<ShopDetails | null> {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select(
        `
        id, name, description, category, latitude, longitude,
        address, is_active, opening_hours, delivery_time_minutes,
        minimum_order_value, commission_percentage, avg_rating, total_reviews
      `
      )
      .eq('vendor_id', vendorId)
      .single()

    if (error) throw error
    return data as ShopDetails
  } catch (error) {
    console.error('[v0] Error fetching vendor shop:', error)
    return null
  }
}

export async function updateShopDetails(vendorId: string, updates: Partial<ShopDetails>) {
  try {
    const { error } = await supabase
      .from('shops')
      .update(updates)
      .eq('vendor_id', vendorId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating shop:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function toggleShopStatus(vendorId: string, isActive: boolean) {
  try {
    const { error } = await supabase
      .from('shops')
      .update({ is_active: isActive })
      .eq('vendor_id', vendorId)

    if (error) throw error

    // Log activity
    await logVendorActivity(vendorId, 'shop_status_changed', `Shop status changed to ${isActive ? 'active' : 'inactive'}`, 'shop')

    return { success: true }
  } catch (error) {
    console.error('[v0] Error toggling shop status:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateOpeningHours(
  vendorId: string,
  openingHours: { [key: string]: { open: string; close: string; is_open: boolean } }
) {
  try {
    const { error } = await supabase
      .from('shops')
      .update({ opening_hours: openingHours })
      .eq('vendor_id', vendorId)

    if (error) throw error

    await logVendorActivity(vendorId, 'opening_hours_updated', 'Opening hours updated', 'shop')

    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating opening hours:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function logVendorActivity(
  vendorId: string,
  action: string,
  description: string,
  entityType: string,
  entityId?: string,
  oldValue?: any,
  newValue?: any
) {
  try {
    const { error } = await supabase.from('vendor_activity_logs').insert({
      vendor_id: vendorId,
      action,
      description,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
      created_at: new Date().toISOString(),
    })

    if (error) throw error
  } catch (error) {
    console.error('[v0] Error logging vendor activity:', error)
  }
}

export async function getVendorActivityLogs(vendorId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('vendor_activity_logs')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Error fetching activity logs:', error)
    return []
  }
}
