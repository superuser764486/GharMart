import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/analytics
 * Get vendor's analytics and statistics
 * Authorization: Bearer <token>
 * Query params: period=7d|30d|90d|all, metric=revenue|orders|customers|products
 */

export async function GET(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30d';
    const metric = url.searchParams.get('metric') || 'all';

    // Calculate date range
    let daysAgo = 30;
    if (period === '7d') daysAgo = 7;
    else if (period === '90d') daysAgo = 90;
    else if (period === 'all') daysAgo = 3650; // 10 years

    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Get overall stats
    const statsResult = await query(
      `SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(DISTINCT o.user_id) as total_customers,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(AVG(p.rating), 0) as avg_rating,
        COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders
       FROM products p
       LEFT JOIN orders o ON p.vendor_id = o.vendor_id AND o.created_at >= $1
       WHERE p.vendor_id = $2`,
      [startDate, vendor.vendorId]
    );

    const stats = statsResult.rows[0];

    // Get daily analytics
    const dailyResult = await query(
      `SELECT 
        DATE(o.created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COUNT(DISTINCT o.user_id) as new_customers
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE p.vendor_id = $1 AND o.created_at >= $2
       GROUP BY DATE(o.created_at)
       ORDER BY date DESC`,
      [vendor.vendorId, startDate]
    );

    // Get top products
    const topProductsResult = await query(
      `SELECT 
        p.id, p.name, COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        p.rating
       FROM products p
       LEFT JOIN orders o ON p.id = o.product_id AND o.created_at >= $1
       WHERE p.vendor_id = $2
       GROUP BY p.id, p.name, p.rating
       ORDER BY order_count DESC
       LIMIT 5`,
      [startDate, vendor.vendorId]
    );

    // Get revenue by category
    const categoryResult = await query(
      `SELECT 
        p.category,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COUNT(DISTINCT o.user_id) as customers
       FROM products p
       LEFT JOIN orders o ON p.id = o.product_id AND o.created_at >= $1
       WHERE p.vendor_id = $2
       GROUP BY p.category
       ORDER BY revenue DESC`,
      [startDate, vendor.vendorId]
    );

    // Get customer metrics
    const customerMetricsResult = await query(
      `SELECT 
        COUNT(DISTINCT user_id) as returning_customers,
        COUNT(DISTINCT user_id) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_last_week
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE p.vendor_id = $1 AND status IN ('delivered', 'shipped', 'paid')`,
      [vendor.vendorId]
    );

    const customerMetrics = customerMetricsResult.rows[0];

    return apiSuccess(
      {
        period,
        summary: {
          total_products: parseInt(stats.total_products),
          total_orders: parseInt(stats.total_orders),
          total_customers: parseInt(stats.total_customers),
          total_revenue: parseFloat(stats.total_revenue),
          avg_rating: parseFloat(stats.avg_rating).toFixed(2),
          pending_orders: parseInt(stats.pending_orders),
        },
        daily: dailyResult.rows.map(d => ({
          date: d.date,
          orders: parseInt(d.orders),
          revenue: parseFloat(d.revenue),
          new_customers: parseInt(d.new_customers),
        })),
        top_products: topProductsResult.rows.map(p => ({
          id: p.id,
          name: p.name,
          order_count: parseInt(p.order_count),
          revenue: parseFloat(p.revenue),
          rating: parseFloat(p.rating || 0),
        })),
        revenue_by_category: categoryResult.rows.map(c => ({
          category: c.category,
          order_count: parseInt(c.order_count),
          revenue: parseFloat(c.revenue),
          customers: parseInt(c.customers),
        })),
        customer_metrics: {
          returning_customers: parseInt(customerMetrics.returning_customers),
          new_last_week: parseInt(customerMetrics.new_last_week),
        },
      },
      200
    );
  } catch (error) {
    console.error('[v0] Get analytics error:', error);
    return apiError(500, 'Failed to fetch analytics');
  }
}
