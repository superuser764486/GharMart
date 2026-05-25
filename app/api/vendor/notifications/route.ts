import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/notifications
 * Get vendor's notifications
 * Authorization: Bearer <token>
 */

export async function GET(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    const url = new URL(request.url);
    const unread_only = url.searchParams.get('unread_only') === 'true';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    // Get notification query
    let whereClause = `WHERE user_id IN (
      SELECT id FROM users WHERE email IN (
        SELECT email FROM users WHERE id = $1
      )
    )`;

    let params = [vendor.vendorId];

    if (unread_only) {
      whereClause += ` AND is_read = false`;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Get notifications
    const notificationsResult = await query(
      `SELECT id, title, message, type, is_read, created_at
       FROM notifications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return apiSuccess(
      {
        notifications: notificationsResult.rows.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          is_read: n.is_read,
          created_at: n.created_at,
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
    console.error('[v0] List notifications error:', error);
    return apiError(500, 'Failed to fetch notifications');
  }
}

/**
 * POST /api/vendor/notifications/mark-read
 * Mark notifications as read
 * Authorization: Bearer <token>
 */

export async function POST(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const { notification_ids, mark_all } = body;

    if (mark_all) {
      // Mark all as read
      await query(
        `UPDATE notifications SET is_read = true
         WHERE user_id = $1 AND is_read = false`,
        [vendor.userId]
      );

      return apiSuccess({ message: 'All notifications marked as read' }, 200);
    }

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return apiError(400, 'notification_ids array is required');
    }

    if (notification_ids.length === 0) {
      return apiError(400, 'At least one notification ID is required');
    }

    // Mark specific notifications as read
    const placeholders = notification_ids.map((_, i) => `$${i + 2}`).join(',');
    await query(
      `UPDATE notifications SET is_read = true
       WHERE id IN (${placeholders}) AND user_id = $1`,
      [vendor.userId, ...notification_ids]
    );

    return apiSuccess({ message: 'Notifications marked as read' }, 200);
  } catch (error) {
    console.error('[v0] Mark notifications read error:', error);
    return apiError(500, 'Failed to update notifications');
  }
}
