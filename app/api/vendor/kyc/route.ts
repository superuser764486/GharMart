import { NextRequest } from 'next/server';
import { authenticateVendor, apiSuccess, apiError, logVendorActivity } from '@/lib/vendor/middleware';
import { query } from '@/lib/database/connection';

/**
 * GET /api/vendor/kyc
 * Get vendor's KYC status and documents
 * Authorization: Bearer <token>
 */

export async function GET(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    // Get KYC documents
    const result = await query(
      `SELECT id, document_type, document_number, expiry_date, status,
              rejection_reason, verified_at, created_at
       FROM vendor_kyc_documents
       WHERE vendor_id = $1
       ORDER BY created_at DESC`,
      [vendor.vendorId]
    );

    // Get overall status
    const statusResult = await query(
      `SELECT 
        COUNT(*) as total_documents,
        SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
       FROM vendor_kyc_documents
       WHERE vendor_id = $1`,
      [vendor.vendorId]
    );

    const stats = statusResult.rows[0];
    const totalDocs = parseInt(stats.total_documents);
    const verifiedDocs = parseInt(stats.verified_count || 0);

    let overallStatus = 'pending';
    if (totalDocs > 0) {
      if (parseInt(stats.rejected_count) > 0) {
        overallStatus = 'rejected';
      } else if (verifiedDocs === totalDocs && totalDocs > 0) {
        overallStatus = 'verified';
      } else if (verifiedDocs > 0) {
        overallStatus = 'submitted';
      }
    }

    return apiSuccess(
      {
        overall_status: overallStatus,
        documents: result.rows.map(d => ({
          id: d.id,
          type: d.document_type,
          number: d.document_number,
          expiry_date: d.expiry_date,
          status: d.status,
          rejection_reason: d.rejection_reason,
          verified_at: d.verified_at,
          created_at: d.created_at,
        })),
        summary: {
          total_documents: totalDocs,
          verified_documents: verifiedDocs,
          pending_documents: totalDocs - verifiedDocs,
        },
        required_documents: ['aadhar', 'pan', 'gst', 'bank_account'],
      },
      200
    );
  } catch (error) {
    console.error('[v0] Get KYC status error:', error);
    return apiError(500, 'Failed to fetch KYC status');
  }
}

/**
 * POST /api/vendor/kyc/upload-document
 * Upload KYC document
 * Authorization: Bearer <token>
 */

export async function POST(request: NextRequest) {
  try {
    const vendor = await authenticateVendor(request);
    if (!vendor) {
      return apiError(401, 'Unauthorized');
    }

    const body = await request.json();
    const { document_type, document_url, document_number, expiry_date } = body;

    // Validation
    if (!document_type || !document_url) {
      return apiError(400, 'Document type and URL are required');
    }

    const validTypes = ['aadhar', 'pan', 'gst', 'bank_account', 'shop_license', 'address_proof'];
    if (!validTypes.includes(document_type)) {
      return apiError(400, `Invalid document type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Check if document already exists
    const existingResult = await query(
      'SELECT id FROM vendor_kyc_documents WHERE vendor_id = $1 AND document_type = $2',
      [vendor.vendorId, document_type]
    );

    let result;
    if (existingResult.rows.length > 0) {
      // Update existing document
      result = await query(
        `UPDATE vendor_kyc_documents
         SET document_url = $1, document_number = $2, expiry_date = $3, status = $4, updated_at = NOW()
         WHERE vendor_id = $5 AND document_type = $6
         RETURNING id, document_type, status, created_at`,
        [document_url, document_number || null, expiry_date || null, 'submitted', vendor.vendorId, document_type]
      );
    } else {
      // Create new document
      result = await query(
        `INSERT INTO vendor_kyc_documents (vendor_id, document_type, document_url, document_number,
                                          expiry_date, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, document_type, status, created_at`,
        [vendor.vendorId, document_type, document_url, document_number || null, expiry_date || null, 'submitted']
      );
    }

    const doc = result.rows[0];

    // Log activity
    await logVendorActivity(vendor.vendorId, 'kyc_document_uploaded', {
      document_id: doc.id,
      document_type,
    });

    // Send notification to admin
    await query(
      `INSERT INTO notifications (user_id, title, message, type, created_at)
       SELECT id, $1, $2, $3, NOW()
       FROM users WHERE role = 'admin'`,
      [
        'KYC Document Submitted',
        `Vendor submitted ${document_type} for verification`,
        'kyc_document_submitted',
      ]
    );

    return apiSuccess(
      {
        document_id: doc.id,
        type: doc.document_type,
        status: doc.status,
        message: 'Document uploaded successfully. Verification is in progress.',
      },
      201
    );
  } catch (error) {
    console.error('[v0] Upload KYC document error:', error);
    return apiError(500, 'Failed to upload document');
  }
}
