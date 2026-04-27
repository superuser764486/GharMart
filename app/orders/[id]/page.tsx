'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Check, Truck, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product_name?: string;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  address?: {
    full_name: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
  };
  items?: OrderItem[];
}

export default function OrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const isSuccess = searchParams.get('success') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load order');
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex gap-3 mb-6 p-4 bg-red-50 border border-red-200 rounded">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error || 'Order not found'}</p>
              </div>
              <Link href="/products">
                <Button className="bg-blue-600 hover:bg-blue-700">Back to Shopping</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const statusConfig = {
    pending: { color: 'yellow', icon: Clock, label: 'Pending' },
    confirmed: { color: 'blue', icon: Check, label: 'Confirmed' },
    paid: { color: 'blue', icon: Check, label: 'Paid' },
    shipped: { color: 'purple', icon: Truck, label: 'Shipped' },
    delivered: { color: 'green', icon: Check, label: 'Delivered' },
    cancelled: { color: 'red', icon: AlertCircle, label: 'Cancelled' },
  };

  const currentStatus = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          {isSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Order Placed Successfully!</p>
                <p className="text-sm text-green-700 mt-1">Thank you for your purchase. You can track your order below.</p>
              </div>
            </div>
          )}

          {/* Order Status Card */}
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 bg-${currentStatus.color}-100 rounded-full`}>
                <StatusIcon className={`w-6 h-6 text-${currentStatus.color}-600`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                <p className="text-sm text-gray-600 mt-1">{currentStatus.label}</p>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {order.status !== 'pending' && (
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${order.status !== 'pending' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Confirmed</p>
                      <p className="text-sm text-gray-600">Order confirmed</p>
                    </div>
                  </div>
                )}

                {(order.status === 'shipped' || order.status === 'delivered') && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Shipped</p>
                      <p className="text-sm text-gray-600">On the way to you</p>
                    </div>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Delivered</p>
                      <p className="text-sm text-gray-600">Order delivered</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Details</h2>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name || `Product ${item.product_id}`}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {order.address && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{order.address.full_name}</p>
                  <p>{order.address.street_address}</p>
                  <p>{order.address.city}, {order.address.state} {order.address.postal_code}</p>
                </div>
              </div>
            )}

            {/* Order Total */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Amount</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-green-600">₹{order.total_amount.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Payment Method: {order.payment_method.toUpperCase()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/products" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Continue Shopping</Button>
            </Link>
            <Link href="/orders" className="flex-1">
              <Button variant="outline" className="w-full">View All Orders</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
