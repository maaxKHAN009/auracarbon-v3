/**
 * Audit logging service
 * Logs all admin actions and user activities for compliance and monitoring
 */

import { getSupabaseServerClient } from './supabase-client';

export type AuditAction =
  | 'user_registered'
  | 'user_login'
  | 'user_logout'
  | 'user_password_changed'
  | 'user_2fa_enabled'
  | 'user_2fa_disabled'
  | 'admin_approved_registration'
  | 'admin_rejected_registration'
  | 'admin_promoted_user'
  | 'admin_demoted_user'
  | 'admin_deactivated_user'
  | 'admin_activated_user'
  | 'admin_deleted_user'
  | 'admin_account_created';

interface AuditLogEntry {
  action: AuditAction;
  userId?: string;
  adminId?: string;
  targetUserId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry) {
  try {
    const supabase = getSupabaseServerClient();

    const { error } = await supabase.from('audit_logs').insert({
      action: entry.action,
      user_id: entry.userId,
      admin_id: entry.adminId,
      target_user_id: entry.targetUserId,
      details: entry.details,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (err) {
    console.error('Audit logging error:', err);
    // Don't throw - audit logging should not break main operations
  }
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(
  limit: number = 100,
  offset: number = 0,
  filters?: {
    action?: AuditAction;
    userId?: string;
    adminId?: string;
    startDate?: Date;
    endDate?: Date;
  }
) {
  try {
    const supabase = getSupabaseServerClient();

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      logs: data || [],
      total: count || 0,
    };
  } catch (err) {
    console.error('Failed to retrieve audit logs:', err);
    return {
      logs: [],
      total: 0,
    };
  }
}

/**
 * Get activity summary for user dashboard
 */
export async function getUserActivitySummary(userId: string) {
  try {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('action, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Failed to retrieve user activity:', err);
    return [];
  }
}
