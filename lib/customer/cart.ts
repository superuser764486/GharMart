import { supabase } from '@/lib/supabase'

export interface CartItem {
  id: string
  user_id: string
  shop_id: string
  product_id: string
  product_name: string
  price: number
  quantity: number
  image_url?: string
  added_at: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  delivery: number
  total: number
  itemCount: number
}

export async function getCart(userId: string): Promise<Cart> {
  try {
    const { data: cartItems } = await supabase
      .from('shopping_cart')
      .select(`
        *,
        product:products(id, name, price, image_url),
        shop:shops(id, name, delivery_fee)
      `)
      .eq('user_id', userId)

    if (!cartItems) {
      return { items: [], subtotal: 0, tax: 0, delivery: 0, total: 0, itemCount: 0 }
    }

    const formatted = cartItems.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      shop_id: item.shop_id,
      product_id: item.product_id,
      product_name: item.product?.name || 'Product',
      price: item.product?.price || 0,
      quantity: item.quantity,
      image_url: item.product?.image_url,
      added_at: item.added_at,
    }))

    const subtotal = formatted.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = Math.round(subtotal * 0.05 * 100) / 100 // 5% tax
    const delivery = formatted.length > 0 ? 50 : 0 // Flat delivery fee

    return {
      items: formatted,
      subtotal,
      tax,
      delivery,
      total: subtotal + tax + delivery,
      itemCount: formatted.length,
    }
  } catch (error) {
    console.error('[v0] Error fetching cart:', error)
    return { items: [], subtotal: 0, tax: 0, delivery: 0, total: 0, itemCount: 0 }
  }
}

export async function addToCart(userId: string, shopId: string, productId: string, quantity: number = 1) {
  try {
    const { data, error } = await supabase
      .from('shopping_cart')
      .upsert({
        user_id: userId,
        shop_id: shopId,
        product_id: productId,
        quantity: quantity,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error adding to cart:', error)
    return { success: false, error }
  }
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      return removeFromCart(userId, productId)
    }

    const { data, error } = await supabase
      .from('shopping_cart')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error updating cart item:', error)
    return { success: false, error }
  }
}

export async function removeFromCart(userId: string, productId: string) {
  try {
    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('[v0] Error removing from cart:', error)
    return { success: false, error }
  }
}

export async function clearCart(userId: string) {
  try {
    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('[v0] Error clearing cart:', error)
    return { success: false, error }
  }
}
