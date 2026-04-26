'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shop, Category } from '@/lib/supabase';
import { 
  getShopsNearby, 
  getShopsByCategory, 
  searchShops, 
  getCategories,
  getUserLocation 
} from '@/lib/shops';
import { Star, MapPin, Clock, Filter, X } from 'lucide-react';

export default function ShopsPage() {
  const searchParams = useSearchParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'time'>('rating');

  useEffect(() => {
    loadShopsAndCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [shops, searchQuery, selectedCategory, ratingFilter, sortBy]);

  async function loadShopsAndCategories() {
    try {
      setLoading(true);

      // Load categories
      const allCategories = await getCategories();
      setCategories(allCategories);

      // Get user location or use default
      let userShops: Shop[] = [];
      try {
        const location = await getUserLocation();
        userShops = await getShopsNearby(location.latitude, location.longitude, 10);
      } catch {
        // Fallback to all shops if geolocation fails
        const category = searchParams.get('category');
        if (category) {
          userShops = await getShopsByCategory(category);
        } else {
          // Get a reasonable default set of shops (e.g., all shops)
          userShops = await getShopsNearby(28.6139, 77.2090, 50); // Delhi center with large radius
        }
      }

      setShops(userShops);
    } catch (error) {
      console.error('Error loading shops:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let result = [...shops];

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter((shop) =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((shop) => shop.category === selectedCategory);
    }

    // Rating filter
    if (ratingFilter) {
      result = result.filter((shop) => shop.avg_rating >= ratingFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.avg_rating - a.avg_rating;
      } else if (sortBy === 'time') {
        return a.delivery_time_max - b.delivery_time_max;
      }
      return 0;
    });

    setFilteredShops(result);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Search Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-4 items-center">
              <Input
                type="text"
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-10"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div
              className={`${
                showFilters ? 'block' : 'hidden'
              } md:block w-full md:w-64 flex-shrink-0`}
            >
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-32">
                <div className="flex justify-between items-center mb-4 md:hidden">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={ratingFilter === null}
                        onChange={() => setRatingFilter(null)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">All Ratings</span>
                    </label>
                    {[4, 3.5, 3, 2].map((rating) => (
                      <label key={rating} className="flex items-center">
                        <input
                          type="radio"
                          checked={ratingFilter === rating}
                          onChange={() => setRatingFilter(rating)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">★ {rating}+</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rating">Top Rated</option>
                    <option value="time">Fastest Delivery</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedCategory || ratingFilter) && (
                  <Button
                    variant="outline"
                    className="w-full mt-6"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                      setRatingFilter(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Shops Grid */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCategory ? `${selectedCategory} Shops` : 'All Shops'}
                </h1>
                <p className="text-gray-600">
                  Found {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
                  ))}
                </div>
              ) : filteredShops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredShops.map((shop) => (
                    <Link
                      key={shop.id}
                      href={`/shops/${shop.id}`}
                      className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition overflow-hidden group"
                    >
                      <div className="h-40 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-green-200 transition">
                        <div className="text-4xl font-bold text-blue-600 opacity-30">
                          {shop.name.charAt(0)}
                        </div>
                      </div>

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
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-1">{shop.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {shop.delivery_time_min}-{shop.delivery_time_max} min
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">
                              {shop.avg_rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-600">({shop.total_reviews})</span>
                          </div>
                          <span className="text-blue-600 hover:text-blue-700 font-semibold">
                            View →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No shops found matching your criteria</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                      setRatingFilter(null);
                    }}
                  >
                    Clear Filters & Try Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
