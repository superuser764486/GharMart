'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  unhelpful_count: number;
  customer_name: string;
  created_at: string;
}

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [ratingFilter, setRatingFilter] = useState('');
  const [votingReviewId, setVotingReviewId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const limit = 5;

  useEffect(() => {
    fetchReviews();
  }, [page, sortBy, ratingFilter]);

  async function fetchReviews() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      params.set('offset', (page * limit).toString());
      params.set('sortBy', sortBy);
      if (ratingFilter) params.set('rating', ratingFilter);

      const response = await fetch(`/api/products/${productId}/reviews?${params}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(reviewId: string, voteType: 'helpful' | 'unhelpful') {
    try {
      setVotingReviewId(reviewId);
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local vote state
        const newVotes = { ...userVotes };
        if (userVotes[reviewId] === voteType) {
          delete newVotes[reviewId];
        } else {
          newVotes[reviewId] = voteType;
        }
        setUserVotes(newVotes);

        // Update review counts
        setReviews(prevReviews =>
          prevReviews.map(r =>
            r.id === reviewId
              ? {
                  ...r,
                  helpful_count: data.helpful_count,
                  unhelpful_count: data.unhelpful_count,
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVotingReviewId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-20 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by rating</label>
          <select
            value={ratingFilter}
            onChange={e => {
              setRatingFilter(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
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
                    {review.verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <p className="font-semibold text-gray-900">{review.title}</p>
                  )}
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-3">{review.comment}</p>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-900">{review.customer_name}</p>
                  <p>{new Date(review.created_at).toLocaleDateString()}</p>
                </div>

                {/* Helpful buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote(review.id, 'helpful')}
                    disabled={votingReviewId === review.id}
                    className={`flex items-center gap-1 px-3 py-1 rounded border transition ${
                      userVotes[review.id] === 'helpful'
                        ? 'bg-blue-50 border-blue-300 text-blue-600'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {votingReviewId === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ThumbsUp className="w-4 h-4" />
                    )}
                    {review.helpful_count}
                  </button>

                  <button
                    onClick={() => handleVote(review.id, 'unhelpful')}
                    disabled={votingReviewId === review.id}
                    className={`flex items-center gap-1 px-3 py-1 rounded border transition ${
                      userVotes[review.id] === 'unhelpful'
                        ? 'bg-red-50 border-red-300 text-red-600'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {votingReviewId === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ThumbsDown className="w-4 h-4" />
                    )}
                    {review.unhelpful_count}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center gap-2">
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
  );
}
