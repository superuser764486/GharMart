import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Fetch order
    const orderResult = await query(
      `SELECT o.id, o.customer_id, o.address_id, o.payment_method, o.total_amount, 
              o.status, o.created_at, ca.full_name, ca.street_address, ca.city, ca.state, ca.postal_code
       FROM orders o
       LEFT JOIN customer_addresses ca ON o.address_id = ca.id
       WHERE o.id = $1 AND o.customer_id = $2`,
      [orderId, payload.userId]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderRow = orderResult.rows[0];

    // Fetch order items
    const itemsResult = await query(
      `SELECT oi.id, oi.product_id, oi.quantity, oi.price_at_purchase, p.name as product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    const order = {
      id: orderRow.id,
      customer_id: orderRow.customer_id,
      payment_method: orderRow.payment_method,
      total_amount: orderRow.total_amount,
      status: orderRow.status,
      created_at: orderRow.created_at,
      address: orderRow.full_name ? {
        full_name: orderRow.full_name,
        street_address: orderRow.street_address,
        city: orderRow.city,
        state: orderRow.state,
        postal_code: orderRow.postal_code,
      } : null,
      items: itemsResult.rows,
    };

    return NextResponse.json({ order });
  } catch (error) {
    console.error('[v0] Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
