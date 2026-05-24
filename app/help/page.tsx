'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Search, BookOpen, ShoppingBag, Truck, RefreshCw, Shield, HelpCircle } from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const articles = [
    {
      category: 'getting-started',
      icon: BookOpen,
      title: 'Getting Started with GharMart',
      excerpt: 'Learn how to create an account, browse products, and make your first purchase.',
      content: `
        Welcome to GharMart! Here's how to get started:
        
        1. Create an Account
        - Visit GharMart.com and click "Sign Up"
        - Enter your email and create a secure password
        - Verify your email with the OTP sent to your inbox
        - Complete your profile with name and phone number
        
        2. Browse Products
        - Use the search bar or category filters
        - Click on products to view details
        - Check product ratings and customer reviews
        
        3. Make Your First Order
        - Add items to your cart
        - Proceed to checkout
        - Select delivery address
        - Choose payment method
        - Confirm your order
        
        4. Track Your Order
        - Go to "My Orders" to see all purchases
        - Click on any order to track in real-time
      `,
    },
    {
      category: 'shopping',
      icon: ShoppingBag,
      title: 'How to Shop & Add Items to Cart',
      excerpt: 'Step-by-step guide to finding and purchasing products on GharMart.',
      content: `
        Shopping on GharMart is easy and secure:
        
        1. Browse Products
        - Use categories or search for specific items
        - Filter by price, rating, or availability
        - Click a product to see details and reviews
        
        2. Add to Cart
        - Select quantity
        - Add any optional items
        - Click "Add to Cart"
        
        3. Manage Cart
        - View all items in your cart
        - Update quantities
        - Remove items you don't want
        - See total price and estimated delivery
        
        4. Apply Promo Codes
        - Enter discount codes at checkout
        - View savings before confirming
        
        5. Save Items for Later
        - Click the heart icon to add to wishlist
        - Access wishlist from your profile
      `,
    },
    {
      category: 'delivery',
      icon: Truck,
      title: 'Delivery & Shipping Information',
      excerpt: 'Everything you need to know about shipping, delivery times, and tracking.',
      content: `
        We deliver fast and reliably:
        
        1. Delivery Times
        - Standard Delivery: 2-3 business days
        - Express Delivery: 1-2 business days
        - Same-Day Delivery: Available in select areas (Prime Plus)
        - Orders placed before 12 PM usually ship same day
        
        2. Delivery Charges
        - Standard: ₹40 per order
        - Express: ₹100 per order
        - Free for Prime members (eligible orders)
        - Free for all orders (Prime Plus members)
        
        3. Track Your Order
        - Go to "My Orders"
        - Click on any order to see real-time tracking
        - Delivery partner contact info available
        
        4. Delivery Address
        - Must provide complete address
        - Include apartment/house number
        - Provide phone number for delivery coordination
        
        5. Delivery Issues
        - Order not arrived? Contact support
        - Address correction before delivery possible
        - Reschedule delivery at checkout
      `,
    },
    {
      category: 'returns',
      icon: RefreshCw,
      title: 'Returns & Refunds Policy',
      excerpt: 'How to return items and get refunds quickly.',
      content: `
        Easy returns and fast refunds:
        
        1. Return Eligibility
        - 7 days from delivery (Basic plan)
        - 10 days from delivery (Prime plan)
        - 15 days from delivery (Prime Plus plan)
        - Items must be unused in original packaging
        
        2. Non-Returnable Items
        - Perishable goods
        - Custom/personalized items
        - Clearance items
        - Damaged due to misuse
        
        3. How to Initiate Return
        - Go to "My Orders"
        - Click on the order
        - Select items to return
        - Choose reason for return
        - Print return label
        - Schedule pickup or drop-off
        
        4. Refund Timeline
        - Refunds processed within 5-7 business days
        - Original payment method receives refund
        - Tracking available for return shipment
        
        5. Exchange
        - Exchange for different size/color available
        - No shipping charges for exchanges
        - Get replacement in 3-5 days
      `,
    },
    {
      category: 'payment',
      icon: Shield,
      title: 'Payment Methods & Security',
      excerpt: 'Safe payment options and how we protect your financial information.',
      content: `
        Secure payments, multiple options:
        
        1. Accepted Payment Methods
        - Credit Cards (Visa, Mastercard, Amex)
        - Debit Cards
        - UPI (Google Pay, PhonePe, Paytm)
        - Mobile Wallets
        - Net Banking
        - Cash on Delivery (select areas)
        
        2. Payment Security
        - SSL encryption for all transactions
        - PCI-DSS compliant payment processing
        - We never store full credit card numbers
        - Razorpay secured payment gateway
        
        3. Transaction Issues
        - Payment failed but amount deducted?
          Contact support, refund within 24 hours
        - Fraud detection: Account locked for protection
        - Unauthorized transaction: Report immediately
        
        4. EMI Options
        - Available for orders above ₹5,000
        - 3, 6, or 12 month plans available
        - Select during checkout
        
        5. Subscription Payments
        - Auto-renewal for Prime subscriptions
        - Cancel anytime from settings
        - Billing emails sent before renewal
      `,
    },
    {
      category: 'account',
      icon: HelpCircle,
      title: 'Account Management & Security',
      excerpt: 'Manage your profile, password, and account security.',
      content: `
        Keep your account safe and up to date:
        
        1. Update Profile
        - Go to Account Settings
        - Edit name, phone, email
        - Update profile picture
        - Changes take effect immediately
        
        2. Manage Addresses
        - Add multiple delivery addresses
        - Set default address
        - Edit existing addresses
        - Delete old addresses
        
        3. Change Password
        - Go to Security Settings
        - Enter current password
        - Set new secure password (min 8 characters)
        - Update on all devices
        
        4. Two-Factor Authentication
        - Add extra security to your account
        - Verify login with OTP
        - Recommended for accounts with saved cards
        
        5. Delete Account
        - Permanently delete your account
        - All personal data removed
        - Cannot be undone
        - Contact support for assistance
        
        6. Privacy Settings
        - Control review visibility
        - Manage email preferences
        - See what data we have
      `,
    },
    {
      category: 'reviews',
      icon: BookOpen,
      title: 'How to Leave Reviews & Ratings',
      excerpt: 'Share your experience and help other customers make informed decisions.',
      content: `
        Your reviews help the community:
        
        1. Eligibility
        - Must have purchased the product
        - Must be verified purchase
        - Can review once per product
        
        2. Leave a Review
        - Go to "My Orders"
        - Find purchased item
        - Click "Write Review"
        - Rate 1-5 stars
        - Add written review (optional)
        - Upload photos (optional)
        
        3. Review Guidelines
        - Be honest and fair
        - Share your genuine experience
        - Be respectful to sellers
        - No spam, no offensive content
        - No promotional links
        
        4. Edit or Delete Reviews
        - You can edit within 30 days
        - Delete your review anytime
        - Others cannot modify your reviews
        
        5. Helpful Votes
        - Click "Helpful" if review was useful
        - Best reviews appear first
        - Your feedback drives quality
      `,
    },
    {
      category: 'membership',
      icon: ShoppingBag,
      title: 'Prime Membership Benefits',
      excerpt: 'Everything included in Prime and Prime Plus memberships.',
      content: `
        Membership benefits:
        
        1. Prime Membership (₹99/month)
        - Free delivery on eligible orders (₹500+)
        - Express delivery (1-2 days)
        - Early access to deals
        - 5% extra discount on all orders
        - 10-day return window
        - Priority customer support
        
        2. Prime Plus Membership (₹999/year)
        - Everything in Prime
        - Free delivery on ALL orders
        - Same-day delivery available
        - 5-10% discount on all orders
        - 15-day return window
        - 24/7 VIP customer support
        - Birthday month bonus (₹500)
        
        3. Manage Membership
        - View active membership
        - Upgrade or downgrade anytime
        - Cancel anytime (no penalties)
        - Auto-renewal in settings
        
        4. Exclusive Deals
        - Member-only sales
        - Early access to new products
        - Flash deals and promotions
        
        5. Track Benefits
        - See total savings in dashboard
        - Lifetime membership value
      `,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Articles', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'returns', label: 'Returns', icon: RefreshCw },
    { id: 'payment', label: 'Payment', icon: Shield },
    { id: 'account', label: 'Account', icon: HelpCircle },
    { id: 'reviews', label: 'Reviews', icon: BookOpen },
    { id: 'membership', label: 'Membership', icon: ShoppingBag },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-blue-100 max-w-2xl">
              Find answers to common questions and learn how to make the most of GharMart.
            </p>

            {/* Search */}
            <div className="mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex overflow-x-auto gap-2 pb-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Articles Grid */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, idx) => {
                const Icon = article.icon;
                return (
                  <details key={idx} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <summary className="p-6 cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-start gap-4">
                        <Icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
                          <p className="text-sm text-gray-600">{article.excerpt}</p>
                        </div>
                      </div>
                    </summary>
                    <div className="px-6 pb-6 border-t bg-gray-50">
                      <div className="prose prose-sm max-w-none">
                        {article.content.split('\n').map((line, i) => {
                          if (!line.trim()) return null;
                          if (line.match(/^\d+\./)) {
                            return (
                              <p key={i} className="font-semibold text-gray-900 mt-4 mb-2">
                                {line}
                              </p>
                            );
                          }
                          if (line.match(/^-/)) {
                            return (
                              <li key={i} className="text-gray-700 ml-4">
                                {line.replace(/^-\s*/, '')}
                              </li>
                            );
                          }
                          return (
                            <p key={i} className="text-gray-700">
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>

        {/* Contact Support */}
        <section className="bg-white border-t py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still need help?</h2>
            <p className="text-gray-600 text-lg mb-8">
              Can&apos;t find the answer you&apos;re looking for? Our support team is ready to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Contact Support
              </a>
              <a href="mailto:support@gharmart.com" className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                Email Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
