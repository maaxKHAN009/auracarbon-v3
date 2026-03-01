'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Shield, Trash2, ToggleLeft, ToggleRight, Loader } from 'lucide-react';

interface User {
  id: string;
  email: string;
  company_name: string;
  facility_type: string;
  country: string;
  status: 'active' | 'inactive';
  is_admin: boolean;
  email_verified: boolean;
  two_fa_enabled: boolean;
  created_at: string;
}

export function UserManagementPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, isCurrentlyAdmin: boolean) => {
    setProcessing(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-role',
          userId,
          newRole: isCurrentlyAdmin ? 'user' : 'admin',
        }),
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_admin: !isCurrentlyAdmin } : u
          )
        );
      }
    } catch (error) {
      console.error('Error changing role:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    setProcessing(userId);
    try {
      const action = currentStatus === 'active' ? 'deactivate' : 'activate';
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId }),
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  status: currentStatus === 'active' ? 'inactive' : 'active',
                }
              : u
          )
        );
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setProcessing(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId }),
      });

      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">User Management</h3>
          <p className="text-xs text-white/40 mt-1">{users.length} total users</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-[#00CCFF] animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-white/40">No users yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/60 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-white/60 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-white/60 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-white/60 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-white/60 font-medium">2FA</th>
                <th className="text-left py-3 px-4 text-white/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white">{user.email}</td>
                  <td className="py-3 px-4 text-white/70">{user.company_name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-[#00FF88]/20 text-[#00FF88]'
                          : 'bg-[#FF3366]/20 text-[#FF3366]'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {user.is_admin ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#FFCC00]/20 text-[#FFCC00] flex items-center gap-1 w-fit">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="text-white/60">User</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {user.two_fa_enabled ? (
                      <span className="text-[#00FF88] text-xs font-medium">✓ Enabled</span>
                    ) : (
                      <span className="text-white/40 text-xs">Disabled</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        disabled={processing === user.id}
                        className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {processing === user.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : user.status === 'active' ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      {!user.is_admin && (
                        <button
                          onClick={() => handleChangeRole(user.id, false)}
                          disabled={processing === user.id}
                          className="px-2 py-1 text-xs text-[#FFCC00] border border-[#FFCC00]/30 rounded hover:bg-[#FFCC00]/10 transition-colors disabled:opacity-50"
                        >
                          Make Admin
                        </button>
                      )}
                      {user.is_admin && (
                        <button
                          onClick={() => handleChangeRole(user.id, true)}
                          disabled={processing === user.id}
                          className="px-2 py-1 text-xs text-white/60 border border-white/20 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                          Demote
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={processing === user.id}
                        className="p-1 text-[#FF3366]/60 hover:text-[#FF3366] hover:bg-[#FF3366]/10 rounded transition-colors disabled:opacity-50"
                        title="Delete user"
                      >
                        {processing === user.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
