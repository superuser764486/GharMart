import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError, logVendorActivity } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/orders
 * List vendor's orders
 * Authorization: Bearer <token>
 * Query params: page=1, limit=20, status=all|pending|confirmed|shipped|delivered
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

    // Build query - get orders for products sold by this vendor
    let whereClause = 'WHERE p.vendor_id = $1';
    const params = [vendor.vendorId];

    if (status !== 'all') {
      whereClause += ` AND o.status = $${params.length + 1}`;
      params.push(status);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(DISTINCT o.id) as total FROM orders o
       JOIN products p ON o.product_id = p.id
       ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Get paginated orders
    const ordersResult = await query(
      `SELECT DISTINCT o.id, o.user_id, o.product_id, o.total_amount, o.status, o.created_at,
              p.name as product_name, p.price,
              u.email as customer_email, u.phone as customer_phone
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return apiSuccess(
      {
        orders: ordersResult.rows.map(o => ({
          id: o.id,
          product_id: o.product_id,
          product_name: o.product_name,
          customer_email: o.customer_email,
          customer_phone: o.customer_phone,
          amount: parseFloat(o.total_amount),
          status: o.status,
          created_at: o.created_at,
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
    console.error('[v0] List orders error:', error);
    return apiError(500, 'Failed to fetch orders');
  }
}
