import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.discount_percentage,
              p.image_url, p.rating, p.review_count, p.stock_quantity, p.category_id,
              p.sku, p.specifications, p.created_at, p.updated_at,
              c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.is_active = true`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = result.rows[0];

    // Get related products (same category)
    const relatedResult = await query(
      `SELECT p.id, p.name, p.slug, p.price, p.discount_percentage,
              p.image_url, p.rating, p.review_count
       FROM products p
       WHERE p.category_id = $1 AND p.id != $2 AND p.is_active = true
       LIMIT 4`,
      [product.category_id, params.id]
    );

    return NextResponse.json(
      {
        success: true,
        product,
        relatedProducts: relatedResult.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
