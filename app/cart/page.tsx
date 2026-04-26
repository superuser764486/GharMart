'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Heart,
  Truck,
  BadgeCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { getCart, updateCartItem, removeFromCart, clearCart } from '@/lib/customer/cart'

export default function CartPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }
      setUserId(user.id)
      const cartData = await getCart(user.id)
      setCart(cartData)
    } catch (error) {
      console.error('[v0] Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (!userId) return
    await updateCartItem(userId, productId, quantity)
    const updatedCart = await getCart(userId)
    setCart(updatedCart)
  }

  const handleRemoveItem = async (productId: string) => {
    if (!userId) return
    await removeFromCart(userId, productId)
    const updatedCart = await getCart(userId)
    setCart(updatedCart)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading cart...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/shops">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {cart?.itemCount || 0} items
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {cart?.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item: any) => (
                <div key={item.product_id} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0" />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.shop_id}</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">₹{item.price}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="px-3 font-semibold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & Fees</span>
                    <span>₹{cart.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Delivery
                    </span>
                    <span>₹{cart.delivery.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-2xl text-green-600">₹{cart.total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                >
                  Proceed to Checkout
                </Button>

                <div className="mt-6 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-green-600" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    Free delivery on orders above ₹500
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
            <Link href="/shops">
              <Button className="bg-blue-600 hover:bg-blue-700">Continue Shopping</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
