import { createClient } from '@supabase/supabase-js'
import { logAdminActivity } from '../admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Get all products with filtering and moderation status
export async function getAllProducts(filters?: {
  status?: 'pending' | 'approved' | 'rejected'
  category?: string
  vendor?: string
  search?: string
  limit?: number
  offset?: number
}) {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('moderation_status', filters.status)
    }

    if (filters?.category) {
      query = query.eq('category_id', filters.category)
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

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const limit = filters?.limit || 50
    const offset = filters?.offset || 0

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      products: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[v0] Failed to get products:', error)
    return { products: [], total: 0 }
  }
}

// Get product details with vendor info
export async function getProductDetails(productId: string) {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        shop:shop_id (id, name, vendor_id, rating),
        category:category_id (id, name)
      `)
      .eq('id', productId)
      .single()

    if (error) throw error

    return product
  } catch (error) {
    console.error('[v0] Failed to get product details:', error)
    return null
  }
}

// Approve product
export async function approveProduct(
  adminId: string,
  productId: string,
  notes?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .update({
        moderation_status: 'approved',
        moderation_notes: notes,
        moderation_reviewed_by: adminId,
        moderation_reviewed_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'approve_product', 'products', productId, { notes })

    return true
  } catch (error) {
    console.error('[v0] Failed to approve product:', error)
    return false
  }
}

// Reject product
export async function rejectProduct(
  adminId: string,
  productId: string,
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .update({
        moderation_status: 'rejected',
        moderation_notes: reason,
        moderation_reviewed_by: adminId,
        moderation_reviewed_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'reject_product', 'products', productId, { reason })

    return true
  } catch (error) {
    console.error('[v0] Failed to reject product:', error)
    return false
  }
}

// Mark product as featured
export async function setProductFeatured(
  adminId: string,
  productId: string,
  featured: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_featured: featured })
      .eq('id', productId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, featured ? 'feature_product' : 'unfeature_product', 'products', productId)

    return true
  } catch (error) {
    console.error('[v0] Failed to set product featured:', error)
    return false
  }
}

// Get pending product reviews
export async function getPendingProductReviews(limit: number = 50, offset: number = 0) {
  try {
    const { data, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        shop:shop_id (name),
        product:product_id (name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      reviews: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[v0] Failed to get pending reviews:', error)
    return { reviews: [], total: 0 }
  }
}

// Approve review
export async function approveReview(adminId: string, reviewId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reviewId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'approve_review', 'reviews', reviewId)

    return true
  } catch (error) {
    console.error('[v0] Failed to approve review:', error)
    return false
  }
}

// Reject review
export async function rejectReview(
  adminId: string,
  reviewId: string,
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reviewId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'reject_review', 'reviews', reviewId, { reason })

    return true
  } catch (error) {
    console.error('[v0] Failed to reject review:', error)
    return false
  }
}

// Get category statistics
export async function getCategoryStatistics() {
  try {
    const { data: categories } = await supabase
      .from('categories')
      .select('id')

    const stats = await Promise.all(
      (categories || []).map(async (cat) => {
        const { count: products } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id)

        const { count: shops } = await supabase
          .from('shops')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id)

        return { categoryId: cat.id, products: products || 0, shops: shops || 0 }
      })
    )

    return stats
  } catch (error) {
    console.error('[v0] Failed to get category statistics:', error)
    return []
  }
}

// Handle product reports
export async function handleProductReport(
  adminId: string,
  reportId: string,
  action: 'remove_product' | 'warn_vendor' | 'dismiss',
  resolution?: string
): Promise<boolean> {
  try {
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError || !report) return false

    if (action === 'remove_product') {
      // Disable product
      await supabase
        .from('products')
        .update({ is_available: false })
        .eq('id', report.target_id)
    }

    // Update report status
    const { error } = await supabase
      .from('reports')
      .update({
        status: 'resolved',
        resolution,
        resolved_by: adminId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (error) throw error

    // Log activity
    await logAdminActivity(adminId, 'resolve_report', 'reports', reportId, { action, resolution })

    return true
  } catch (error) {
    console.error('[v0] Failed to handle report:', error)
    return false
  }
}
