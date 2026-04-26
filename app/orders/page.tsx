'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Order } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { getUserOrders, updateOrderStatus } from '@/lib/orders';
import { Clock, CheckCircle, AlertCircle, Package } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  preparing: { label: 'Preparing', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  on_way: { label: 'On the Way', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      setUserId(user.id);

      if (user.user_type === 'customer') {
        const userOrders = await getUserOrders(user.id);
        setOrders(userOrders);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelOrder(orderId: string) {
    try {
      setCancellingOrder(orderId);
      await updateOrderStatus(orderId, 'cancelled');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    } finally {
      setCancellingOrder(null);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const config = STATUS_CONFIG[order.status];
                const Icon = config.icon;

                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition p-6 cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Left Section */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${config.bg}`}>
                              <Icon className={`w-6 h-6 ${config.color}`} />
                            </div>

                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>

                              <div className="flex items-center gap-4 text-sm">
                                <span className={`font-semibold ${config.color}`}>
                                  {config.label}
                                </span>
                                <span className="text-gray-600">
                                  Delivery in {order.delivery_time_estimate} min
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 ml-16">
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {order.delivery_address}
                            </p>
                          </div>
                        </div>

                        {/* Right Section */}
                        <div className="sm:text-right">
                          <p className="text-2xl font-bold text-gray-900 mb-2">
                            ₹{order.total_amount.toFixed(2)}
                          </p>

                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCancelOrder(order.id);
                              }}
                              disabled={cancellingOrder === order.id}
                            >
                              {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel Order'}
                            </Button>
                          )}
                          {order.status !== 'pending' && order.status !== 'cancelled' && (
                            <Button size="sm" variant="outline" disabled>
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet. Start shopping today!</p>
              <Link href="/shops">
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  Browse Shops
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
