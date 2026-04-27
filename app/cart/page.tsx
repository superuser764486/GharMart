'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Tag } from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = getTotal();
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = items.length > 0 ? 40 : 0;
  const total = subtotal + tax + deliveryFee - discount;

  function applyPromoCode() {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(Math.round(subtotal * 0.1 * 100) / 100);
    } else if (promoCode.toUpperCase() === 'SAVE50') {
      setDiscount(50);
    } else {
      setDiscount(0);
    }
  }

  function handleCheckout() {
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    router.push('/checkout');
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
              <p className="text-gray-600 mb-8">Start adding products to your cart!</p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/products" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">{getItemCount()} items in cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow divide-y">
                {items.map((item) => (
                  <div key={item.productId} className="p-6 flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-2">₹{item.price.toFixed(2)}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-4">
                        <Button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          size="sm"
                          className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                          className="w-16 h-8 text-center"
                          min={1}
                        />
                        <Button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          size="sm"
                          className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Total and Remove */}
                    <div className="text-right flex flex-col justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="text-xl font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <Button
                        onClick={() => removeItem(item.productId)}
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Apply Promo Code</h3>
                </div>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Enter promo code (e.g., SAVE10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 h-10"
                  />
                  <Button
                    onClick={applyPromoCode}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    Apply
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Available: SAVE10 (10% off), SAVE50 (₹50 off)</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="font-medium text-green-600">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-green-600">₹{Math.max(0, total).toFixed(2)}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold text-lg"
                >
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  You can review your order before payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
