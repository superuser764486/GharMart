import { supabase } from '@/lib/supabase'
import { logVendorActivity } from './shops'

export interface Promotion {
  id: string
  vendor_id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_value: number
  max_discount: number
  usage_limit: number
  used_count: number
  is_active: boolean
  start_date: string
  end_date: string
  created_at: string
}

export async function createPromotion(vendorId: string, promotion: Omit<Promotion, 'id' | 'vendor_id' | 'created_at' | 'used_count'>) {
  try {
    const { data, error } = await supabase
      .from('promotions_coupons')
      .insert({
        vendor_id: vendorId,
        ...promotion,
      })
      .select()
      .single()

    if (error) throw error

    await logVendorActivity(
      vendorId,
      'promotion_created',
      `New promotion created with code ${promotion.code}`,
      'promotion',
      data.id,
      null,
      { code: promotion.code, discount: promotion.discount_value }
    )

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error creating promotion:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getVendorPromotions(vendorId: string) {
  try {
    const { data, error } = await supabase
      .from('promotions_coupons')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Promotion[]
  } catch (error) {
    console.error('[v0] Error fetching promotions:', error)
    return []
  }
}

export async function updatePromotion(vendorId: string, promotionId: string, updates: Partial<Promotion>) {
  try {
    const { data, error } = await supabase
      .from('promotions_coupons')
      .update(updates)
      .eq('id', promotionId)
      .eq('vendor_id', vendorId)
      .select()
      .single()

    if (error) throw error

    await logVendorActivity(
      vendorId,
      'promotion_updated',
      `Promotion ${updates.code || 'updated'}`,
      'promotion',
      promotionId,
      null,
      updates
    )

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error updating promotion:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deletePromotion(vendorId: string, promotionId: string) {
  try {
    const { error } = await supabase
      .from('promotions_coupons')
      .delete()
      .eq('id', promotionId)
      .eq('vendor_id', vendorId)

    if (error) throw error

    await logVendorActivity(
      vendorId,
      'promotion_deleted',
      'Promotion deleted',
      'promotion',
      promotionId
    )

    return { success: true }
  } catch (error) {
    console.error('[v0] Error deleting promotion:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getPromotionStats(vendorId: string, promotionId: string) {
  try {
    const { data: promotion } = await supabase
      .from('promotions_coupons')
      .select('used_count, usage_limit')
      .eq('id', promotionId)
      .eq('vendor_id', vendorId)
      .single()

    if (!promotion) throw new Error('Promotion not found')

    return {
      totalUses: promotion.used_count || 0,
      totalLimit: promotion.usage_limit || 0,
      remainingUses: (promotion.usage_limit || 0) - (promotion.used_count || 0),
      usagePercentage: promotion.usage_limit ? ((promotion.used_count || 0) / promotion.usage_limit) * 100 : 0,
    }
  } catch (error) {
    console.error('[v0] Error fetching promotion stats:', error)
    return null
  }
}
