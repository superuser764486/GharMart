import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError, logVendorActivity } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/products
 * List vendor's products with pagination and filtering
 * Authorization: Bearer <token>
 * Query params: page=1, limit=20, status=all|approved|pending|rejected
 */

export async function GET(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status') || 'all';

    const offset = (page - 1) * limit;

    // Build query based on status filter
    let whereClause = 'WHERE vendor_id = $1';
    const params = [vendor.vendorId];

    if (status !== 'all') {
      whereClause += ` AND moderation_status = $${params.length + 1}`;
      params.push(status);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Get paginated products
    const productsResult = await query(
      `SELECT id, name, description, price, original_price, image_url, category, 
              stock, rating, reviews_count, moderation_status, created_at
       FROM products
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return apiSuccess(
      {
        products: productsResult.rows.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: parseFloat(p.price),
          original_price: p.original_price ? parseFloat(p.original_price) : null,
          image_url: p.image_url,
          category: p.category,
          stock: parseInt(p.stock),
          rating: parseFloat(p.rating || 0),
          reviews_count: parseInt(p.reviews_count || 0),
          status: p.moderation_status,
          created_at: p.created_at,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      200
    );
  } catch (error) {
    console.error('[v0] List products error:', error);
    return apiError(500, 'Failed to fetch products');
  }
}

/**
 * POST /api/vendor/products
 * Create a new product
 * Authorization: Bearer <token>
 */

export async function POST(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      original_price,
      image_url,
      category,
      stock,
    } = body;

    // Validation
    if (!name || !description || !price || !category || stock === undefined) {
      return apiError(400, 'Missing required fields');
    }

    if (parseFloat(price) <= 0) {
      return apiError(400, 'Price must be greater than 0');
    }

    if (parseInt(stock) < 0) {
      return apiError(400, 'Stock cannot be negative');
    }

    // Create product
    const result = await query(
      `INSERT INTO products (vendor_id, name, description, price, original_price, 
                             image_url, category, stock, moderation_status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING id, name, price, category, stock, moderation_status, created_at`,
      [
        vendor.vendorId,
        name,
        description,
        parseFloat(price),
        original_price ? parseFloat(original_price) : null,
        image_url || null,
        category,
        parseInt(stock),
        'pending', // Default status - awaiting moderation
      ]
    );

    const product = result.rows[0];

    // Log activity
    await logVendorActivity(vendor.vendorId, 'product_created', {
      product_id: product.id,
      name,
      category,
    });

    return apiSuccess(
      {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        category: product.category,
        stock: parseInt(product.stock),
        status: product.moderation_status,
        message: 'Product created successfully. Awaiting moderation approval.',
      },
      201
    );
  } catch (error) {
    console.error('[v0] Create product error:', error);
    return apiError(500, 'Failed to create product');
  }
}
