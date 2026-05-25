import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError, logVendorActivity } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/promotions
 * Get vendor's promotions/coupons
 * Authorization: Bearer <token>
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

    // Build query
    let whereClause = 'WHERE vendor_id = $1';
    const params = [vendor.vendorId];

    if (status !== 'all') {
      whereClause += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    // Get total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM promotions_coupons ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Get promotions
    const promotionsResult = await query(
      `SELECT id, code, description, type, discount_value, max_uses, current_uses,
              min_order_value, valid_from, valid_until, status, created_at
       FROM promotions_coupons
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return apiSuccess(
      {
        promotions: promotionsResult.rows.map(p => ({
          id: p.id,
          code: p.code,
          description: p.description,
          type: p.type,
          discount_value: parseFloat(p.discount_value),
          max_uses: parseInt(p.max_uses),
          current_uses: parseInt(p.current_uses),
          min_order_value: parseFloat(p.min_order_value),
          valid_from: p.valid_from,
          valid_until: p.valid_until,
          status: p.status,
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
    console.error('[v0] List promotions error:', error);
    return apiError(500, 'Failed to fetch promotions');
  }
}

/**
 * POST /api/vendor/promotions
 * Create a new promotion/coupon
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
      code,
      description,
      type,
      discount_value,
      max_uses,
      min_order_value,
      valid_from,
      valid_until,
    } = body;

    // Validation
    if (!code || !type || !discount_value) {
      return apiError(400, 'Code, type, and discount value are required');
    }

    const validTypes = ['discount_percentage', 'discount_fixed', 'buy_one_get_one', 'free_shipping', 'category_discount'];
    if (!validTypes.includes(type)) {
      return apiError(400, `Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate code format
    if (!/^[A-Z0-9]{3,12}$/.test(code)) {
      return apiError(400, 'Code must be 3-12 uppercase alphanumeric characters');
    }

    // Check if code already exists
    const existingResult = await query(
      'SELECT id FROM promotions_coupons WHERE code = $1 AND vendor_id = $2',
      [code, vendor.vendorId]
    );

    if (existingResult.rows.length > 0) {
      return apiError(400, 'This coupon code already exists');
    }

    // Validate dates
    if (valid_from && valid_until) {
      if (new Date(valid_from) >= new Date(valid_until)) {
        return apiError(400, 'Valid from date must be before valid until date');
      }
    }

    // Create promotion
    const result = await query(
      `INSERT INTO promotions_coupons (vendor_id, code, description, type, discount_value, max_uses,
                                      current_uses, min_order_value, valid_from, valid_until, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING id, code, type, discount_value, status, valid_from, valid_until`,
      [
        vendor.vendorId,
        code,
        description || '',
        type,
        parseFloat(discount_value),
        max_uses || null,
        0, // current_uses starts at 0
        min_order_value ? parseFloat(min_order_value) : 0,
        valid_from || null,
        valid_until || null,
        'draft', // Start as draft, vendor can activate manually
      ]
    );

    const promotion = result.rows[0];

    // Log activity
    await logVendorActivity(vendor.vendorId, 'promotion_created', {
      promotion_id: promotion.id,
      code: promotion.code,
      type: promotion.type,
    });

    return apiSuccess(
      {
        id: promotion.id,
        code: promotion.code,
        type: promotion.type,
        discount_value: parseFloat(promotion.discount_value),
        status: promotion.status,
        message: 'Promotion created in draft mode. Activate when ready to use.',
      },
      201
    );
  } catch (error) {
    console.error('[v0] Create promotion error:', error);
    return apiError(500, 'Failed to create promotion');
  }
}
