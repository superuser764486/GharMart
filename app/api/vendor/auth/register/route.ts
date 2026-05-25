import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { generateTokens } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

/**
 * POST /api/vendor/auth/register
 * Register a new vendor
 *
 * Body:
 * {
 *   "email": "vendor@example.com",
 *   "password": "SecurePassword123",
 *   "phone": "+919876543210",
 *   "shop_name": "My Cool Shop",
 *   "city": "Mumbai",
 *   "state": "Maharashtra"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, phone, shop_name, city, state } = body;

    // Validation
    if (!email || !password || !phone || !shop_name || !city || !state) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password strength validation (min 8 chars, 1 uppercase, 1 number)
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase and numbers' },
        { status: 400 }
      );
    }

    // Check if vendor already exists
    const existingResult = await query(
      'SELECT id FROM users WHERE email = $1 AND role = $2',
      [email, 'vendor']
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Vendor with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create vendor user in transaction
    const vendorResult = await query(
      `INSERT INTO users (email, password, phone, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, email, phone, role`,
      [email, hashedPassword, phone, 'vendor']
    );

    const vendor = vendorResult.rows[0];
    const vendorId = vendor.id;

    // Create shop for vendor
    await query(
      `INSERT INTO shops (vendor_id, name, city, state, phone, email, latitude, longitude, 
                          opening_time, closing_time, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
      [
        vendorId,
        shop_name,
        city,
        state,
        phone,
        email,
        0, // Default latitude
        0, // Default longitude
        '09:00',
        '22:00',
        'pending', // Pending approval
      ]
    );

    // Create vendor profile entry
    await query(
      `INSERT INTO vendor_activity_logs (vendor_id, action, details, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [vendorId, 'vendor_registered', JSON.stringify({ shop_name, city, state })]
    );

    // Generate tokens
    const tokens = generateTokens({
      userId: vendorId,
      email: vendor.email,
      phone: vendor.phone,
      role: 'vendor',
    });

    // Return success with tokens
    return NextResponse.json(
      {
        error: false,
        message: 'Vendor registered successfully. Complete KYC to activate.',
        data: {
          vendor_id: vendorId,
          email: vendor.email,
          phone: vendor.phone,
        },
        tokens,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Vendor registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    );
  }
}
