import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/auth/jwt';
import { query } from '@/lib/database/connection';

/**
 * Vendor Auth Middleware
 * - Verifies JWT token
 * - Checks vendor role
 * - Validates vendor status (active, approved)
 * - Prevents unauthorized access
 */

export interface VendorAuthContext {
  vendorId: string;
  userId: string;
  email: string;
  shopId: string;
  role: 'vendor';
  isApproved: boolean;
  token: TokenPayload;
}

/**
 * Authenticate vendor from request
 * Returns vendor context or null if unauthorized
 */
export async function authenticateVendor(request: NextRequest): Promise<VendorAuthContext | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'vendor') {
      return null;
    }

    // Verify vendor exists and is approved
    const result = await query(
      `SELECT shops.id as shop_id, shops.approved_by, shops.is_active
       FROM shops
       WHERE shops.vendor_id = $1 AND shops.is_active = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return null; // Vendor has no active shop
    }

    const shop = result.rows[0];

    return {
      vendorId: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      shopId: shop.shop_id,
      role: 'vendor',
      isApproved: shop.approved_by !== null,
      token: decoded,
    };
  } catch (error) {
    console.error('[v0] Vendor authentication error:', error);
    return null;
  }
}

/**
 * Middleware to require vendor authentication
 * Usage: const vendor = await requireVendorAuth(request)
 */
export async function requireVendorAuth(request: NextRequest): Promise<[VendorAuthContext, NextResponse | null]> {
  const vendor = await authenticateVendor(request);

  if (!vendor) {
    return [
      null as any,
      NextResponse.json(
        { error: 'Unauthorized', message: 'Valid vendor token required' },
        { status: 401 }
      ),
    ];
  }

  return [vendor, null];
}

/**
 * Validate vendor ownership of resource
 * Prevents vendor from accessing other vendors' data
 */
export async function validateVendorOwnership(
  vendorId: string,
  resourceType: 'product' | 'order' | 'shop' | 'promotion',
  resourceId: string
): Promise<boolean> {
  try {
    let query_text = '';

    switch (resourceType) {
      case 'product':
        query_text = 'SELECT 1 FROM products WHERE id = $1 AND vendor_id = $2';
        break;
      case 'order':
        query_text = `SELECT 1 FROM orders o
          JOIN products p ON o.product_id = p.id
          WHERE o.id = $1 AND p.vendor_id = $2`;
        break;
      case 'shop':
        query_text = 'SELECT 1 FROM shops WHERE id = $1 AND vendor_id = $2';
        break;
      case 'promotion':
        query_text = 'SELECT 1 FROM promotions_coupons WHERE id = $1 AND vendor_id = $2';
        break;
    }

    const result = await query(query_text, [resourceId, vendorId]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('[v0] Ownership validation error:', error);
    return false;
  }
}

/**
 * Create standardized API error responses
 */
export function apiError(
  status: number,
  message: string,
  details?: Record<string, any>
) {
  return NextResponse.json(
    {
      error: true,
      message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Create standardized API success responses
 */
export function apiSuccess<T>(
  data: T,
  status: number = 200,
  metadata?: Record<string, any>
) {
  return NextResponse.json(
    {
      error: false,
      data,
      ...(metadata && { metadata }),
    },
    { status }
  );
}

/**
 * Log vendor activity for audit trail
 */
export async function logVendorActivity(
  vendorId: string,
  action: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    await query(
      `INSERT INTO vendor_activity_logs (vendor_id, action, details, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [vendorId, action, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('[v0] Activity logging error:', error);
  }
}

/**
 * Rate limiting helper for vendor endpoints
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(vendorId: string, limit: number = 100, window: number = 60000): boolean {
  const key = `vendor:${vendorId}`;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + window });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
