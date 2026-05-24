import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { voteType } = await request.json();

    if (!['helpful', 'unhelpful'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    // Check if review exists
    const reviewCheck = await query(
      'SELECT id FROM product_reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if customer already voted
    const existingVote = await query(
      'SELECT vote_type FROM review_votes WHERE review_id = $1 AND customer_id = $2',
      [reviewId, payload.userId]
    );

    if (existingVote.rows.length > 0) {
      const previousVote = existingVote.rows[0].vote_type;

      if (previousVote === voteType) {
        // Remove vote (toggle off)
        await query(
          'DELETE FROM review_votes WHERE review_id = $1 AND customer_id = $2',
          [reviewId, payload.userId]
        );

        // Update review count
        if (voteType === 'helpful') {
          await query(
            'UPDATE product_reviews SET helpful_count = GREATEST(0, helpful_count - 1) WHERE id = $1',
            [reviewId]
          );
        } else {
          await query(
            'UPDATE product_reviews SET unhelpful_count = GREATEST(0, unhelpful_count - 1) WHERE id = $1',
            [reviewId]
          );
        }
      } else {
        // Change vote (switch from one to another)
        await query(
          'UPDATE review_votes SET vote_type = $1 WHERE review_id = $2 AND customer_id = $3',
          [voteType, reviewId, payload.userId]
        );

        // Update review counts
        if (previousVote === 'helpful') {
          await query(
            'UPDATE product_reviews SET helpful_count = GREATEST(0, helpful_count - 1), unhelpful_count = unhelpful_count + 1 WHERE id = $1',
            [reviewId]
          );
        } else {
          await query(
            'UPDATE product_reviews SET unhelpful_count = GREATEST(0, unhelpful_count - 1), helpful_count = helpful_count + 1 WHERE id = $1',
            [reviewId]
          );
        }
      }
    } else {
      // Add new vote
      await query(
        'INSERT INTO review_votes (review_id, customer_id, vote_type) VALUES ($1, $2, $3)',
        [reviewId, payload.userId, voteType]
      );

      // Update review count
      if (voteType === 'helpful') {
        await query(
          'UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = $1',
          [reviewId]
        );
      } else {
        await query(
          'UPDATE product_reviews SET unhelpful_count = unhelpful_count + 1 WHERE id = $1',
          [reviewId]
        );
      }
    }

    // Get updated review
    const updatedReview = await query(
      'SELECT helpful_count, unhelpful_count FROM product_reviews WHERE id = $1',
      [reviewId]
    );

    return NextResponse.json({
      helpful_count: updatedReview.rows[0].helpful_count,
      unhelpful_count: updatedReview.rows[0].unhelpful_count,
    });
  } catch (error) {
    console.error('Failed to process vote:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}
