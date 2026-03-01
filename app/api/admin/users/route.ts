/**
 * User Management API Endpoint
 * Admin can view and manage users
 */

import { getSupabaseServerClient } from '@/lib/supabase-client';
import { logAuditEvent } from '@/lib/audit-service';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabaseServer = getSupabaseServerClient();

    // Get all users (admin only - should add auth check in production)
    const { data: users, error } = await supabaseServer
      .from('users')
      .select('id, email, company_name, facility_type, country, status, is_admin, email_verified, created_at, approved_at, two_fa_enabled')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return Response.json(
      { success: true, users: users || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, newRole, adminId } = await request.json();

    const supabaseServer = getSupabaseServerClient();

    if (action === 'change-role') {
      const { error } = await supabaseServer
        .from('users')
        .update({ is_admin: newRole === 'admin' })
        .eq('id', userId);

      if (error) throw error;

      // Log audit event
      await logAuditEvent({
        action: newRole === 'admin' ? 'admin_promoted_user' : 'admin_demoted_user',
        adminId: adminId || 'system',
        targetUserId: userId,
        details: { newRole },
      });

      return Response.json(
        { success: true, message: 'User role updated' },
        { status: 200 }
      );
    } else if (action === 'deactivate') {
      const { error } = await supabaseServer
        .from('users')
        .update({ status: 'inactive' })
        .eq('id', userId);

      if (error) throw error;

      // Log audit event
      await logAuditEvent({
        action: 'admin_deactivated_user',
        adminId: adminId || 'system',
        targetUserId: userId,
      });

      return Response.json(
        { success: true, message: 'User deactivated' },
        { status: 200 }
      );
    } else if (action === 'activate') {
      const { error } = await supabaseServer
        .from('users')
        .update({ status: 'active' })
        .eq('id', userId);

      if (error) throw error;

      // Log audit event
      await logAuditEvent({
        action: 'admin_activated_user',
        adminId: adminId || 'system',
        targetUserId: userId,
      });

      return Response.json(
        { success: true, message: 'User activated' },
        { status: 200 }
      );
    } else if (action === 'delete') {
      // Soft delete user
      const { error } = await supabaseServer
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Log audit event
      await logAuditEvent({
        action: 'admin_deleted_user',
        adminId: adminId || 'system',
        targetUserId: userId,
      });

      return Response.json(
        { success: true, message: 'User deleted' },
        { status: 200 }
      );
    }

    return Response.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('User management error:', error);
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
