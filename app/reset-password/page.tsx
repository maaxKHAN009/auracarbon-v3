'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResetPasswordForm from '@/components/auth/reset-password-form';
import { Loader } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('code') || searchParams.get('token');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h1>
          <p className="text-gray-400">
            The password reset link is invalid or has expired.
          </p>
          <a
            href="/login"
            className="mt-4 inline-block px-8 py-3 bg-[#00CCFF] text-black font-bold rounded-lg hover:bg-[#00AADD] transition"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <Loader className="w-8 h-8 animate-spin text-[#00CCFF]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
