import { getSupabaseServerClient } from '@/lib/supabase-client';
import { sendVerificationEmail } from '@/lib/email-verification-service';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { registrationId } = await request.json();

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Get the pending registration
    const { data: registration, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Generate new verification code
    const newCode = generateVerificationCode();

    // Update the registration with new code
    const { error: updateError } = await supabase
      .from('pending_registrations')
      .update({
        verification_code: newCode,
        created_at: new Date().toISOString(),
      })
      .eq('id', registrationId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to generate new code' },
        { status: 500 }
      );
    }

    // Send verification email
    try {
      await sendVerificationEmail(registration.email, newCode, registration.full_name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    return NextResponse.json(
      { success: true, message: 'Verification code sent to your email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
