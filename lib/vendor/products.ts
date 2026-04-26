import { supabase } from '@/lib/supabase'
import { logVendorActivity } from './shops'

export interface VendorProduct {
  id: string
  name: string
  description: string
  category: string
  price: number
  stock: number
  sku: string
  image_url: string
  is_active: boolean
  moderation_status: string
  created_at: string
  updated_at: string
}

export async function getVendorProducts(vendorId: string, filters: any = {}) {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.status) {
      query = query.eq('moderation_status', filters.status)
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data as VendorProduct[]
  } catch (error) {
    console.error('[v0] Error fetching vendor products:', error)
    return []
  }
}

export async function createProduct(
  vendorId: string,
  product: Omit<VendorProduct, 'id' | 'vendor_id' | 'created_at' | 'updated_at' | 'moderation_status'>
) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        vendor_id: vendorId,
        ...product,
        moderation_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    await logVendorActivity(
      vendorId,
      'product_created',
      `Product created: ${product.name}`,
      'product',
      data.id,
      null,
      { name: product.name, price: product.price }
    )

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error creating product:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateProduct(vendorId: string, productId: string, updates: Partial<VendorProduct>) {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('vendor_id', vendorId)
      .single()

    if (!product) throw new Error('Product not found')

    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .eq('vendor_id', vendorId)
      .select()
      .single()

    if (error) throw error

    await logVendorActivity(
      vendorId,
      'product_updated',
      `Product updated: ${updates.name || product.name}`,
      'product',
      productId,
      { price: product.price, stock: product.stock },
      { price: updates.price, stock: updates.stock }
    )

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error updating product:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteProduct(vendorId: string, productId: string) {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .eq('vendor_id', vendorId)
      .single()

    if (!product) throw new Error('Product not found')

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('vendor_id', vendorId)

    if (error) throw error

    await logVendorActivity(
      vendorId,
      'product_deleted',
      `Product deleted: ${product.name}`,
      'product',
      productId
    )

    return { success: true }
  } catch (error) {
    console.error('[v0] Error deleting product:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateProductStock(vendorId: string, productId: string, newStock: number) {
  try {
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)
      .eq('vendor_id', vendorId)

    if (error) throw error

    await logVendorActivity(
      vendorId,
      'stock_updated',
      `Stock updated to ${newStock}`,
      'product',
      productId
    )

    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating stock:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getProductAnalytics(vendorId: string, productId: string) {
  try {
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('quantity, price, created_at')
      .eq('product_id', productId)

    if (!orderItems) return null

    const totalSold = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)

    return {
      totalSold,
      totalRevenue,
      averagePrice: orderItems.length > 0 ? totalRevenue / totalSold : 0,
      lastSold: orderItems[orderItems.length - 1]?.created_at || null,
    }
  } catch (error) {
    console.error('[v0] Error fetching product analytics:', error)
    return null
  }
}

export async function getBulkProductStats(vendorId: string) {
  try {
    const products = await getVendorProducts(vendorId)
    
    const stats = {
      total: products.length,
      active: products.filter(p => p.is_active).length,
      inactive: products.filter(p => !p.is_active).length,
      pendingApproval: products.filter(p => p.moderation_status === 'pending').length,
      lowStock: products.filter(p => p.stock < 5).length,
      outOfStock: products.filter(p => p.stock === 0).length,
    }

    return stats
  } catch (error) {
    console.error('[v0] Error getting product stats:', error)
    return null
  }
}
