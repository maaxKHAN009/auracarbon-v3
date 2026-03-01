/**
 * Change Password Endpoint
 */

import { getSupabaseServerClient } from '@/lib/supabase-client';
import { hashPassword } from '@/lib/auth-service';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword, confirmPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return Response.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServerClient();

    // Get user
    const { data: user, error: fetchError } = await supabaseServer
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const currentHash = await hashPassword(currentPassword);
    if (currentHash !== user.password_hash) {
      return Response.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabaseServer
      .from('users')
      .update({
        password_hash: newHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      return Response.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password change error:', error);
    return Response.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
