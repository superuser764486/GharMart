'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Clock, CheckCircle, AlertCircle, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const limit = 10;
  const statuses = ['all', 'pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'];

  const statusConfig = {
    pending: { color: 'yellow', icon: Clock, label: 'Pending' },
    confirmed: { color: 'blue', icon: CheckCircle, label: 'Confirmed' },
    paid: { color: 'blue', icon: CheckCircle, label: 'Paid' },
    shipped: { color: 'purple', icon: Package, label: 'Shipped' },
    delivered: { color: 'green', icon: CheckCircle, label: 'Delivered' },
    cancelled: { color: 'red', icon: AlertCircle, label: 'Cancelled' },
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      params.set('offset', (page * limit).toString());
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/customer/orders?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load orders');
      }

      setOrders(data.orders);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage all your purchases</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                className="h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {total} total orders
            </p>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
              <p className="text-gray-600 mb-6">
                {total === 0 ? 'You haven&apos;t placed any orders yet.' : 'No orders match your filters.'}
              </p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const currentStatus = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = currentStatus.icon;

                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`p-2 rounded-lg ${
                              currentStatus.color === 'yellow' ? 'bg-yellow-100' :
                              currentStatus.color === 'blue' ? 'bg-blue-100' :
                              currentStatus.color === 'purple' ? 'bg-purple-100' :
                              currentStatus.color === 'green' ? 'bg-green-100' :
                              'bg-red-100'
                            }`}>
                              <StatusIcon className={`w-5 h-5 ${
                                currentStatus.color === 'yellow' ? 'text-yellow-600' :
                                currentStatus.color === 'blue' ? 'text-blue-600' :
                                currentStatus.color === 'purple' ? 'text-purple-600' :
                                currentStatus.color === 'green' ? 'text-green-600' :
                                'text-red-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right pr-4">
                          <p className="text-2xl font-bold text-gray-900">₹{order.total_amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{currentStatus.label}</p>
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                variant="outline"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    onClick={() => setPage(i)}
                    variant={page === i ? 'default' : 'outline'}
                    className={page === i ? 'bg-blue-600' : ''}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
