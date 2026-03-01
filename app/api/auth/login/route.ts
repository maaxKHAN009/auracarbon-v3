/**
 * User login API endpoint
 */

import { loginUser } from '@/lib/auth-service';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await loginUser({ email, password });

    // Create response with auth cookie
    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        requires2FA: result.user.two_fa_enabled || false,
      },
      { status: 200 }
    );

    // Set secure cookie with user info
    response.cookies.set('auth_user', JSON.stringify(result.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Login failed';

    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
}
