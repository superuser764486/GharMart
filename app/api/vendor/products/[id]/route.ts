import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError, validateVendorOwnership, logVendorActivity } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/products/[id]
 * Get product details
 * Authorization: Bearer <token>
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    // Validate ownership
    const isOwner = await validateVendorOwnership(vendor.vendorId, 'product', params.id);
    if (!isOwner) {
      return apiError(403, 'You do not own this product');
    }

    const result = await query(
      `SELECT id, name, description, price, original_price, image_url, category,
              stock, rating, reviews_count, moderation_status, created_at, updated_at
       FROM products WHERE id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return apiError(404, 'Product not found');
    }

    const product = result.rows[0];

    return apiSuccess(
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        original_price: product.original_price ? parseFloat(product.original_price) : null,
        image_url: product.image_url,
        category: product.category,
        stock: parseInt(product.stock),
        rating: parseFloat(product.rating || 0),
        reviews_count: parseInt(product.reviews_count || 0),
        status: product.moderation_status,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
      200
    );
  } catch (error) {
    console.error('[v0] Get product error:', error);
    return apiError(500, 'Failed to fetch product');
  }
}

/**
 * PUT /api/vendor/products/[id]
 * Update product details
 * Authorization: Bearer <token>
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    // Validate ownership
    const isOwner = await validateVendorOwnership(vendor.vendorId, 'product', params.id);
    if (!isOwner) {
      return apiError(403, 'You do not own this product');
    }

    const body = await request.json();
    const { name, description, price, original_price, image_url, category, stock } = body;

    // Build update query
    const updateFields = [];
    const updateParams = [params.id];
    let paramIndex = 2;

    if (name) {
      updateFields.push(`name = $${paramIndex++}`);
      updateParams.push(name);
    }
    if (description) {
      updateFields.push(`description = $${paramIndex++}`);
      updateParams.push(description);
    }
    if (price) {
      if (parseFloat(price) <= 0) {
        return apiError(400, 'Price must be greater than 0');
      }
      updateFields.push(`price = $${paramIndex++}`);
      updateParams.push(parseFloat(price));
    }
    if (original_price) {
      updateFields.push(`original_price = $${paramIndex++}`);
      updateParams.push(parseFloat(original_price));
    }
    if (image_url) {
      updateFields.push(`image_url = $${paramIndex++}`);
      updateParams.push(image_url);
    }
    if (category) {
      updateFields.push(`category = $${paramIndex++}`);
      updateParams.push(category);
    }
    if (stock !== undefined) {
      if (parseInt(stock) < 0) {
        return apiError(400, 'Stock cannot be negative');
      }
      updateFields.push(`stock = $${paramIndex++}`);
      updateParams.push(parseInt(stock));
    }

    if (updateFields.length === 0) {
      return apiError(400, 'No fields to update');
    }

    updateFields.push('updated_at = NOW()');

    await query(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = $1`,
      updateParams
    );

    // Log activity
    await logVendorActivity(vendor.vendorId, 'product_updated', {
      product_id: params.id,
      updated_fields: Object.keys(body),
    });

    return apiSuccess({ message: 'Product updated successfully' }, 200);
  } catch (error) {
    console.error('[v0] Update product error:', error);
    return apiError(500, 'Failed to update product');
  }
}

/**
 * DELETE /api/vendor/products/[id]
 * Delete product
 * Authorization: Bearer <token>
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    // Validate ownership
    const isOwner = await validateVendorOwnership(vendor.vendorId, 'product', params.id);
    if (!isOwner) {
      return apiError(403, 'You do not own this product');
    }

    // Check if product has active orders
    const orderCheck = await query(
      'SELECT COUNT(*) as count FROM orders WHERE product_id = $1 AND status != $2',
      [params.id, 'cancelled']
    );

    if (parseInt(orderCheck.rows[0].count) > 0) {
      return apiError(400, 'Cannot delete product with active orders');
    }

    // Delete product
    await query('DELETE FROM products WHERE id = $1', [params.id]);

    // Log activity
    await logVendorActivity(vendor.vendorId, 'product_deleted', { product_id: params.id });

    return apiSuccess({ message: 'Product deleted successfully' }, 200);
  } catch (error) {
    console.error('[v0] Delete product error:', error);
    return apiError(500, 'Failed to delete product');
  }
}
