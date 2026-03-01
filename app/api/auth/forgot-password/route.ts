import { getSupabaseServerClient } from '@/lib/supabase-client';
import { sendPasswordResetEmail } from '@/lib/email-verification-service';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json(
        { success: true, message: 'If an account exists with this email, a reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to generate reset link' },
        { status: 500 }
      );
    }

    // Send password reset email
    try {
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(email, resetLink);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { success: true, message: 'If an account exists with this email, a reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
