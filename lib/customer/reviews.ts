import { supabase } from '@/lib/supabase'

export interface Review {
  id: string
  user_id: string
  product_id: string
  shop_id: string
  order_id?: string
  rating: number
  title: string
  content: string
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
  user_name?: string
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const { data } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user:users(id, name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      shop_id: item.shop_id,
      order_id: item.order_id,
      rating: item.rating,
      title: item.title,
      content: item.content,
      is_verified_purchase: item.is_verified_purchase,
      helpful_count: item.helpful_count,
      created_at: item.created_at,
      user_name: item.user?.name,
    }))
  } catch (error) {
    console.error('[v0] Error fetching reviews:', error)
    return []
  }
}

export async function getShopReviews(shopId: string): Promise<Review[]> {
  try {
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(50)

    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      shop_id: item.shop_id,
      order_id: item.order_id,
      rating: item.rating,
      title: item.title,
      content: item.content,
      is_verified_purchase: item.is_verified_purchase,
      helpful_count: item.helpful_count,
      created_at: item.created_at,
    }))
  } catch (error) {
    console.error('[v0] Error fetching shop reviews:', error)
    return []
  }
}

export async function createReview(
  userId: string,
  productId: string,
  shopId: string,
  reviewData: Omit<Review, 'id' | 'user_id' | 'product_id' | 'shop_id' | 'created_at'>
) {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        user_id: userId,
        product_id: productId,
        shop_id: shopId,
        ...reviewData,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error creating review:', error)
    return { success: false, error }
  }
}

export async function updateReview(userId: string, reviewId: string, reviewData: Partial<Review>) {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .update(reviewData)
      .eq('id', reviewId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error updating review:', error)
    return { success: false, error }
  }
}

export async function deleteReview(userId: string, reviewId: string) {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('[v0] Error deleting review:', error)
    return { success: false, error }
  }
}
