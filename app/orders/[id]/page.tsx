'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Order, OrderItem, Product, Shop } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { getOrderWithItems, updateOrderStatus } from '@/lib/orders';
import { getShop } from '@/lib/shops';
import { MapPin, Clock, CheckCircle, AlertCircle, Package, DollarSign } from 'lucide-react';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'on_way', 'delivered'] as const;
const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  on_way: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  async function loadOrderDetails() {
    try {
      setLoading(true);

      // Check user
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUserId(user.id);

      // Get order with items
      const result = await getOrderWithItems(id as string);
      if (!result) {
        throw new Error('Order not found');
      }

      setOrder(result.order);
      setItems(result.items || []);

      // Get shop info
      if (result.order.shop_id) {
        const shopData = await getShop(result.order.shop_id);
        setShop(shopData);
      }
    } catch (error: any) {
      console.error('Error loading order:', error);
      alert(error.message || 'Failed to load order');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(newStatus: Order['status']) {
    try {
      if (!order) return;
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (error: any) {
      alert(error.message || 'Failed to update order status');
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-gray-200 rounded-lg h-96 animate-pulse" />
          </div>
        </main>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-gray-600">Order not found</p>
            <Link href="/orders">
              <Button className="mt-4">Back to Orders</Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  const currentStatusIndex = STATUS_STEPS.indexOf(order.status as any);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/orders" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
            ← Back to Orders
          </Link>

          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${
                    isCancelled
                      ? 'bg-red-100 text-red-800'
                      : isDelivered
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            {!isCancelled && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-6">Order Status</h3>
                <div className="flex items-center gap-2">
                  {STATUS_STEPS.map((step, idx) => {
                    const isActive = STATUS_STEPS.indexOf(order.status as any) >= idx;
                    const isCurrent = step === order.status;

                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                            isActive
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {isActive ? '✓' : idx + 1}
                        </div>
                        <div
                          className={`h-1 flex-1 mx-2 ${
                            idx < STATUS_STEPS.length - 1
                              ? isActive
                                ? 'bg-green-600'
                                : 'bg-gray-200'
                              : ''
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-4 text-xs text-gray-600">
                  {STATUS_STEPS.map((step) => (
                    <div key={step} className="flex-1 text-center">
                      {STATUS_LABELS[step]}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Delivery Address</h3>
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{order.delivery_address}</p>
                    <p className="text-gray-600">{order.pincode}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Estimated Delivery</h3>
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-900">
                      {order.delivery_time_estimate} minutes from order time
                    </p>
                    <p className="text-gray-600 text-sm">
                      {new Date(
                        new Date(order.created_at).getTime() +
                          (order.delivery_time_estimate || 0) * 60000
                      ).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Info */}
            {shop && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Shop</h3>
                <Link href={`/shops/${shop.id}`} className="hover:text-blue-600">
                  <p className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                    {shop.name}
                  </p>
                </Link>
                <p className="text-gray-600">{shop.category}</p>
              </div>
            )}

            {/* Items */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.products?.name || 'Product'}
                      </p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{(item.price_at_purchase * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">₹{item.price_at_purchase}/unit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-3xl font-bold text-gray-900">
                  ₹{order.total_amount.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-2">Cash on Delivery (COD)</div>
            </div>

            {/* Special Notes */}
            {order.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-900">
                  <strong>Delivery Notes:</strong> {order.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {!isDelivered && !isCancelled && order.status === 'pending' && (
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus('cancelled')}
                >
                  Cancel Order
                </Button>
              )}
              <Link href="/orders" className="ml-auto">
                <Button variant="outline">Back to Orders</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
