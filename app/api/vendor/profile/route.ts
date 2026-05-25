import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError, logVendorActivity } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/profile
 * Get vendor profile and shop details
 * Authorization: Bearer <token>
 */

export async function GET(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    // Get vendor profile
    const userResult = await query(
      'SELECT id, email, phone, role, created_at FROM users WHERE id = $1',
      [vendor.vendorId]
    );

    const user = userResult.rows[0];

    // Get shop details
    const shopResult = await query(
      `SELECT id, name, description, logo_url, banner_url, address, city, state, pincode,
              phone, email, rating, status, approved_at, created_at
       FROM shops WHERE vendor_id = $1`,
      [vendor.vendorId]
    );

    const shop = shopResult.rows[0];

    // Get KYC status
    const kycResult = await query(
      `SELECT status, COUNT(*) as total_documents,
              SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_documents
       FROM vendor_kyc_documents WHERE vendor_id = $1
       GROUP BY status`,
      [vendor.vendorId]
    );

    const kyc = kycResult.rows[0] || { status: 'pending', total_documents: 0, verified_documents: 0 };

    // Get stats
    const statsResult = await query(
      `SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(AVG(p.rating), 0) as avg_rating
       FROM products p
       LEFT JOIN orders o ON p.vendor_id = o.vendor_id
       WHERE p.vendor_id = $1`,
      [vendor.vendorId]
    );

    const stats = statsResult.rows[0];

    return apiSuccess(
      {
        vendor: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          created_at: user.created_at,
        },
        shop: {
          id: shop.id,
          name: shop.name,
          description: shop.description,
          logo_url: shop.logo_url,
          banner_url: shop.banner_url,
          address: `${shop.address}, ${shop.city}, ${shop.state} ${shop.pincode}`,
          city: shop.city,
          state: shop.state,
          phone: shop.phone,
          email: shop.email,
          rating: shop.rating,
          status: shop.status,
          created_at: shop.created_at,
        },
        kyc: {
          status: kyc.status,
          total_documents: parseInt(kyc.total_documents),
          verified_documents: parseInt(kyc.verified_documents || 0),
        },
        stats: {
          total_products: parseInt(stats.total_products),
          total_orders: parseInt(stats.total_orders),
          total_revenue: parseFloat(stats.total_revenue),
          avg_rating: parseFloat(stats.avg_rating),
        },
      },
      200
    );
  } catch (error) {
    console.error('[v0] Get vendor profile error:', error);
    return apiError(500, 'Failed to retrieve profile');
  }
}

/**
 * PUT /api/vendor/profile
 * Update vendor profile
 * Authorization: Bearer <token>
 */

export async function PUT(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const { shop_name, description, phone, email, city, state, address, pincode, logo_url, banner_url } = body;

    // Update shop details
    if (shop_name || description || phone || email || city || state || address || pincode || logo_url || banner_url) {
      const updateFields = [];
      const params = [vendor.shopId];
      let paramIndex = 2;

      if (shop_name) {
        updateFields.push(`name = $${paramIndex++}`);
        params.push(shop_name);
      }
      if (description) {
        updateFields.push(`description = $${paramIndex++}`);
        params.push(description);
      }
      if (phone) {
        updateFields.push(`phone = $${paramIndex++}`);
        params.push(phone);
      }
      if (email) {
        updateFields.push(`email = $${paramIndex++}`);
        params.push(email);
      }
      if (city) {
        updateFields.push(`city = $${paramIndex++}`);
        params.push(city);
      }
      if (state) {
        updateFields.push(`state = $${paramIndex++}`);
        params.push(state);
      }
      if (address) {
        updateFields.push(`address = $${paramIndex++}`);
        params.push(address);
      }
      if (pincode) {
        updateFields.push(`pincode = $${paramIndex++}`);
        params.push(pincode);
      }
      if (logo_url) {
        updateFields.push(`logo_url = $${paramIndex++}`);
        params.push(logo_url);
      }
      if (banner_url) {
        updateFields.push(`banner_url = $${paramIndex++}`);
        params.push(banner_url);
      }

      updateFields.push('updated_at = NOW()');

      await query(
        `UPDATE shops SET ${updateFields.join(', ')} WHERE id = $1`,
        params
      );
    }

    // Log activity
    await logVendorActivity(vendor.vendorId, 'profile_updated', { updated_fields: Object.keys(body) });

    return apiSuccess({ message: 'Profile updated successfully' }, 200);
  } catch (error) {
    console.error('[v0] Update vendor profile error:', error);
    return apiError(500, 'Failed to update profile');
  }
}
