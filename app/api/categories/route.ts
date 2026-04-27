import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';

export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT id, name, slug, description, image_url, parent_category_id, created_at
       FROM categories
       WHERE is_active = true
       ORDER BY name ASC`
    );

    return NextResponse.json(
      {
        success: true,
        categories: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
