import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// GET customer's reviews
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await query(
      `SELECT pr.id, pr.product_id, pr.rating, pr.title, pr.comment,
              pr.helpful_count, pr.unhelpful_count, pr.moderation_status,
              pr.created_at, p.name as product_name, p.image_url
       FROM product_reviews pr
       LEFT JOIN products p ON pr.product_id = p.id
       WHERE pr.customer_id = $1
       ORDER BY pr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [payload.userId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as count FROM product_reviews WHERE customer_id = $1',
      [payload.userId]
    );

    return NextResponse.json({
      reviews: result.rows,
      total: parseInt(countResult.rows[0]?.count || '0'),
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch customer reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST new review
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { productId, rating, title, comment, photoUrls = [] } = await request.json();

    // Validation
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    if (comment && comment.length > 500) {
      return NextResponse.json(
        { error: 'Comment must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Check if product exists
    const productCheck = await query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check for existing review (one per customer per product)
    const existingReview = await query(
      'SELECT id FROM product_reviews WHERE product_id = $1 AND customer_id = $2',
      [productId, payload.userId]
    );

    if (existingReview.rows.length > 0) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 409 }
      );
    }

    // Check for verified purchase
    const purchaseCheck = await query(
      `SELECT o.id FROM orders o
       INNER JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_id = $1 AND oi.product_id = $2 AND o.status IN ('paid', 'shipped', 'delivered')
       LIMIT 1`,
      [payload.userId, productId]
    );

    const isVerifiedPurchase = purchaseCheck.rows.length > 0;
    const orderId = purchaseCheck.rows[0]?.id || null;

    // Create review
    const result = await query(
      `INSERT INTO product_reviews 
       (product_id, customer_id, order_id, rating, title, comment, verified_purchase, photo_urls)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, product_id, rating, title, comment, verified_purchase, created_at`,
      [
        productId,
        payload.userId,
        orderId,
        rating,
        title || null,
        comment || null,
        isVerifiedPurchase,
        photoUrls,
      ]
    );

    return NextResponse.json({ review: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
