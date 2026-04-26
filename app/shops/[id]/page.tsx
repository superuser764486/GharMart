'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shop, Product, Review } from '@/lib/supabase';
import { getShop } from '@/lib/shops';
import { getShopProducts } from '@/lib/products';
import { getShopReviews, createReview } from '@/lib/reviews';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/supabase';
import { Star, MapPin, Clock, ChevronDown, ShoppingCart, AlertCircle } from 'lucide-react';

export default function ShopDetailPage() {
  const { id } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<Map<string, number>>(new Map());
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadShopData();
    checkUser();
  }, [id]);

  async function loadShopData() {
    try {
      setLoading(true);
      const shopData = await getShop(id as string);
      setShop(shopData);

      if (shopData) {
        const [productsData, reviewsData] = await Promise.all([
          getShopProducts(shopData.id),
          getShopReviews(shopData.id),
        ]);
        setProducts(productsData);
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Error loading shop:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    }
  }

  function addToCart(productId: string) {
    setCartItems((prev) => {
      const newCart = new Map(prev);
      newCart.set(productId, (newCart.get(productId) || 0) + 1);
      return newCart;
    });
  }

  function removeFromCart(productId: string) {
    setCartItems((prev) => {
      const newCart = new Map(prev);
      const qty = newCart.get(productId) || 0;
      if (qty <= 1) {
        newCart.delete(productId);
      } else {
        newCart.set(productId, qty - 1);
      }
      return newCart;
    });
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewError('');

    if (!user) {
      setReviewError('Please sign in to leave a review');
      return;
    }

    if (!shop) return;

    try {
      setSubmittingReview(true);
      await createReview(shop.id, user.id, reviewRating, reviewComment);
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
      // Reload reviews
      const updatedReviews = await getShopReviews(shop.id);
      setReviews(updatedReviews);
    } catch (error: any) {
      setReviewError(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-200 rounded-lg h-96 animate-pulse" />
          </div>
        </main>
      </>
    );
  }

  if (!shop) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600">Shop not found</p>
            <Link href="/shops">
              <Button className="mt-4">Back to Shops</Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  const cartTotal = Array.from(cartItems.entries()).reduce((sum, [productId, qty]) => {
    const product = products.find((p) => p.id === productId);
    return sum + (product?.price || 0) * qty;
  }, 0);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Shop Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.name}</h1>
                <p className="text-gray-600 text-lg mb-4">{shop.category}</p>

                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{shop.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>
                      {shop.delivery_time_min}-{shop.delivery_time_max} min delivery
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span>
                      {shop.avg_rating.toFixed(1)} ({shop.total_reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {shop.is_new && (
                <span className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded">
                  New Shop
                </span>
              )}
            </div>

            {shop.description && (
              <p className="text-gray-600 text-base border-t pt-6">{shop.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>

                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {products.map((product) => {
                      const quantity = cartItems.get(product.id) || 0;
                      return (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="aspect-square bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-3xl font-bold text-blue-600 opacity-30">
                              {product.name.charAt(0)}
                            </span>
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                          )}

                          <div className="flex justify-between items-end mb-4">
                            <span className="text-xl font-bold text-gray-900">
                              ₹{product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {product.quantity} available
                            </span>
                          </div>

                          {quantity > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(product.id)}
                              >
                                −
                              </Button>
                              <span className="flex-1 text-center font-semibold">{quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(product.id)}
                              >
                                +
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                              onClick={() => addToCart(product.id)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">No products available</p>
                )}
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

                {!showReviewForm ? (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="w-full mb-6 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    Leave a Review
                  </Button>
                ) : (
                  <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-lg">
                    {reviewError && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700">{reviewError}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className={`text-3xl transition ${
                              star <= reviewRating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Comment
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewComment('');
                          setReviewRating(5);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex gap-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cart Sidebar */}
            <div>
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Shopping Cart</h3>

                {cartItems.size > 0 ? (
                  <>
                    <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                      {Array.from(cartItems.entries()).map(([productId, qty]) => {
                        const product = products.find((p) => p.id === productId);
                        if (!product) return null;
                        return (
                          <div key={productId} className="flex justify-between text-sm">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-gray-600">₹{product.price.toFixed(2)} × {qty}</p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              ₹{(product.price * qty).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-semibold">Free</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <Link href={`/checkout?shop=${shop.id}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                        Proceed to Checkout
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => setCartItems(new Map())}
                    >
                      Clear Cart
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-600 text-center py-8">Your cart is empty</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
