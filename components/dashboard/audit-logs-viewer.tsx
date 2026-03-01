'use client';

import { useState, useEffect } from 'react';
import { FileText, Loader, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface AuditLog {
  id: string;
  action: string;
  user_id?: string;
  admin_id?: string;
  target_user_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

interface AuditLogsViewerProps {
  adminId?: string;
}

const ACTION_LABELS: Record<string, string> = {
  'user_registered': '👤 User Registered',
  'user_login': '🔓 User Login',
  'user_logout': '🔒 User Logout',
  'user_password_changed': '🔑 Password Changed',
  'user_2fa_enabled': '🔐 2FA Enabled',
  'user_2fa_disabled': '🔐 2FA Disabled',
  'admin_approved_registration': '✅ Registration Approved',
  'admin_rejected_registration': '❌ Registration Rejected',
  'admin_promoted_user': '⬆️ User Promoted to Admin',
  'admin_demoted_user': '⬇️ User Demoted from Admin',
  'admin_deactivated_user': '🚫 User Deactivated',
  'admin_activated_user': '✅ User Activated',
  'admin_deleted_user': '🗑️ User Deleted',
  'admin_account_created': '👑 Admin Account Created',
};

export function AuditLogsViewer({ adminId }: AuditLogsViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/admin/audit-logs?limit=${logsPerPage}&offset=${currentPage * logsPerPage}`,
        {
          headers: {
            'Authorization': `Bearer admin`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string): string => {
    if (action.includes('approved') || action.includes('activated') || action.includes('promoted')) {
      return 'text-[#00FF88]';
    }
    if (action.includes('rejected') || action.includes('deactivated') || action.includes('demoted') || action.includes('deleted')) {
      return 'text-[#FF3366]';
    }
    return 'text-[#00CCFF]';
  };

  const getActionBgColor = (action: string): string => {
    if (action.includes('approved') || action.includes('activated') || action.includes('promoted')) {
      return 'bg-[#00FF88]/10';
    }
    if (action.includes('rejected') || action.includes('deactivated') || action.includes('demoted') || action.includes('deleted')) {
      return 'bg-[#FF3366]/10';
    }
    return 'bg-[#00CCFF]/10';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(date);
  };

  return (
    <GlassCard className="w-full p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-[#00CCFF]" />
        <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-[#00CCFF] animate-spin" />
          <span className="ml-3 text-white/60">Loading audit logs...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60">No audit logs found</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-lg border border-white/10 ${getActionBgColor(log.action)} transition-all hover:border-white/20`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className={`font-semibold ${getActionColor(log.action)}`}>
                      {ACTION_LABELS[log.action] || log.action}
                    </p>
                    <p className="text-white/50 text-sm mt-1">
                      {formatDate(log.created_at)}
                    </p>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-white/40 text-xs mt-2">
                        Details: {JSON.stringify(log.details).substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-white/50">
                    {log.user_id && <p>User: {log.user_id.substring(0, 8)}...</p>}
                    {log.admin_id && <p>Admin: {log.admin_id.substring(0, 8)}...</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 text-[#00CCFF] hover:bg-[#00CCFF]/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-white/60 text-sm">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 text-[#00CCFF] hover:bg-[#00CCFF]/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
}
