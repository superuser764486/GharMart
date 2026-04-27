'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin, CreditCard, Truck, Lock } from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  street_address: string;
  apartment_number?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'upi', name: 'UPI', icon: '📱' },
    { id: 'wallet', name: 'Razorpay Wallet', icon: '👛' },
    { id: 'cod', name: 'Cash on Delivery', icon: '🚚' },
  ];

  const subtotal = getTotal();
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = 40;
  const total = subtotal + tax + deliveryFee;

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    fetchAddresses();
    loadRazorpayScript();
  }, [items.length, router]);

  async function fetchAddresses() {
    try {
      const response = await fetch('/api/addresses');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load addresses');
      }
      
      setAddresses(data.addresses);
      const defaultAddr = data.addresses.find((a: Address) => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load addresses');
      console.error(err);
    }
  }

  function loadRazorpayScript() {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  async function handlePayment() {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    if (selectedPayment === 'cod') {
      await handleCODOrder();
      return;
    }

    try {
      setProcessing(true);
      setError('');

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          addressId: selectedAddressId,
          paymentMethod: selectedPayment,
          total: total,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const order = orderData.order;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'GharMart',
        description: `Order for ${items.length} items`,
        order_id: order.razorpay_order_id,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch('/api/orders/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              clearCart();
              router.push(`/orders/${order.id}?success=true`);
            } else {
              setError('Payment verification failed');
            }
          } catch (err) {
            setError('Payment verification failed');
            console.error(err);
          }
        },
        prefill: {
          email: '',
          contact: '',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  async function handleCODOrder() {
    try {
      setProcessing(true);

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          addressId: selectedAddressId,
          paymentMethod: 'cod',
          total: total,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const order = orderData.order;
      clearCart();
      router.push(`/orders/${order.id}?success=true`);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your purchase</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </h2>

                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No addresses found</p>
                    <Button
                      onClick={() => router.push('/account/addresses')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label key={address.id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="w-4 h-4 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{address.label}</h3>
                            {address.is_default && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.street_address} {address.apartment_number && `, ${address.apartment_number}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">Ph: {address.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div>
                        <span className="text-2xl">{method.icon}</span>
                        <p className="font-medium text-gray-900 text-sm">{method.name}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Secure Payment</p>
                  <p className="text-xs text-blue-700 mt-1">Your payment information is encrypted and secure</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>

                {/* Items */}
                <div className="max-h-64 overflow-y-auto mb-6 pb-6 border-b border-gray-200">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
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
                    <span className="text-gray-600 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Delivery
                    </span>
                    <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-green-600">₹{total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing || !selectedAddressId}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold text-lg disabled:opacity-50"
                >
                  {processing ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  {selectedPayment === 'cod'
                    ? 'You will pay at delivery'
                    : 'Redirecting to Razorpay...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
