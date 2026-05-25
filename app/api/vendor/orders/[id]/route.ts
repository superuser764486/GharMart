import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError, validateVendorOwnership, logVendorActivity } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/orders/[id]
 * Get order details
 * Authorization: Bearer <token>
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    // Verify ownership - order belongs to vendor's product
    const isOwner = await validateVendorOwnership(vendor.vendorId, 'order', params.id);
    if (!isOwner) {
      return apiError(403, 'You do not own this order');
    }

    const result = await query(
      `SELECT o.id, o.user_id, o.product_id, o.total_amount, o.status, 
              o.shipping_address, o.payment_method, o.created_at, o.updated_at,
              p.name as product_name, p.price,
              u.email as customer_email, u.phone as customer_phone
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return apiError(404, 'Order not found');
    }

    const order = result.rows[0];

    return apiSuccess(
      {
        id: order.id,
        product_id: order.product_id,
        product_name: order.product_name,
        product_price: parseFloat(order.price),
        customer: {
          email: order.customer_email,
          phone: order.customer_phone,
        },
        total_amount: parseFloat(order.total_amount),
        status: order.status,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      200
    );
  } catch (error) {
    console.error('[v0] Get order error:', error);
    return apiError(500, 'Failed to fetch order');
  }
}

/**
 * PUT /api/vendor/orders/[id]
 * Update order status
 * Authorization: Bearer <token>
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    // Verify ownership
    const isOwner = await validateVendorOwnership(vendor.vendorId, 'order', params.id);
    if (!isOwner) {
      return apiError(403, 'You do not own this order');
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return apiError(400, 'Status is required');
    }

    const validStatuses = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return apiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Update order status
    await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, params.id]
    );

    // Log activity
    await logVendorActivity(vendor.vendorId, 'order_status_updated', {
      order_id: params.id,
      new_status: status,
    });

    // Send notification to customer
    const orderResult = await query(
      `SELECT o.user_id FROM orders o WHERE o.id = $1`,
      [params.id]
    );

    if (orderResult.rows.length > 0) {
      const customerId = orderResult.rows[0].user_id;
      
      // Create notification for customer
      await query(
        `INSERT INTO notifications (user_id, title, message, type, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          customerId,
          'Order Status Update',
          `Your order status has been updated to: ${status}`,
          'order_update',
        ]
      );
    }

    return apiSuccess({ message: `Order status updated to ${status}` }, 200);
  } catch (error) {
    console.error('[v0] Update order error:', error);
    return apiError(500, 'Failed to update order');
  }
}
