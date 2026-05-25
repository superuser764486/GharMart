import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError, logVendorActivity } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/support/tickets
 * Get vendor's support tickets
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
      `SELECT COUNT(*) as total FROM support_tickets ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Get tickets
    const ticketsResult = await query(
      `SELECT id, subject, category, status, priority, created_at, updated_at
       FROM support_tickets
       ${whereClause}
       ORDER BY updated_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return apiSuccess(
      {
        tickets: ticketsResult.rows.map(t => ({
          id: t.id,
          subject: t.subject,
          category: t.category,
          status: t.status,
          priority: t.priority,
          created_at: t.created_at,
          updated_at: t.updated_at,
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
    console.error('[v0] List support tickets error:', error);
    return apiError(500, 'Failed to fetch tickets');
  }
}

/**
 * POST /api/vendor/support/tickets
 * Create a new support ticket
 * Authorization: Bearer <token>
 */

export async function POST(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const { subject, description, category, priority } = body;

    // Validation
    if (!subject || !description || !category) {
      return apiError(400, 'Subject, description, and category are required');
    }

    const validCategories = ['billing', 'technical', 'product', 'order', 'payout', 'account', 'other'];
    if (!validCategories.includes(category)) {
      return apiError(400, `Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    const ticketPriority = priority || 'medium';
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(ticketPriority)) {
      return apiError(400, `Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }

    // Create ticket
    const result = await query(
      `INSERT INTO support_tickets (vendor_id, subject, description, category, priority, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, subject, category, status, priority, created_at`,
      [vendor.vendorId, subject, description, category, ticketPriority, 'open']
    );

    const ticket = result.rows[0];

    // Log activity
    await logVendorActivity(vendor.vendorId, 'support_ticket_created', {
      ticket_id: ticket.id,
      category,
      priority: ticketPriority,
    });

    // Send notification to admin
    await query(
      `INSERT INTO notifications (user_id, title, message, type, created_at)
       SELECT id, $1, $2, $3, NOW()
       FROM users WHERE role = 'admin'`,
      [
        'New Support Ticket',
        `Support ticket created: ${subject}`,
        'support_ticket_new',
      ]
    );

    return apiSuccess(
      {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        created_at: ticket.created_at,
        message: 'Ticket created. You will receive updates via email.',
      },
      201
    );
  } catch (error) {
    console.error('[v0] Create support ticket error:', error);
    return apiError(500, 'Failed to create ticket');
  }
}
