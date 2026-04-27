import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : 0;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : 999999;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = (page - 1) * limit;
    const sort = searchParams.get('sort') || 'newest';

    let whereConditions = ['p.is_active = true'];
    let params: any[] = [];

    // Search filter
    if (search) {
      whereConditions.push(`(p.name ILIKE $${whereConditions.length + 1} OR p.description ILIKE $${whereConditions.length + 1})`);
      params.push(`%${search}%`);
    }

    // Category filter
    if (category) {
      whereConditions.push(`c.slug = $${whereConditions.length + 1}`);
      params.push(category);
    }

    // Price range filter
    whereConditions.push(`p.price >= $${whereConditions.length + 1}`);
    params.push(minPrice);
    whereConditions.push(`p.price <= $${whereConditions.length + 1}`);
    params.push(maxPrice);

    // Order by sort
    let orderBy = 'p.created_at DESC';
    if (sort === 'price_low') orderBy = 'p.price ASC';
    else if (sort === 'price_high') orderBy = 'p.price DESC';
    else if (sort === 'popular') orderBy = 'p.rating DESC, p.review_count DESC';
    else if (sort === 'rating') orderBy = 'p.rating DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereConditions.join(' AND ')}`,
      params
    );

    const total = countResult.rows[0].count;

    // Get products
    const productsResult = await query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.discount_percentage,
              p.image_url, p.rating, p.review_count, p.stock_quantity, p.category_id,
              c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY ${orderBy}
       LIMIT $${whereConditions.length + 1} OFFSET $${whereConditions.length + 2}`,
      [...params, limit, offset]
    );

    return NextResponse.json(
      {
        success: true,
        products: productsResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
