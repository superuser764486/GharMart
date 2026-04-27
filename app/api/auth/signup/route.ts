import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/auth/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone } = await request.json();

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Sign up
    const result = await signUp(email, password, fullName, phone);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, errorCode: result.error },
        { status: 400 }
      );
    }

    // Set tokens in httpOnly cookies
    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
        user: result.user,
      },
      { status: 201 }
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
