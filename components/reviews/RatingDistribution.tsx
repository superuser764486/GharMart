'use client';

import { Star } from 'lucide-react';

interface RatingDistributionProps {
  averageRating: string;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  totalReviews: number;
}

export default function RatingDistribution({
  averageRating,
  distribution,
  totalReviews,
}: RatingDistributionProps) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Customer Reviews</h3>

      {/* Average rating display */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <div className="flex items-end gap-4 mb-4">
          <div className="text-5xl font-bold text-gray-900">{averageRating}</div>
          <div>
            <div className="flex gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(parseFloat(averageRating))
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">{totalReviews} reviews</p>
          </div>
        </div>
      </div>

      {/* Rating bars */}
      <div className="space-y-4">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = distribution[rating as keyof typeof distribution];
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-3">
              {/* Rating label */}
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium text-gray-700">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>

              {/* Progress bar */}
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full transition-all"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              {/* Count */}
              <div className="text-sm text-gray-600 w-10 text-right">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
