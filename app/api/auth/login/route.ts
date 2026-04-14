/**
 * User login API endpoint
 */

import { loginUser } from '@/lib/auth-service';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const DEMO_EMAIL = 'demo@auracarbon.ai';
const DEMO_PASSWORD = 'AuraDemo2026!';
const LEGACY_DEMO_EMAIL = 'demo@test.com';
const LEGACY_DEMO_PASSWORD = 'password123';

const DEMO_USER = {
  id: 'demo-user',
  email: DEMO_EMAIL,
  companyName: 'AuraCarbon Demo Facility',
  facilityType: 'Cement Plant',
  country: 'Germany',
  isAdmin: false,
  two_fa_enabled: false,
};

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

    // Hackathon reviewer path: always-available demo account without approval flow
    const normalizedEmail = String(email).trim().toLowerCase();
    const isPrimaryDemoLogin = normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD;
    const isLegacyDemoLogin = normalizedEmail === LEGACY_DEMO_EMAIL && password === LEGACY_DEMO_PASSWORD;

    if (isPrimaryDemoLogin || isLegacyDemoLogin) {
      const demoResponse = NextResponse.json(
        {
          success: true,
          user: DEMO_USER,
          requires2FA: false,
        },
        { status: 200 }
      );

      demoResponse.cookies.set('auth_user', JSON.stringify(DEMO_USER), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });

      return demoResponse;
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
