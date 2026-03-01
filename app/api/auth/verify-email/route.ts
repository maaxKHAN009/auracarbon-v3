import { getSupabaseServerClient } from '@/lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, registrationId } = await request.json();

    if (!code || !registrationId) {
      return NextResponse.json(
        { error: 'Code and registration ID are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Get the pending registration with the code
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

    // Check if code matches and hasn't expired (24 hours)
    if (registration.verification_code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    const codeCreatedAt = new Date(registration.created_at).getTime();
    const now = new Date().getTime();
    const hoursDiff = (now - codeCreatedAt) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please register again.' },
        { status: 400 }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('pending_registrations')
      .update({ 
        is_verified: true,
        verification_code: null,
        verified_at: new Date().toISOString()
      })
      .eq('id', registrationId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Email verified successfully! Awaiting admin approval.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
