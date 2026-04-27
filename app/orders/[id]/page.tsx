'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Download,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product_name: string;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

const STATUS_TIMELINE = ['pending', 'confirmed', 'paid', 'shipped', 'delivered'];

const STATUS_CONFIG = {
  pending: { label: 'Order Placed', icon: Clock, color: 'yellow' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'blue' },
  paid: { label: 'Payment Confirmed', icon: DollarSign, color: 'blue' },
  shipped: { label: 'Shipped', icon: Package, color: 'purple' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'green' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'red' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Auto-refresh order status every 5 seconds if not delivered
  useEffect(() => {
    if (!isAutoRefreshing || !order || ['delivered', 'cancelled'].includes(order.status)) {
      return;
    }

    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 5000);

    return () => clearInterval(interval);
  }, [order, isAutoRefreshing]);

  async function fetchOrderDetails() {
    try {
      setError('');
      const response = await fetch(`/api/customer/orders/${orderId}/status`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load order details');
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="bg-white rounded-lg shadow p-8 h-64"></div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/orders">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Order not found</h2>
              <p className="text-gray-600">{error || 'The order you&apos;re looking for does not exist.'}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const currentStatusIndex = STATUS_TIMELINE.indexOf(order.status);
  const isCompleted = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/orders">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Order #{orderId.slice(0, 8).toUpperCase()}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {error && !order && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
                <button
                  onClick={() => fetchOrderDetails()}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Progress line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200"></div>
                {!isCancelled && (
                  <div
                    className="absolute top-6 left-0 h-1 bg-green-500 transition-all duration-500"
                    style={{
                      width: `${currentStatusIndex > 0 ? (currentStatusIndex / (STATUS_TIMELINE.length - 1)) * 100 : 0}%`,
                    }}
                  ></div>
                )}

                {/* Timeline items */}
                <div className="relative flex justify-between">
                  {STATUS_TIMELINE.map((status, index) => {
                    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                    const Icon = config.icon;
                    const isActive = index <= currentStatusIndex && !isCancelled;
                    const isCurrentStatus = status === order.status;

                    return (
                      <div key={status} className="flex flex-col items-center flex-1">
                        <div
                          className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                            isActive ? (
                              config.color === 'yellow' ? 'bg-yellow-500 text-white' :
                              config.color === 'blue' ? 'bg-blue-500 text-white' :
                              config.color === 'purple' ? 'bg-purple-500 text-white' :
                              config.color === 'green' ? 'bg-green-500 text-white' :
                              'bg-red-500 text-white'
                            ) : 'bg-gray-200 text-gray-500'
                          } ${isCurrentStatus ? 'ring-4 ring-offset-2 ring-blue-300' : ''}`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <p className={`mt-3 text-sm font-medium text-center ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                          {config.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current Status Message */}
            {!isCancelled && (
              <div className={`p-4 rounded-lg ${order.status === 'delivered' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-sm font-medium ${order.status === 'delivered' ? 'text-green-800' : 'text-blue-800'}`}>
                  {order.status === 'pending' && 'Your order is being prepared for shipment.'}
                  {order.status === 'confirmed' && 'Your order has been confirmed. We&apos;re preparing it for shipment.'}
                  {order.status === 'paid' && 'Payment received. Your order will be shipped soon.'}
                  {order.status === 'shipped' && 'Your order is on its way! Track it in real-time.'}
                  {order.status === 'delivered' && 'Your order has been delivered. Thank you for shopping with us!'}
                </p>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No items in this order</p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{(order.total_amount * 0.9).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">₹{(order.total_amount * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">₹{order.total_amount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  <span className="font-medium">Payment Method:</span> {order.payment_method}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download Invoice
              </Button>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Contact Support
              </Button>
              {!isCompleted && !isCancelled && (
                <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <RotateCcw className="w-4 h-4" />
                  Cancel Order
                </Button>
              )}
              {isCompleted && (
                <Button variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Return / Exchange
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
