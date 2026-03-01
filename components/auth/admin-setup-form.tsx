'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader, Shield } from 'lucide-react';

export function AdminSetupForm() {
  const [adminEmail, setAdminEmail] = useState('khanmaghaz29@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await fetch('/api/admin/setup');
      const data = await response.json();
      setAdminExists(data.adminExists);
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminEmail || !adminPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (adminPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (adminPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, adminPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup admin');
      }

      setSuccess(true);
      setAdminPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup admin account');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-[#00FF88] animate-spin" />
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0e1a] via-[#0f1929] to-[#0a0e1a]">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-xl">
          <div className="text-center">
            <Shield className="w-16 h-16 text-[#00FF88] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Admin Already Configured</h1>
            <p className="text-white/60 mb-6">Your admin account is ready to use.</p>
            <div className="p-4 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-lg mb-6">
              <p className="text-sm text-white/60 mb-2">Admin Email:</p>
              <p className="text-white font-mono break-all">khanmaghaz29@gmail.com</p>
            </div>
            <p className="text-sm text-white/40">
              Go to the login page and sign in with your configured credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0e1a] via-[#0f1929] to-[#0a0e1a]">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-xl">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-[#00FF88] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Admin Setup Complete! ✓</h1>
            <p className="text-white/60 mb-6">Your admin account has been created successfully.</p>
            <div className="p-4 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-lg mb-6 text-left">
              <p className="text-sm text-white/60 mb-1">Email:</p>
              <p className="text-white font-mono mb-3 break-all">{adminEmail}</p>
              <p className="text-xs text-[#00FF88]">✓ Account is active and ready to use</p>
            </div>
            <a
              href="/login"
              className="block w-full px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#00CCFF] text-black font-bold rounded-lg hover:opacity-90 transition-opacity text-center"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0e1a] via-[#0f1929] to-[#0a0e1a]">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-xl">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-[#FFCC00] mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FF88] to-[#00CCFF] bg-clip-text text-transparent mb-2">
            Setup Admin
          </h1>
          <p className="text-white/60">Create your superadmin account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FF3366]/20 border border-[#FF3366]/50 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF3366] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#FF3366]">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Admin Email</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50 transition-colors disabled:opacity-50"
              required
            />
            <p className="text-xs text-white/40 mt-1">This email will be used for admin login</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50 transition-colors disabled:opacity-50"
              required
            />
            <p className="text-xs text-white/40 mt-1">Minimum 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50 transition-colors disabled:opacity-50"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#FFCC00] to-[#FF6600] text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 mt-6"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? 'Setting Up...' : 'Create Admin Account'}
          </button>
        </form>

        <p className="text-xs text-white/40 text-center mt-6">
          This is a one-time setup. Save your credentials securely.
        </p>
      </div>
    </div>
  );
}
