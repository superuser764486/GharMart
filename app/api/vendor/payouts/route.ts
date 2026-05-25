import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError, logVendorActivity } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/payouts
 * Get vendor's payout history
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
      `SELECT COUNT(*) as total FROM vendor_payouts ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Get payouts
    const payoutsResult = await query(
      `SELECT id, amount, commission_amount, net_amount, period_start, period_end,
              status, method, requested_at, completed_at, transaction_id, created_at
       FROM vendor_payouts
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return apiSuccess(
      {
        payouts: payoutsResult.rows.map(p => ({
          id: p.id,
          amount: parseFloat(p.amount),
          commission_amount: parseFloat(p.commission_amount),
          net_amount: parseFloat(p.net_amount),
          period: {
            start: p.period_start,
            end: p.period_end,
          },
          status: p.status,
          method: p.method,
          transaction_id: p.transaction_id,
          requested_at: p.requested_at,
          completed_at: p.completed_at,
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
    console.error('[v0] List payouts error:', error);
    return apiError(500, 'Failed to fetch payouts');
  }
}

/**
 * POST /api/vendor/payouts/request
 * Request a new payout
 * Authorization: Bearer <token>
 */

export async function POST(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const { amount, method, bank_account_id, upi_id } = body;

    if (!amount || !method) {
      return apiError(400, 'Amount and method are required');
    }

    const payoutAmount = parseFloat(amount);
    if (payoutAmount <= 0) {
      return apiError(400, 'Payout amount must be greater than 0');
    }

    const validMethods = ['bank_transfer', 'upi', 'wallet'];
    if (!validMethods.includes(method)) {
      return apiError(400, `Invalid method. Must be one of: ${validMethods.join(', ')}`);
    }

    // Verify payment method exists
    if (method === 'bank_transfer' && bank_account_id) {
      const bankResult = await query(
        'SELECT id FROM vendor_bank_accounts WHERE id = $1 AND vendor_id = $2 AND is_verified = true',
        [bank_account_id, vendor.vendorId]
      );

      if (bankResult.rows.length === 0) {
        return apiError(400, 'Bank account not found or not verified');
      }
    } else if (method === 'upi' && upi_id) {
      const upiResult = await query(
        'SELECT id FROM vendor_upi_accounts WHERE id = $1 AND vendor_id = $2 AND is_verified = true',
        [upi_id, vendor.vendorId]
      );

      if (upiResult.rows.length === 0) {
        return apiError(400, 'UPI account not found or not verified');
      }
    }

    // Check vendor's available balance
    const balanceResult = await query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE p.vendor_id = $1 AND o.status IN ('delivered', 'paid')`,
      [vendor.vendorId]
    );

    const totalRevenue = parseFloat(balanceResult.rows[0].total_revenue);
    const commissionRate = 0.05; // 5% commission
    const commissionAmount = totalRevenue * commissionRate;
    const availableBalance = totalRevenue - commissionAmount;

    // Check if already paid
    const paidResult = await query(
      `SELECT COALESCE(SUM(net_amount), 0) as total_paid FROM vendor_payouts
       WHERE vendor_id = $1 AND status IN ('completed', 'processing')`,
      [vendor.vendorId]
    );

    const totalPaid = parseFloat(paidResult.rows[0].total_paid);
    const remainingBalance = availableBalance - totalPaid;

    if (payoutAmount > remainingBalance) {
      return apiError(400, `Insufficient balance. Available: ₹${remainingBalance.toFixed(2)}`);
    }

    // Create payout request
    const payoutResult = await query(
      `INSERT INTO vendor_payouts (vendor_id, amount, commission_amount, net_amount,
                                   period_start, period_end, status, method, requested_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id, amount, commission_amount, net_amount, status`,
      [
        vendor.vendorId,
        payoutAmount,
        payoutAmount * commissionRate,
        payoutAmount * (1 - commissionRate),
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString(),
        'requested',
        method,
      ]
    );

    const payout = payoutResult.rows[0];

    // Log activity
    await logVendorActivity(vendor.vendorId, 'payout_requested', {
      payout_id: payout.id,
      amount: payout.amount,
      method,
    });

    return apiSuccess(
      {
        payout_id: payout.id,
        amount: parseFloat(payout.amount),
        commission_amount: parseFloat(payout.commission_amount),
        net_amount: parseFloat(payout.net_amount),
        status: payout.status,
        message: 'Payout request submitted. It will be processed within 2-3 business days.',
      },
      201
    );
  } catch (error) {
    console.error('[v0] Request payout error:', error);
    return apiError(500, 'Failed to request payout');
  }
}
