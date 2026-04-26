'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Check } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getShop } from '@/lib/shops';
import { getProduct } from '@/lib/products';
import { createOrder } from '@/lib/orders';
import { Shop, Product, User } from '@/lib/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [cartItems, setCartItems] = useState<Map<string, number>>(new Map());
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'address' | 'payment' | 'confirm'>('address');
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [deliveryData, setDeliveryData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    city: 'Delhi',
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);

      // Get current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth/signin');
        return;
      }
      setUser(currentUser);

      // Pre-fill delivery info
      setDeliveryData((prev) => ({
        ...prev,
        fullName: currentUser.name || '',
        email: currentUser.email,
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        pincode: currentUser.pincode || '',
        city: currentUser.city || 'Delhi',
      }));

      // Get shop
      const shopId = searchParams.get('shop');
      if (!shopId) {
        throw new Error('No shop specified');
      }

      const shopData = await getShop(shopId);
      if (!shopData) {
        throw new Error('Shop not found');
      }
      setShop(shopData);

      // Get cart from session storage or URL params
      const cartData = sessionStorage.getItem(`cart-${shopId}`);
      if (cartData) {
        try {
          const parsed = JSON.parse(cartData);
          setCartItems(new Map(Object.entries(parsed)));

          // Load product details
          const productsMap = new Map<string, Product>();
          for (const productId of Object.keys(parsed)) {
            const product = await getProduct(productId);
            if (product) {
              productsMap.set(productId, product);
            }
          }
          setProducts(productsMap);
        } catch (e) {
          console.error('Error parsing cart:', e);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load checkout');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitOrder() {
    try {
      setError('');
      setSubmitting(true);

      if (!user || !shop) {
        throw new Error('Missing user or shop information');
      }

      if (!deliveryData.fullName || !deliveryData.phone || !deliveryData.address || !deliveryData.pincode) {
        setError('Please fill in all delivery details');
        setStep('address');
        return;
      }

      // Convert cart to order items with validation
      const items = Array.from(cartItems.entries()).map(([productId, quantity]) => {
        const product = products.get(productId);
        if (!product) throw new Error(`Product ${productId} no longer available`);
        
        // Validate product availability
        if (!product.is_available) throw new Error(`${product.name} is no longer available`);
        
        // Validate stock
        if (product.quantity < quantity) {
          throw new Error(`${product.name} only has ${product.quantity} in stock`);
        }
        
        return {
          productId,
          quantity,
          price: product.price,
        };
      });

      if (items.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // Validate phone number format
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(deliveryData.phone.replace(/\D/g, ''))) {
        setError('Please enter a valid 10-digit phone number');
        setStep('address');
        return;
      }
      
      // Validate pincode format
      const pincodeRegex = /^[0-9]{6}$/;
      if (!pincodeRegex.test(deliveryData.pincode.replace(/\D/g, ''))) {
        setError('Please enter a valid 6-digit pincode');
        setStep('address');
        return;
      }

      // Create order
      const order = await createOrder(
        user.id,
        shop.id,
        shop.vendor_id,
        items,
        deliveryData.address,
        deliveryData.pincode,
        deliveryData.notes
      );

      setOrderId(order.id);
      setOrderCreated(true);
      setStep('confirm');

      // Clear cart from session storage
      sessionStorage.removeItem(`cart-${shop.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-gray-200 rounded-lg h-64 animate-pulse" />
          </div>
        </main>
      </>
    );
  }

  if (orderCreated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600 mb-4">Thank you for your order</p>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <p className="text-sm text-gray-600 mb-2">Order ID</p>
                <p className="text-lg font-bold text-gray-900 break-all">{orderId}</p>
              </div>

              <div className="space-y-3 mb-8">
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="text-gray-900">{deliveryData.address}, {deliveryData.pincode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery Time</p>
                  <p className="text-gray-900">{shop?.delivery_time_min}-{shop?.delivery_time_max} minutes</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/orders" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Order
                  </Button>
                </Link>
                <Link href="/shops" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  const cartTotal = Array.from(cartItems.entries()).reduce((sum, [productId, qty]) => {
    const product = products.get(productId);
    return sum + (product?.price || 0) * qty;
  }, 0);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 font-semibold">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

                {/* Steps */}
                <div className="flex gap-4 mb-8">
                  {['address', 'payment', 'confirm'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                          step === s
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                        {s === 'address' ? 'Address' : s === 'payment' ? 'Payment' : 'Confirm'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Address Step */}
                {step === 'address' && (
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Full Name"
                        value={deliveryData.fullName}
                        onChange={(e) =>
                          setDeliveryData((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        className="col-span-2 h-10"
                      />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={deliveryData.email}
                        disabled
                        className="h-10"
                      />
                      <Input
                        type="tel"
                        placeholder="Phone"
                        value={deliveryData.phone}
                        onChange={(e) =>
                          setDeliveryData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="h-10"
                      />
                      <Input
                        placeholder="Address"
                        value={deliveryData.address}
                        onChange={(e) =>
                          setDeliveryData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        className="col-span-2 h-10"
                      />
                      <Input
                        placeholder="Pincode"
                        value={deliveryData.pincode}
                        onChange={(e) =>
                          setDeliveryData((prev) => ({
                            ...prev,
                            pincode: e.target.value,
                          }))
                        }
                        className="h-10"
                      />
                      <select
                        value={deliveryData.city}
                        onChange={(e) =>
                          setDeliveryData((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        className="h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Delhi">Delhi</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bangalore">Bangalore</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        placeholder="Add any special delivery instructions..."
                        value={deliveryData.notes}
                        onChange={(e) =>
                          setDeliveryData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <Button
                      type="button"
                      className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                      onClick={() => setStep('payment')}
                    >
                      Continue to Payment
                    </Button>
                  </form>
                )}

                {/* Payment Step */}
                {step === 'payment' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        <strong>Payment Method: Cash on Delivery (COD)</strong>
                      </p>
                      <p className="text-sm text-blue-800 mt-2">
                        You can pay when the delivery person brings your order to your doorstep.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                      <p className="text-gray-700">
                        {deliveryData.fullName}<br />
                        {deliveryData.address}<br />
                        {deliveryData.pincode}, {deliveryData.city}<br />
                        {deliveryData.phone}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep('address')}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        onClick={() => setStep('confirm')}
                      >
                        Review Order
                      </Button>
                    </div>
                  </div>
                )}

                {/* Confirm Step */}
                {step === 'confirm' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                      <div className="space-y-2">
                        {Array.from(cartItems.entries()).map(([productId, qty]) => {
                          const product = products.get(productId);
                          if (!product) return null;
                          return (
                            <div key={productId} className="flex justify-between text-sm">
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-gray-600">Qty: {qty}</p>
                              </div>
                              <p className="font-semibold">₹{(product.price * qty).toFixed(2)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between mb-2 text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-4 text-gray-600">
                        <span>Delivery Fee</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total Amount</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep('payment')}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        onClick={handleSubmitOrder}
                        disabled={submitting}
                      >
                        {submitting ? 'Placing Order...' : 'Place Order'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Shop</p>
                  <p className="font-semibold text-gray-900">{shop?.name}</p>
                </div>

                <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                  {Array.from(cartItems.entries()).map(([productId, qty]) => {
                    const product = products.get(productId);
                    if (!product) return null;
                    return (
                      <div key={productId} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-gray-600">₹{product.price.toFixed(2)} × {qty}</p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ₹{(product.price * qty).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2 text-gray-600 text-sm">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-4 text-gray-600 text-sm">
                    <span>Delivery</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
