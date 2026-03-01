/**
 * User logout API endpoint
 */

import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const response = Response.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear auth cookie
  response.cookies.set('auth_user', '', {
    httpOnly: false,
    maxAge: 0,
  });

  return response;
}
