'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package, MapPin, Clock, CheckCircle, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

function TrackingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      router.push('/orders')
      return
    }
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

      setOrder(data)
    } catch (error) {
      console.error('[v0] Error loading order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
          <Button onClick={() => router.push('/orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  const statusSteps = [
    { status: 'pending', label: 'Order Placed', icon: CheckCircle },
    { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { status: 'preparing', label: 'Preparing', icon: Package },
    { status: 'on_way', label: 'On the Way', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle },
  ]

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
          <p className="text-gray-600 text-sm mt-1">Order ID: {order.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          {/* Status Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(currentStepIndex + 1) / statusSteps.length * 100}%` }}
              />
            </div>

            {/* Timeline Steps */}
            <div className="grid grid-cols-5 gap-4 relative z-10">
              {statusSteps.map((step, idx) => {
                const Icon = step.icon
                const isActive = idx <= currentStepIndex
                const isCurrent = idx === currentStepIndex

                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition ${
                        isActive
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className={`text-center text-sm font-semibold ${
                      isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-green-600 mt-1">Current</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Delivery Address
            </h2>
            <div className="text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{order.delivery_address}</p>
              <p>Pincode: {order.pincode}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Order Information
            </h2>
            <div className="space-y-2 text-gray-600 text-sm">
              <p><span className="font-semibold text-gray-900">Amount:</span> ₹{order.total_amount.toFixed(2)}</p>
              <p><span className="font-semibold text-gray-900">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
              <p><span className="font-semibold text-gray-900">Status:</span> <span className="capitalize text-blue-600 font-semibold">{order.status.replace('_', ' ')}</span></p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button
            onClick={() => router.push('/orders')}
            variant="outline"
          >
            Back to Orders
          </Button>
          {order.status === 'delivered' && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              Leave a Review
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading tracking...</div>}>
      <TrackingContent />
    </Suspense>
  )
}
