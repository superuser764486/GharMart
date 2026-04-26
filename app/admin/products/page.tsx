'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Eye, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { getAllProducts, getPendingProductReviews } from '@/lib/admin/products'
import { DataTable } from '@/components/admin/DataTable'
import { supabase } from '@/lib/supabase'

export default function ProductsManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'reviews'>('all')
  const [products, setProducts] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminId, setAdminId] = useState('')

  useEffect(() => {
    checkAdminAndLoadData()
  }, [tab, statusFilter, searchQuery])

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const isAdminUser = await verifyAdminAccess(user.id)
      if (!isAdminUser) {
        router.push('/')
        return
      }

      setAdminId(user.id)
      setIsAdmin(true)

      if (tab === 'reviews') {
        loadReviews()
      } else {
        loadProducts()
      }
    } catch (error) {
      console.error('[v0] Admin check failed:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const result = await getAllProducts({
        status: statusFilter === 'all' ? undefined : (statusFilter as any),
        search: searchQuery || undefined,
        limit: 100,
      })
      setProducts(result.products)
    } catch (error) {
      console.error('[v0] Failed to load products:', error)
    }
  }

  const loadReviews = async () => {
    try {
      const result = await getPendingProductReviews()
      setReviews(result.reviews)
    } catch (error) {
      console.error('[v0] Failed to load reviews:', error)
    }
  }

  if (!isAdmin) return null

  const productColumns = [
    {
      key: 'name' as const,
      label: 'Product Name',
      sortable: true,
    },
    {
      key: 'price' as const,
      label: 'Price',
      render: (value: number) => `₹${Math.round(value).toLocaleString()}`,
    },
    {
      key: 'moderation_status' as const,
      label: 'Status',
      render: (value: string) => {
        const colors: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
        }
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[value] || 'bg-gray-100'}`}>
            {value}
          </span>
        )
      },
    },
    {
      key: 'is_featured' as const,
      label: 'Featured',
      render: (value: boolean) => value ? '✓' : '✕',
    },
    {
      key: 'created_at' as const,
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: string) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/products/${value}`)}
          className="text-blue-500 hover:text-blue-600"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  const reviewColumns = [
    {
      key: 'product_id' as const,
      label: 'Product',
      render: (value: string, item: any) => item.product?.name || 'N/A',
    },
    {
      key: 'rating' as const,
      label: 'Rating',
      render: (value: number) => '⭐'.repeat(value),
    },
    {
      key: 'comment' as const,
      label: 'Review',
      render: (value: string) => value?.substring(0, 50) + '...' || 'N/A',
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          {value}
        </span>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: string) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="text-green-600" title="Approve">
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-600" title="Reject">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-white">Product Management</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-700 flex gap-8">
          {[
            { id: 'all', label: 'All Products', count: products.length },
            { id: 'reviews', label: 'Pending Reviews', count: reviews.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`pb-3 font-medium transition ${
                tab === t.id
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label} {t.count > 0 && `(${t.count})`}
            </button>
          ))}
        </div>

        {/* Filters for Products Tab */}
        {tab === 'all' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }}
                  variant="outline"
                  className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : tab === 'all' ? (
            <DataTable columns={productColumns} data={products} rowKey="id" striped />
          ) : (
            <DataTable columns={reviewColumns} data={reviews} rowKey="id" striped />
          )}
        </div>
      </main>
    </div>
  )
}
