'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ShoppingBag, Star, ChevronDown } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category: string;
  rating?: number;
  reviews_count?: number;
  in_stock: boolean;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('relevance');
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  async function loadProducts() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('minPrice', priceRange.min.toString());
      params.append('maxPrice', priceRange.max.toString());
      params.append('sort', sortBy);

      const response = await axios.get(`/api/products?${params.toString()}`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('[v0] Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.categories.map((c: any) => c.name));
    } catch (error) {
      console.error('[v0] Error loading categories:', error);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // Search will trigger useEffect
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-lg"
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                Search
              </Button>
              <Button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </form>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            {showFilters && (
              <div className="lg:col-span-1 lg:block">
                <div className="bg-white rounded-lg shadow p-6 sticky top-40">
                  <h3 className="font-bold text-lg mb-4">Filters</h3>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm mb-3">Category</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value=""
                          checked={selectedCategory === ''}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">All Categories</span>
                      </label>
                      {categories.map((cat) => (
                        <label key={cat} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value={cat}
                            checked={selectedCategory === cat}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm mb-3">Price Range</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600">Min Price</label>
                        <Input
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                          className="h-9 text-sm"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Max Price</label>
                        <Input
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                          className="h-9 text-sm"
                          max={100000}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    onClick={() => {
                      setSelectedCategory('');
                      setSearchQuery('');
                      setPriceRange({ min: 0, max: 10000 });
                      setSortBy('relevance');
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg h-80 animate-pulse" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">Showing {products.length} products</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition group overflow-hidden"
                      >
                        {/* Product Image */}
                        <div className="relative h-48 bg-gray-100">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ShoppingBag className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                          {product.original_price && product.original_price > product.price && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% Off
                            </div>
                          )}
                          {!product.in_stock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-semibold">Out of Stock</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</p>
                          <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 line-clamp-2 mb-2">
                            {product.name}
                          </h3>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
                            {product.original_price && (
                              <span className="text-sm text-gray-500 line-through">₹{product.original_price.toFixed(2)}</span>
                            )}
                          </div>

                          {/* Rating */}
                          {product.rating && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-semibold text-gray-900 ml-1">{product.rating}</span>
                              </div>
                              <span className="text-xs text-gray-500">({product.reviews_count})</span>
                            </div>
                          )}

                          {/* Add to Cart Button */}
                          <Button
                            disabled={!product.in_stock}
                            className="w-full h-9 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-sm disabled:opacity-50"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No products found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your filters or search term</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
