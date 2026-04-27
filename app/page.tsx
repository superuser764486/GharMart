'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Star, Clock, Truck, Zap, TrendingUp, ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category: string;
  shop_id: string;
  rating?: number;
  reviews_count?: number;
  in_stock: boolean;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  description: string;
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);

      // Try to get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          setUserLocation(`${position.coords.latitude},${position.coords.longitude}`);
        }, () => {
          console.log('Location access denied');
        });
      }

      // Load featured products
      const productsResponse = await axios.get('/api/products?limit=8&featured=true');
      setProducts(productsResponse.data.products);

      // Load categories
      const categoriesResponse = await axios.get('/api/categories');
      setCategories(categoriesResponse.data.categories);
    } catch (error) {
      console.error('[v0] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
    }
  }

  function handleLocationClick() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        router.push(`/products?lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
      }, () => {
        alert('Please enable location access');
      });
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 text-balance">
              Fresh Groceries <span className="text-green-600">at Your Doorstep</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 text-pretty">
              Order from local shops, get fresh produce and daily essentials delivered to your home with GharMart
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products, brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 rounded-lg border-gray-300"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-12 px-8 text-white font-semibold"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              <button
                type="button"
                onClick={handleLocationClick}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <MapPin className="w-4 h-4" />
                Use my location
              </button>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">10K+</div>
                <p className="text-gray-600">Products Available</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">30 min</div>
                <p className="text-gray-600">Average Delivery</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
                <p className="text-gray-600">Happy Customers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-500" />
                Featured Products
              </h2>
              <p className="text-gray-600">Fresh picks chosen just for you</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="text-blue-600">
                View All →
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-72 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition group overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
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
                      <div className="flex items-center gap-2">
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
                      className="w-full mt-3 h-9 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-sm disabled:opacity-50"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No products available yet</p>
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              Shop by Category
            </h2>
            <p className="text-gray-600">Explore our wide range of product categories</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-gray-200 hover:shadow-lg transition p-6 text-center group"
              >
                <div className="text-4xl mb-3 flex justify-center">
                  {category.icon ? (
                    <span>{category.icon}</span>
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 text-sm">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Why Choose GharMart Section */}
        <section id="why-choose" className="px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-blue-50 to-green-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose GharMart?</h2>
              <p className="text-gray-600">The smarter way to shop for groceries</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Super Fast</h3>
                <p className="text-gray-600 text-sm">30-minute delivery to your doorstep</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Fresh Quality</h3>
                <p className="text-gray-600 text-sm">Fresh produce and quality products guaranteed</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Best Prices</h3>
                <p className="text-gray-600 text-sm">Compare prices and save with daily deals</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Support Local</h3>
                <p className="text-gray-600 text-sm">Shop from local shops and communities</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 sm:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Start Shopping Today</h2>
            <p className="text-blue-100 mb-8 text-lg">Get fresh groceries delivered in 30 minutes</p>
            <Link href="/products">
              <Button className="bg-white hover:bg-gray-100 text-blue-600 font-semibold px-8 h-12">
                Browse Products Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-12 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="#" className="hover:text-white">About</Link></li>
                  <li><Link href="#" className="hover:text-white">Blog</Link></li>
                  <li><Link href="#" className="hover:text-white">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                  <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
                  <li><Link href="#" className="hover:text-white">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-white">Terms</Link></li>
                  <li><Link href="#" className="hover:text-white">Cookies</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Follow</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="#" className="hover:text-white">Facebook</Link></li>
                  <li><Link href="#" className="hover:text-white">Twitter</Link></li>
                  <li><Link href="#" className="hover:text-white">Instagram</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2024 GharMart. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
