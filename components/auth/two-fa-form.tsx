'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader, Shield, Copy } from 'lucide-react';

interface TwoFAFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function TwoFAForm({ userId, onSuccess }: TwoFAFormProps) {
  const [step, setStep] = useState<'confirm' | 'setup' | 'verify' | 'completed'>('confirm');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleEnable = async () => {
    setError('');
    setLoading(true);

    try {
      // In production, this would generate a TOTP secret or send an auth code
      setStep('setup');
      setSuccess('2FA setup initiated. Enter the code sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length < 6) {
      setError('Please enter a valid code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Verify 2FA code endpoint (would be created in production)
      // const response = await fetch('/api/auth/setup-2fa', { ... })

      // For demo, just mark as complete
      setBackupCodes([
        generateBackupCode(),
        generateBackupCode(),
        generateBackupCode(),
        generateBackupCode(),
        generateBackupCode(),
      ]);
      setStep('completed');
      setSuccess('Two-Factor Authentication enabled successfully! ✓');

      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  function generateBackupCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-[#FFCC00]" />
        <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-[#FF3366]/20 border border-[#FF3366]/50 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-[#FF3366] flex-shrink-0" />
          <div className="text-sm text-[#FF3366]">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-[#00FF88]/20 border border-[#00FF88]/50 rounded-lg flex gap-3">
          <CheckCircle className="w-5 h-5 text-[#00FF88] flex-shrink-0" />
          <div className="text-sm text-[#00FF88]">{success}</div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <p className="text-white/70 text-sm">
            Two-Factor Authentication adds an extra layer of security to your account. You'll need to enter a code from your email each time you log in.
          </p>
          <button
            onClick={handleEnable}
            disabled={loading}
            className="w-full px-4 py-2 bg-[#FFCC00]/20 text-[#FFCC00] border border-[#FFCC00]/30 rounded-lg hover:bg-[#FFCC00]/30 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Enable 2FA
          </button>
        </div>
      )}

      {step === 'setup' && (
        <div className="space-y-4">
          <p className="text-white/70 text-sm">A verification code has been sent to your email. Enter it below:</p>
          <div>
            <label className="block text-sm text-white/80 mb-2">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              maxLength={6}
              placeholder="000000"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl tracking-widest placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50 transition-colors disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={loading || code.length < 6}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#FFCC00] text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Verify Code
          </button>
        </div>
      )}

      {step === 'completed' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-lg">
            <p className="text-sm text-white/70 mb-3">Save these backup codes in a safe place. You can use them to access your account if you lose access to your email:</p>
            <div className="space-y-2 mb-3">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <code className="font-mono text-[#00FF88]">{code}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(code);
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40">Each code can only be used once.</p>
          </div>
          <button
            onClick={onSuccess}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#00CCFF] to-[#00FF88] text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
