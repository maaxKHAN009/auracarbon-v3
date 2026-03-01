'use client';

import { useState, useEffect } from 'react';
import { Lock, Check, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';

interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function ResetPasswordForm({
  token,
  onSuccess,
  onBack,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Validate token on mount
    validateToken();
  }, []);

  const validateToken = async () => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setTokenValid(true);
      } else {
        setError('Invalid or expired reset link. Please try again.');
      }
    } catch (err) {
      setError('Failed to validate reset link');
      console.error('Token validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password || !confirmPassword) {
      setError('Both password fields are required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2e] border border-[#00CCFF]/30 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 text-[#00CCFF] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2e] border border-[#FF3366]/30">
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-[#FF3366]/20 border border-[#FF3366]/50">
            <AlertCircle className="w-8 h-8 text-[#FF3366]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 text-center">Invalid Link</h2>
        <p className="text-white/60 text-center mb-6">{error}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="w-full px-4 py-3 bg-[#00CCFF]/20 text-[#00CCFF] rounded-lg hover:bg-[#00CCFF]/30 transition-colors"
          >
            Request New Reset Link
          </button>
        )}
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2e] border border-[#00FF88]/30 text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-[#00FF88]/20 border border-[#00FF88]/50">
            <Check className="w-8 h-8 text-[#00FF88]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Password Reset!</h2>
        <p className="text-white/60 mb-6">
          Your password has been reset successfully. Redirecting to login...
        </p>
        <div className="w-full bg-[#00FF88]/20 rounded-full h-1 overflow-hidden">
          <div className="bg-[#00FF88] h-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2e] border border-[#00CCFF]/30">
      <div className="mb-6 flex justify-center">
        <div className="p-4 rounded-full bg-[#00CCFF]/20 border border-[#00CCFF]/50">
          <Lock className="w-6 h-6 text-[#00CCFF]" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Reset Password
      </h2>
      <p className="text-white/60 text-center mb-6">
        Enter your new password below
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#00CCFF]/50 focus:ring-1 focus:ring-[#00CCFF]/30 transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#00CCFF]/50 focus:ring-1 focus:ring-[#00CCFF]/30 transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !password || !confirmPassword}
          className="w-full px-4 py-3 bg-gradient-to-r from-[#00CCFF] to-[#00FF88] text-black font-semibold rounded-lg hover:from-[#00CCFF]/90 hover:to-[#00FF88]/90 disabled:from-white/20 disabled:to-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}
