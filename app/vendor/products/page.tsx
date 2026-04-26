'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  Filter,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { getVendorProducts, createProduct, updateProduct, deleteProduct, getBulkProductStats } from '@/lib/vendor/products'

export default function VendorProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    sku: '',
  })

  useEffect(() => {
    checkVendor()
  }, [])

  const checkVendor = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', user.id)
        .single()

      if (!userData || userData.role !== 'vendor') {
        router.push('/')
        return
      }

      setVendorId(userData.id)
      await loadProducts(userData.id)
    } catch (error) {
      console.error('[v0] Vendor check failed:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async (id: string) => {
    try {
      const vendorProducts = await getVendorProducts(id)
      setProducts(vendorProducts)

      const productStats = await getBulkProductStats(id)
      setStats(productStats)
    } catch (error) {
      console.error('[v0] Error loading products:', error)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendorId) return

    try {
      const result = await createProduct(vendorId, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sku: formData.sku,
        is_active: true,
        moderation_status: 'pending',
      } as any)

      if (result.success) {
        setFormData({ name: '', description: '', category: '', price: '', stock: '', sku: '' })
        setShowForm(false)
        await loadProducts(vendorId)
      }
    } catch (error) {
      console.error('[v0] Error adding product:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!vendorId || !confirm('Delete this product?')) return

    try {
      await deleteProduct(vendorId, productId)
      await loadProducts(vendorId)
    } catch (error) {
      console.error('[v0] Error deleting product:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-gray-400">Loading products...</div>
      </div>
    )
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.moderation_status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Products Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/vendor/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Active</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.lowStock}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-blue-400">{stats.pendingApproval}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Product Name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="SKU"
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Stock"
                type="number"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Category"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Description"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="md:col-span-2 bg-gray-700 border-gray-600 text-white"
              />
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Add Product
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-700 border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">SKU</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Price</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Stock</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="px-6 py-4 text-gray-300">{product.name}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-sm">{product.sku}</td>
                      <td className="px-6 py-4 text-green-400 font-semibold">₹{product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-300">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.moderation_status === 'approved' ? 'bg-green-900 text-green-300' :
                          product.moderation_status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {product.moderation_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button size="sm" variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No products found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
