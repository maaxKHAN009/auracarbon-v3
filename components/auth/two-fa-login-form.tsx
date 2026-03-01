'use client';

import { useState } from 'react';
import { Lock, Check, AlertCircle, Loader, ArrowLeft } from 'lucide-react';

interface TwoFALoginFormProps {
  userId: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function TwoFALoginForm({
  userId,
  onSuccess,
  onBack,
}: TwoFALoginFormProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code || code.length < 4) {
      setError('Please enter a valid code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-2fa-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '2FA verification failed');
        return;
      }

      setSuccess(true);
      setCode('');
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('2FA verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2e] border border-[#00FF88]/30 text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-[#00FF88]/20 border border-[#00FF88]/50">
            <Check className="w-8 h-8 text-[#00FF88]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Verified!</h2>
        <p className="text-white/60 mb-6">2FA verification successful. Logging you in...</p>
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

      <h2 className="text-2xl font-bold text-white mb-2 text-center">Two-Factor Authentication</h2>
      <p className="text-white/60 text-center mb-6">
        Enter your 6-digit code or a backup code
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Authentication Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="000000"
            maxLength={8}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#00CCFF]/50 focus:ring-1 focus:ring-[#00CCFF]/30 text-center text-2xl tracking-widest font-mono"
          />
          <p className="text-xs text-white/40 mt-2 text-center">
            Your 6-digit code from your authenticator app or a backup code
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 4}
          className="w-full px-4 py-3 bg-gradient-to-r from-[#00CCFF] to-[#00FF88] text-black font-semibold rounded-lg hover:from-[#00CCFF]/90 hover:to-[#00FF88]/90 disabled:from-white/20 disabled:to-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify & Login'
          )}
        </button>
      </form>

      {onBack && (
        <button
          onClick={onBack}
          className="w-full mt-6 px-4 py-2 text-white/60 hover:text-white transition-colors text-sm flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}
    </div>
  );
}
