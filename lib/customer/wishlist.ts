import { supabase } from '@/lib/supabase'

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  shop_id: string
  product_name?: string
  price?: number
  image_url?: string
  added_at: string
}

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  try {
    const { data } = await supabase
      .from('wishlists')
      .select(`
        *,
        product:products(id, name, price, image_url),
        shop:shops(id, name)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      shop_id: item.shop_id,
      product_name: item.product?.name,
      price: item.product?.price,
      image_url: item.product?.image_url,
      added_at: item.added_at,
    }))
  } catch (error) {
    console.error('[v0] Error fetching wishlist:', error)
    return []
  }
}

export async function addToWishlist(userId: string, productId: string, shopId: string) {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        product_id: productId,
        shop_id: shopId,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error adding to wishlist:', error)
    return { success: false, error }
  }
}

export async function removeFromWishlist(userId: string, productId: string) {
  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('[v0] Error removing from wishlist:', error)
    return { success: false, error }
  }
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    return !error && !!data
  } catch (error) {
    return false
  }
}
