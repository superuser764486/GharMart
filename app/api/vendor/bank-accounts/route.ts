import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError, logVendorActivity } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/bank-accounts
 * Get vendor's bank accounts
 * Authorization: Bearer <token>
 */

export async function GET(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    const result = await query(
      `SELECT id, account_holder_name, account_number, ifsc_code, bank_name,
              account_type, is_verified, verified_at, is_default, created_at
       FROM vendor_bank_accounts
       WHERE vendor_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [vendor.vendorId]
    );

    return apiSuccess(
      {
        accounts: result.rows.map(a => ({
          id: a.id,
          account_holder_name: a.account_holder_name,
          account_number: a.account_number.slice(-4).padStart(a.account_number.length, '*'),
          ifsc_code: a.ifsc_code,
          bank_name: a.bank_name,
          account_type: a.account_type,
          is_verified: a.is_verified,
          is_default: a.is_default,
          verified_at: a.verified_at,
          created_at: a.created_at,
        })),
      },
      200
    );
  } catch (error) {
    console.error('[v0] List bank accounts error:', error);
    return apiError(500, 'Failed to fetch bank accounts');
  }
}

/**
 * POST /api/vendor/bank-accounts
 * Add a new bank account
 * Authorization: Bearer <token>
 */

export async function POST(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const { account_holder_name, account_number, ifsc_code, bank_name, account_type, is_default } = body;

    // Validation
    if (!account_holder_name || !account_number || !ifsc_code || !bank_name || !account_type) {
      return apiError(400, 'Missing required fields');
    }

    // Validate account number (10-18 digits)
    if (!/^\d{10,18}$/.test(account_number)) {
      return apiError(400, 'Invalid account number');
    }

    // Validate IFSC code (11 alphanumeric characters)
    if (!/^[A-Z0-9]{11}$/.test(ifsc_code)) {
      return apiError(400, 'Invalid IFSC code');
    }

    if (!['savings', 'current'].includes(account_type)) {
      return apiError(400, 'Account type must be savings or current');
    }

    // Check if this is the first account (auto-default it)
    const countResult = await query(
      'SELECT COUNT(*) as count FROM vendor_bank_accounts WHERE vendor_id = $1',
      [vendor.vendorId]
    );

    const isFirstAccount = parseInt(countResult.rows[0].count) === 0;

    // Add bank account
    const result = await query(
      `INSERT INTO vendor_bank_accounts (vendor_id, account_holder_name, account_number,
                                         ifsc_code, bank_name, account_type, is_default, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, account_number, bank_name, account_type`,
      [
        vendor.vendorId,
        account_holder_name,
        account_number,
        ifsc_code,
        bank_name,
        account_type,
        isFirstAccount || is_default,
      ]
    );

    const account = result.rows[0];

    // Log activity
    await logVendorActivity(vendor.vendorId, 'bank_account_added', {
      account_id: account.id,
      bank: account.bank_name,
    });

    return apiSuccess(
      {
        id: account.id,
        account_number: account.account_number.slice(-4).padStart(account.account_number.length, '*'),
        bank_name: account.bank_name,
        account_type: account.account_type,
        is_default: isFirstAccount || is_default,
        message: 'Bank account added. Please verify to use for payouts.',
      },
      201
    );
  } catch (error) {
    console.error('[v0] Add bank account error:', error);
    return apiError(500, 'Failed to add bank account');
  }
}
