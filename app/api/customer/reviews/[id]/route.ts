import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// DELETE review
export async function DELETE(
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

    // Check if review exists and belongs to customer
    const reviewCheck = await query(
      'SELECT id FROM product_reviews WHERE id = $1 AND customer_id = $2',
      [reviewId, payload.userId]
    );

    if (reviewCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Delete review (cascade will delete votes)
    await query('DELETE FROM product_reviews WHERE id = $1', [reviewId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
