import { getSupabaseServerClient } from '@/lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'User ID and 2FA code are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Get user with backup codes
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, two_fa_enabled, backup_codes')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.two_fa_enabled) {
      return NextResponse.json(
        { error: '2FA is not enabled for this user' },
        { status: 400 }
      );
    }

    // For this implementation, we'll check against backup codes
    // In production, use proper TOTP verification (e.g., speakeasy library)
    let backupCodes: string[] = [];
    try {
      backupCodes = JSON.parse(user.backup_codes || '[]');
    } catch (e) {
      console.error('Failed to parse backup codes:', e);
    }

    // Check if code matches any backup code
    const codeIndex = backupCodes.findIndex(
      (bc: string) => bc === code.toUpperCase().replace(/\s/g, '')
    );

    if (codeIndex === -1) {
      // In production, you could also check time-based OTP here
      // For now, we'll just check backup codes
      return NextResponse.json(
        { error: 'Invalid 2FA code' },
        { status: 400 }
      );
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1);
    const updatedBackupCodes = JSON.stringify(backupCodes);

    const { error: updateError } = await supabase
      .from('users')
      .update({ backup_codes: updatedBackupCodes })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update backup codes:', updateError);
    }

    return NextResponse.json(
      { success: true, message: '2FA verification successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
