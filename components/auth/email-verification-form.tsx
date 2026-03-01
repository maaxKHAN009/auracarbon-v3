'use client';

import { useState } from 'react';
import { Mail, Check, AlertCircle, Loader } from 'lucide-react';

interface EmailVerificationFormProps {
  registrationId: string;
  email: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function EmailVerificationForm({
  registrationId,
  email,
  onSuccess,
  onBack,
}: EmailVerificationFormProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          registrationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      setSuccess(true);
      setCode('');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });

      if (response.ok) {
        setError('');
        alert('Verification code sent to ' + email);
      } else {
        setError('Failed to resend code');
      }
    } catch (err) {
      setError('Error resending code');
      console.error('Resend error:', err);
    } finally {
      setResending(false);
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
        <h2 className="text-2xl font-bold text-white mb-3">Email Verified!</h2>
        <p className="text-white/60 mb-6">
          Your email has been verified successfully. Redirecting to login...
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
          <Mail className="w-6 h-6 text-[#00CCFF]" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Verify Email
      </h2>
      <p className="text-white/60 text-center mb-6">
        We sent a verification code to <span className="text-[#00CCFF]">{email}</span>
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#00CCFF]/50 focus:ring-1 focus:ring-[#00CCFF]/30 text-center text-2xl tracking-widest"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full px-4 py-3 bg-gradient-to-r from-[#00CCFF] to-[#00FF88] text-black font-semibold rounded-lg hover:from-[#00CCFF]/90 hover:to-[#00FF88]/90 disabled:from-white/20 disabled:to-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/10 text-center">
        <p className="text-white/60 text-sm mb-3">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResendCode}
          disabled={resending}
          className="text-[#00CCFF] hover:text-[#00CCFF]/80 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {resending ? 'Sending...' : 'Resend Code'}
        </button>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="w-full mt-4 px-4 py-2 text-white/60 hover:text-white transition-colors text-sm"
        >
          ← Back to Login
        </button>
      )}
    </div>
  );
}
