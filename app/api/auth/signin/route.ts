import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in
    const result = await signIn(email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, errorCode: result.error },
        { status: 401 }
      );
    }

    // Set tokens in httpOnly cookies
    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
        user: result.user,
      },
      { status: 200 }
    );

    if (result.tokens) {
      response.cookies.set('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });

      response.cookies.set('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
