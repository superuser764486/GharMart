import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/auth/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    const result = await resetPassword(token, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, errorCode: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: result.message },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
