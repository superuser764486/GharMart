'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Bell, ShoppingCart, LogOut, Menu, X } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="hidden sm:inline">GharMart</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shops" className="text-gray-700 hover:text-blue-600 transition">
              Search Shops
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 transition">
              Categories
            </Link>
            <Link href="/#why-choose" className="text-gray-700 hover:text-blue-600 transition">
              About
            </Link>
            <Link href="/#contact" className="text-gray-700 hover:text-blue-600 transition">
              Contact
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="relative"
                    >
                      <Link href="/notifications">
                        <Bell className="w-5 h-5" />
                      </Link>
                    </Button>

                    {user.user_type === 'customer' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link href="/cart">
                          <ShoppingCart className="w-5 h-5" />
                        </Link>
                      </Button>
                    )}

                    <div className="hidden sm:flex items-center gap-2">
                      <Link
                        href={
                          user.user_type === 'customer'
                            ? '/profile'
                            : user.user_type === 'vendor'
                            ? '/vendor/dashboard'
                            : '/admin/dashboard'
                        }
                        className="text-sm text-gray-700 hover:text-blue-600"
                      >
                        {user.name}
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                      className="md:hidden"
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      {menuOpen ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Menu className="w-5 h-5" />
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      asChild
                      className="hidden sm:inline-flex"
                    >
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    >
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>

                    {/* Mobile Menu Button */}
                    <button
                      className="md:hidden"
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      {menuOpen ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Menu className="w-5 h-5" />
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4 border-t pt-4">
            <Link
              href="/shops"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMenuOpen(false)}
            >
              Search Shops
            </Link>
            <Link
              href="/categories"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/#why-choose"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            {user && (
              <>
                <Link
                  href={
                    user.user_type === 'customer'
                      ? '/profile'
                      : user.user_type === 'vendor'
                      ? '/vendor/dashboard'
                      : '/admin/dashboard'
                  }
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  {user.name}
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
