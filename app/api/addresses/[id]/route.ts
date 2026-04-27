import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Verify ownership
    const addressCheck = await query(
      'SELECT customer_id FROM customer_addresses WHERE id = $1',
      [id]
    );

    if (addressCheck.rows.length === 0 || addressCheck.rows[0].customer_id !== payload.userId) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
    }

    // If this is default, remove default from others
    if (isDefault) {
      await query(
        'UPDATE customer_addresses SET is_default = false WHERE customer_id = $1 AND id != $2',
        [payload.userId, id]
      );
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (label !== undefined) {
      updates.push(`label = $${paramIndex}`);
      values.push(label);
      paramIndex++;
    }
    if (fullName !== undefined) {
      updates.push(`full_name = $${paramIndex}`);
      values.push(fullName);
      paramIndex++;
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(phone);
      paramIndex++;
    }
    if (streetAddress !== undefined) {
      updates.push(`street_address = $${paramIndex}`);
      values.push(streetAddress);
      paramIndex++;
    }
    if (apartmentNumber !== undefined) {
      updates.push(`apartment_number = $${paramIndex}`);
      values.push(apartmentNumber);
      paramIndex++;
    }
    if (city !== undefined) {
      updates.push(`city = $${paramIndex}`);
      values.push(city);
      paramIndex++;
    }
    if (state !== undefined) {
      updates.push(`state = $${paramIndex}`);
      values.push(state);
      paramIndex++;
    }
    if (postalCode !== undefined) {
      updates.push(`postal_code = $${paramIndex}`);
      values.push(postalCode);
      paramIndex++;
    }
    if (latitude !== undefined) {
      updates.push(`latitude = $${paramIndex}`);
      values.push(latitude);
      paramIndex++;
    }
    if (longitude !== undefined) {
      updates.push(`longitude = $${paramIndex}`);
      values.push(longitude);
      paramIndex++;
    }
    if (isDefault !== undefined) {
      updates.push(`is_default = $${paramIndex}`);
      values.push(isDefault);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE customer_addresses SET ${updates.join(', ')} 
       WHERE id = $${paramIndex} 
       RETURNING id, customer_id, label, full_name, phone, street_address, apartment_number,
                 city, state, postal_code, country, latitude, longitude, is_default, created_at, updated_at`,
      values
    );

    return NextResponse.json({ success: true, address: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Verify ownership
    const addressCheck = await query(
      'SELECT customer_id FROM customer_addresses WHERE id = $1',
      [id]
    );

    if (addressCheck.rows.length === 0 || addressCheck.rows[0].customer_id !== payload.userId) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
    }

    await query('DELETE FROM customer_addresses WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'Address deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
