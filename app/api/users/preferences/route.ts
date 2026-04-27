import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// Get user preferences
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
      `SELECT id, preferred_language, notifications_enabled, email_notifications, 
              sms_notifications, push_notifications
       FROM customers WHERE id = $1`,
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, preferences: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user preferences
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
    const {
      preferredLanguage,
      notificationsEnabled,
      emailNotifications,
      smsNotifications,
      pushNotifications,
    } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (preferredLanguage !== undefined) {
      updates.push(`preferred_language = $${paramIndex}`);
      values.push(preferredLanguage);
      paramIndex++;
    }

    if (notificationsEnabled !== undefined) {
      updates.push(`notifications_enabled = $${paramIndex}`);
      values.push(notificationsEnabled);
      paramIndex++;
    }

    if (emailNotifications !== undefined) {
      updates.push(`email_notifications = $${paramIndex}`);
      values.push(emailNotifications);
      paramIndex++;
    }

    if (smsNotifications !== undefined) {
      updates.push(`sms_notifications = $${paramIndex}`);
      values.push(smsNotifications);
      paramIndex++;
    }

    if (pushNotifications !== undefined) {
      updates.push(`push_notifications = $${paramIndex}`);
      values.push(pushNotifications);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(payload.userId);

    const result = await query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = $${paramIndex} 
       RETURNING id, preferred_language, notifications_enabled, email_notifications, 
                 sms_notifications, push_notifications, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, preferences: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
