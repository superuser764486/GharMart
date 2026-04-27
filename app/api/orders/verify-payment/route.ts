import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      await request.json();

    // Validate signature
    const signatureBody = `${razorpayOrderId}|${razorpayPaymentId}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(signatureBody)
      .digest('hex');

    if (signature !== razorpaySignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature', success: false },
        { status: 400 }
      );
    }

    // Update order status to paid
    await query(
      `UPDATE orders 
       SET status = $1, razorpay_payment_id = $2, razorpay_signature = $3, paid_at = NOW()
       WHERE id = $4`,
      ['paid', razorpayPaymentId, razorpaySignature, orderId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment', success: false },
      { status: 500 }
    );
  }
}
