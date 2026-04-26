'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Category } from '@/lib/supabase';
import { getCategories } from '@/lib/shops';
import { Grid3X3, ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const allCategories = await getCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h1>
            <p className="text-lg text-gray-600">Browse shops in your favorite categories</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-40 animate-pulse" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shops?category=${category.name}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition p-6 h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:from-blue-200 group-hover:to-green-200 transition">
                      {category.icon_url ? (
                        <img
                          src={category.icon_url}
                          alt={category.name}
                          className="w-10 h-10"
                        />
                      ) : (
                        <Grid3X3 className="w-8 h-8 text-blue-600" />
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition mb-2">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {category.description}
                      </p>
                    )}

                    <span className="text-blue-600 group-hover:text-blue-700 font-semibold text-sm flex items-center gap-1 mt-auto">
                      Browse <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No categories available</p>
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Can&apos;t find what you&apos;re looking for?</h2>
            <p className="text-gray-600 mb-6">Search for shops directly or browse all available shops</p>
            <Link href="/shops">
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                Search All Shops
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
