import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/auth/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await requestPasswordReset(email);

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json(
      { success: true, message: result.message },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset' },
      { status: 500 }
    );
  }
}
