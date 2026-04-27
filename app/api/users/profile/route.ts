import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// Get user profile
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
      `SELECT id, email, phone, full_name, profile_photo_url, date_of_birth, gender, 
              preferred_language, notifications_enabled, email_notifications, 
              sms_notifications, push_notifications, last_login, created_at, updated_at
       FROM customers WHERE id = $1`,
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
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
    const { fullName, phone, dateOfBirth, gender, preferredLanguage, profilePhotoUrl } = body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

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

    if (dateOfBirth !== undefined) {
      updates.push(`date_of_birth = $${paramIndex}`);
      values.push(dateOfBirth);
      paramIndex++;
    }

    if (gender !== undefined) {
      updates.push(`gender = $${paramIndex}`);
      values.push(gender);
      paramIndex++;
    }

    if (preferredLanguage !== undefined) {
      updates.push(`preferred_language = $${paramIndex}`);
      values.push(preferredLanguage);
      paramIndex++;
    }

    if (profilePhotoUrl !== undefined) {
      updates.push(`profile_photo_url = $${paramIndex}`);
      values.push(profilePhotoUrl);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(payload.userId);

    const result = await query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = $${paramIndex} 
       RETURNING id, email, phone, full_name, profile_photo_url, date_of_birth, 
                 gender, preferred_language, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
