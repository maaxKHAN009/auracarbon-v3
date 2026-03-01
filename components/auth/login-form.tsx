'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, AlertCircle, Loader } from 'lucide-react';
import ForgotPasswordForm from './forgot-password-form';
import TwoFALoginForm from './two-fa-login-form';

interface LoginFormProps {
  onLogin: (role: 'client' | 'admin', userId?: string, userEmail?: string) => void;
  onSwitchToRegister?: () => void;
  onAdminSetup?: () => void;
}

export function LoginForm({ onLogin, onSwitchToRegister, onAdminSetup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [pending2FAUserId, setPending2FAUserId] = useState('');
  const [pending2FARole, setPending2FARole] = useState<'client' | 'admin'>('client');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Check if 2FA is required
      if (data.requires2FA) {
        setPending2FAUserId(data.user.id);
        setPending2FARole(data.user.isAdmin ? 'admin' : 'client');
        setShow2FA(true);
      } else {
        // Use user role from response
        const isAdmin = data.user?.isAdmin || false;
        onLogin(isAdmin ? 'admin' : 'client', data.user?.id, data.user?.email);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0e1a] via-[#0f1929] to-[#0a0e1a]">
      {show2FA ? (
        <div className="w-full">
          <TwoFALoginForm
            userId={pending2FAUserId}
            onSuccess={() => {
              onLogin(pending2FARole, pending2FAUserId);
            }}
            onBack={() => {
              setShow2FA(false);
              setPending2FAUserId('');
            }}
          />
        </div>
      ) : showForgotPassword ? (
        <div className="w-full">
          <ForgotPasswordForm
            onBack={() => setShowForgotPassword(false)}
            onSuccess={() => setShowForgotPassword(false)}
          />
        </div>
      ) : (
        <GlassCard className="w-full max-w-md p-8" delay={0.1}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#00FF88] to-[#00CCFF] flex items-center justify-center shadow-lg shadow-[#00FF88]/20 mb-4">
            <span className="font-display font-bold text-[#121212] text-3xl">A</span>
          </div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-white">AuraCarbon</h1>
          <p className="text-sm text-white/60 mt-2">Sign in to your command center</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FF3366]/20 border border-[#FF3366]/50 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF3366] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#FF3366]">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] transition-all disabled:opacity-50"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] transition-all disabled:opacity-50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-[#00FF88] to-[#00CCFF] text-[#121212] font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Access Terminal <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-[#FFCC00] hover:text-[#FFCC00]/80 transition-colors text-sm font-medium"
            >
              Forgot Password?
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-xs text-white/40 space-y-3">
          <p>Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-[#00CCFF] hover:text-[#00CCFF]/80 transition-colors"
            >
              Register here
            </button>
          </p>
          <p className="border-t border-white/10 pt-3">
            {onAdminSetup && (
              <>
                First time? <br />
                <button
                  onClick={onAdminSetup}
                  className="text-[#FFCC00] hover:text-[#FFCC00]/80 transition-colors font-medium"
                >
                  Setup Admin Account
                </button>
                <br />
              </>
            )}
            Default credentials: <br />
            Email: <code className="text-[#00FF88]">demo@test.com</code> <br />
            Password: <code className="text-[#00FF88]">password123</code>
          </p>
        </div>
      </GlassCard>
      )}
    </div>
  );
}
