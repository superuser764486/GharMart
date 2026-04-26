'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ArrowLeft, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { getWishlist, removeFromWishlist } from '@/lib/customer/wishlist'
import { addToCart } from '@/lib/customer/cart'

export default function WishlistPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [wishlist, setWishlist] = useState<any[]>([])
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
      const items = await getWishlist(user.id)
      setWishlist(items)
    } catch (error) {
      console.error('[v0] Error loading wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId: string) => {
    if (!userId) return
    await removeFromWishlist(userId, productId)
    setWishlist(wishlist.filter(item => item.product_id !== productId))
  }

  const handleAddToCart = async (item: any) => {
    if (!userId) return
    await addToCart(userId, item.shop_id, item.product_id, 1)
    alert('Added to cart!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading wishlist...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
          <span className="ml-auto bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-semibold">
            {wishlist.length} items
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(item => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
                <div className="w-full h-40 bg-gray-100" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{item.product_name}</h3>
                  <p className="text-green-600 font-bold text-lg mt-2">₹{item.price}</p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      className="p-2 text-pink-600 hover:bg-pink-50 rounded"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No items in wishlist</h2>
            <p className="text-gray-600 mb-6">Save products you love to buy later</p>
            <Link href="/shops">
              <Button className="bg-blue-600 hover:bg-blue-700">Browse Products</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
