import { getSupabaseServerClient } from '@/lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Check if token exists and is not expired
    const { data: user, error } = await supabase
      .from('users')
      .select('id, reset_token_expires_at')
      .eq('reset_token', token)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    const expiresAt = new Date(user.reset_token_expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Token is valid' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Validate reset token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
