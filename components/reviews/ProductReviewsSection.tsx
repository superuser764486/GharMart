'use client';

import { useState, useEffect } from 'react';
import RatingDistribution from './RatingDistribution';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';

interface ReviewData {
  reviews: any[];
  total: number;
  averageRating: string;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductReviewsSectionProps {
  productId: string;
}

export default function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviewData();
  }, [productId]);

  async function fetchReviewData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/reviews?limit=1`);
      const data = await response.json();
      setReviewData(data);
    } catch (error) {
      console.error('Failed to fetch review data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleReviewSuccess = () => {
    setShowForm(false);
    fetchReviewData();
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
        <p className="text-gray-600">
          {reviewData?.total === 0
            ? 'No reviews yet'
            : `${reviewData?.total} customer reviews`}
        </p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Rating distribution */}
        <div className="lg:col-span-1">
          <RatingDistribution
            averageRating={reviewData?.averageRating || '0'}
            distribution={
              reviewData?.ratingDistribution || {
                5: 0,
                4: 0,
                3: 0,
                2: 0,
                1: 0,
              }
            }
            totalReviews={reviewData?.total || 0}
          />
        </div>

        {/* Right: Reviews and form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Review form toggle */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Write a Review
            </button>
          )}

          {/* Review form */}
          {showForm && (
            <div className="space-y-4">
              <ReviewForm productId={productId} onSuccess={handleReviewSuccess} />
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Reviews list */}
          <ReviewList productId={productId} />
        </div>
      </div>
    </div>
  );
}
