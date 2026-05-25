import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { generateTokens } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

/**
 * POST /api/vendor/auth/login
 * Authenticate vendor and return JWT tokens
 *
 * Body:
 * {
 *   "email": "vendor@example.com",
 *   "password": "SecurePassword123"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find vendor by email
    const userResult = await query(
      'SELECT id, email, password, phone, role FROM users WHERE email = $1 AND role = $2',
      [email, 'vendor']
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check vendor status
    const shopResult = await query(
      'SELECT id, status FROM shops WHERE vendor_id = $1',
      [user.id]
    );

    if (shopResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Vendor shop not found' },
        { status: 404 }
      );
    }

    const shop = shopResult.rows[0];

    // Check if shop is active
    if (shop.status === 'suspended') {
      return NextResponse.json(
        { error: 'Your shop has been suspended' },
        { status: 403 }
      );
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: 'vendor',
    });

    // Log activity
    await query(
      `INSERT INTO vendor_activity_logs (vendor_id, action, created_at)
       VALUES ($1, $2, NOW())`,
      [user.id, 'login']
    );

    return NextResponse.json(
      {
        error: false,
        message: 'Login successful',
        data: {
          vendor_id: user.id,
          email: user.email,
          phone: user.phone,
          shop_id: shop.id,
          shop_status: shop.status,
        },
        tokens,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Vendor login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
