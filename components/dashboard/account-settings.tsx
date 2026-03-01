'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { TwoFAForm } from '@/components/auth/two-fa-form';
import { Settings, LogOut } from 'lucide-react';

interface AccountSettingsProps {
  userId: string;
  userEmail: string;
  onLogout: () => void;
}

export function AccountSettings({ userId, userEmail, onLogout }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<'password' | '2fa' | 'info'>('password');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-[#00CCFF]" />
          <h2 className="text-2xl font-bold text-white">Account Settings</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-[#00CCFF] border-b-2 border-[#00CCFF]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('2fa')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === '2fa'
                ? 'text-[#00CCFF] border-b-2 border-[#00CCFF]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Two-Factor Auth
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-[#00CCFF] border-b-2 border-[#00CCFF]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Account Info
          </button>
        </div>

        {/* Content */}
        {activeTab === 'password' && <ChangePasswordForm userId={userId} />}

        {activeTab === '2fa' && <TwoFAForm userId={userId} />}

        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/60 text-sm mb-2">Email Address</p>
              <p className="text-white font-mono">{userEmail}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/60 text-sm mb-3">Session Management</p>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#FF3366]/20 text-[#FF3366] border border-[#FF3366]/50 rounded-lg hover:bg-[#FF3366]/30 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
