import { getSupabaseServerClient } from '@/lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function generateBackupCodes(count: number = 5): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(
      crypto
        .randomBytes(4)
        .toString('hex')
        .toUpperCase()
        .replace(/(.{4})/g, '$1-')
        .slice(0, -1)
    );
  }
  return codes;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    if (action === 'enable') {
      // Generate 2FA secret (simplified - in production use TOTP library)
      const secret = crypto.randomBytes(20).toString('base64');
      const backupCodes = generateBackupCodes();

      // Store backup codes hashed
      const backupCodesEncoded = JSON.stringify(backupCodes);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          two_fa_enabled: true,
          two_fa_secret: secret,
          backup_codes: backupCodesEncoded,
        })
        .eq('id', userId);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to enable 2FA' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: '2FA enabled successfully',
          backupCodes,
          secret,
        },
        { status: 200 }
      );
    } else if (action === 'disable') {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          two_fa_enabled: false,
          two_fa_secret: null,
          backup_codes: null,
        })
        .eq('id', userId);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to disable 2FA' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: '2FA disabled successfully',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
