'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Star, Clock, Truck } from 'lucide-react';
import { getPopularShops, getCategories, getUserLocation } from '@/lib/shops';
import { Shop, Category } from '@/lib/supabase';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);

      // Try to get user location
      try {
        const userLocation = await getUserLocation();
        setLocation(userLocation);
      } catch (error) {
        console.log('Geolocation not available, using default location');
      }

      // Load popular shops
      const popularShops = await getPopularShops(6);
      setShops(popularShops);

      // Load categories
      const allCategories = await getCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    router.push(`/shops?${params.toString()}`);
  }

  function handleLocationClick() {
    if (location) {
      router.push(`/shops?lat=${location.latitude}&lng=${location.longitude}`);
    } else {
      alert('Please enable location access or enter a pincode');
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Discover Local Shops <span className="text-green-600">Near You</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with neighborhood businesses, explore local products, and support your community with GharMart
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for shops, products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 rounded-lg border-gray-300"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter pincode or area"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="pl-10 h-12 rounded-lg border-gray-300"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-12 px-8"
                >
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

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                <p className="text-gray-600">Local Shops</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
                <p className="text-gray-600">Categories</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">10K+</div>
                <p className="text-gray-600">Happy Customers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Shops Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Local Shops</h2>
            <p className="text-gray-600">Discover highly-rated businesses in your area</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : shops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {shops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/shops/${shop.id}`}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600">
                          {shop.name}
                        </h3>
                        <p className="text-sm text-gray-600">{shop.category}</p>
                      </div>
                      {shop.is_new && (
                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">
                          New
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{shop.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{shop.delivery_time_min}-{shop.delivery_time_max} min</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{shop.avg_rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-600">({shop.total_reviews})</span>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                    <Button variant="ghost" className="w-full justify-center text-blue-600 hover:text-blue-700">
                      View Shop →
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No shops available yet</p>
            </div>
          )}

          <div className="text-center">
            <Link href="/shops">
              <Button variant="outline" className="border-2 border-gray-300">
                View All Shops
              </Button>
            </Link>
          </div>
        </section>

        {/* Popular Categories Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Categories</h2>
            <p className="text-gray-600">Explore different types of local businesses</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shops?category=${category.name}`}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition p-4 text-center group"
              >
                <div className="text-4xl mb-3 flex justify-center">
                  {category.icon_url && (
                    <img src={category.icon_url} alt={category.name} className="w-12 h-12" />
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
        <section id="why-choose" className="px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose GharMart?</h2>
              <p className="text-gray-600">Everything you need to connect with local businesses</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Easy Discovery</h3>
                <p className="text-gray-600 text-sm">Find local shops and services with our powerful search engine</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Location-Based</h3>
                <p className="text-gray-600 text-sm">Discover businesses in your neighborhood and nearby areas</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Reviews & Ratings</h3>
                <p className="text-gray-600 text-sm">Read authentic reviews from local customers</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Delivery Options</h3>
                <p className="text-gray-600 text-sm">Many shops offer home delivery services</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to start shopping?</h2>
            <p className="text-gray-600 mb-8">Join thousands of customers discovering their favorite local shops</p>
            <Link href="/shops">
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8 h-12">
                Explore Shops Now
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
