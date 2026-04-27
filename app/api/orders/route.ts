import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(request: NextRequest) {
  try {
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

    const { items, addressId, paymentMethod, total } = await request.json();

    // Validate input
    if (!items || !items.length || !addressId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create order in database
    const orderResult = await query(
      `INSERT INTO orders (customer_id, address_id, payment_method, total_amount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [payload.userId, addressId, paymentMethod, total, 'pending']
    );

    const orderId = orderResult.rows[0].id;

    // Add order items
    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, item.price]
      );

      // Update product stock
      await query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }

    let razorpayOrderId = null;

    // Create Razorpay order if not COD
    if (paymentMethod !== 'cod') {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // Amount in paise
        currency: 'INR',
        receipt: `order-${orderId}`,
      });
      razorpayOrderId = razorpayOrder.id;

      // Store Razorpay order ID
      await query(
        `UPDATE orders SET razorpay_order_id = $1 WHERE id = $2`,
        [razorpayOrderId, orderId]
      );
    } else {
      // For COD, mark as confirmed
      await query(
        `UPDATE orders SET status = $1 WHERE id = $2`,
        ['confirmed', orderId]
      );
    }

    return NextResponse.json({
      order: {
        id: orderId,
        razorpay_order_id: razorpayOrderId,
      },
    });
  } catch (error) {
    console.error('[v0] Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
