'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Star, AlertCircle, Clock, CheckCircle, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CustomerReview {
  id: string;
  product_id: string;
  product_name: string;
  image_url: string;
  rating: number;
  title?: string;
  comment: string;
  helpful_count: number;
  unhelpful_count: number;
  moderation_status: string;
  created_at: string;
}

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const limit = 10;

  useEffect(() => {
    fetchReviews();
  }, [page]);

  async function fetchReviews() {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `/api/customer/reviews?limit=${limit}&offset=${page * limit}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      setReviews(data.reviews);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      setDeletingId(reviewId);
      const response = await fetch(`/api/customer/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      setReviews(reviews.filter(r => r.id !== reviewId));
      setTotal(total - 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
            <Clock className="w-3 h-3" />
            Pending Approval
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
            <AlertCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/customer/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
            <p className="text-gray-600 mt-1">Manage and track all your product reviews</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-20 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-2">No reviews yet</h2>
              <p className="text-gray-600 mb-6">
                Once you purchase and receive products, you can leave reviews to help other
                customers.
              </p>
              <Link href="/products">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div
                  key={review.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  {/* Product header */}
                  <div className="flex gap-4 mb-4 pb-4 border-b border-gray-200">
                    {review.image_url && (
                      <img
                        src={review.image_url}
                        alt={review.product_name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{review.product_name}</h3>
                      <div className="mt-2 flex items-center gap-2">
                        {getStatusBadge(review.moderation_status)}
                        <span className="text-xs text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review content */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
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
                      <span className="text-sm font-medium text-gray-700">{review.rating} out of 5</span>
                    </div>

                    {review.title && (
                      <p className="font-medium text-gray-900 mb-1">{review.title}</p>
                    )}
                    <p className="text-gray-700">{review.comment}</p>
                  </div>

                  {/* Helpful count */}
                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    <span>{review.helpful_count} found this helpful</span>
                    <span>{review.unhelpful_count} didn&apos;t find it helpful</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" disabled className="gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === review.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && total > limit && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                variant="outline"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
                  <Button
                    key={i}
                    onClick={() => setPage(i)}
                    variant={page === i ? 'default' : 'outline'}
                    className={page === i ? 'bg-blue-600' : ''}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => setPage(Math.min(Math.ceil(total / limit) - 1, page + 1))}
                disabled={page >= Math.ceil(total / limit) - 1}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
