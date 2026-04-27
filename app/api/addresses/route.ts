import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// Get all addresses for user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const result = await query(
      `SELECT id, customer_id, label, full_name, phone, street_address, apartment_number, 
              city, state, postal_code, country, latitude, longitude, is_default, created_at, updated_at
       FROM customer_addresses 
       WHERE customer_id = $1 
       ORDER BY is_default DESC, created_at DESC`,
      [payload.userId]
    );

    return NextResponse.json({ success: true, addresses: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new address
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const {
      label,
      fullName,
      phone,
      streetAddress,
      apartmentNumber,
      city,
      state,
      postalCode,
      latitude,
      longitude,
      isDefault,
    } = body;

    // Validate required fields
    if (!fullName || !phone || !streetAddress || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If this is default, remove default from others
    if (isDefault) {
      await query(
        'UPDATE customer_addresses SET is_default = false WHERE customer_id = $1',
        [payload.userId]
      );
    }

    const result = await query(
      `INSERT INTO customer_addresses 
       (customer_id, label, full_name, phone, street_address, apartment_number, 
        city, state, postal_code, latitude, longitude, is_default, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING id, customer_id, label, full_name, phone, street_address, apartment_number,
                 city, state, postal_code, country, latitude, longitude, is_default, created_at, updated_at`,
      [
        payload.userId,
        label || 'Other',
        fullName,
        phone,
        streetAddress,
        apartmentNumber || null,
        city,
        state,
        postalCode,
        latitude || null,
        longitude || null,
        isDefault || false,
      ]
    );

    return NextResponse.json(
      { success: true, address: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
