import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/customer-auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const result = await getCurrentUser(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, errorCode: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, user: result.user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
