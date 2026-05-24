import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, helpful, rating-high, rating-low
    const ratingFilter = searchParams.get('rating'); // 1-5

    // Build query
    let whereClause = 'WHERE pr.product_id = $1 AND pr.moderation_status = $2';
    const params_list: any[] = [productId, 'approved'];
    let paramCount = 3;

    if (ratingFilter) {
      whereClause += ` AND pr.rating = $${paramCount}`;
      params_list.push(parseInt(ratingFilter));
      paramCount++;
    }

    // Determine sort order
    let orderByClause = 'ORDER BY pr.created_at DESC';
    if (sortBy === 'helpful') {
      orderByClause = 'ORDER BY pr.helpful_count DESC, pr.created_at DESC';
    } else if (sortBy === 'rating-high') {
      orderByClause = 'ORDER BY pr.rating DESC, pr.created_at DESC';
    } else if (sortBy === 'rating-low') {
      orderByClause = 'ORDER BY pr.rating ASC, pr.created_at DESC';
    }

    // Get reviews with customer info
    const result = await query(
      `SELECT pr.id, pr.product_id, pr.customer_id, pr.rating, pr.title, pr.comment,
              pr.verified_purchase, pr.photo_urls, pr.helpful_count, pr.unhelpful_count,
              pr.created_at, u.name as customer_name
       FROM product_reviews pr
       LEFT JOIN users u ON pr.customer_id = u.id
       ${whereClause}
       ${orderByClause}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params_list, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM product_reviews WHERE product_id = $1 AND moderation_status = $2`,
      [productId, 'approved']
    );

    // Get rating distribution
    const ratingDistResult = await query(
      `SELECT rating, COUNT(*) as count
       FROM product_reviews
       WHERE product_id = $1 AND moderation_status = $2
       GROUP BY rating
       ORDER BY rating DESC`,
      [productId, 'approved']
    );

    // Build rating distribution
    const ratingDist = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    ratingDistResult.rows.forEach((row: any) => {
      ratingDist[row.rating as keyof typeof ratingDist] = parseInt(row.count);
    });

    // Calculate average rating
    const avgResult = await query(
      `SELECT AVG(rating) as avg_rating FROM product_reviews WHERE product_id = $1 AND moderation_status = $2`,
      [productId, 'approved']
    );
    const avgRating = avgResult.rows[0]?.avg_rating ? parseFloat(avgResult.rows[0].avg_rating).toFixed(1) : '0';

    return NextResponse.json({
      reviews: result.rows,
      total: parseInt(countResult.rows[0]?.count || '0'),
      averageRating: avgRating,
      ratingDistribution: ratingDist,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
