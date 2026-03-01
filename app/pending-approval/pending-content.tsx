'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { Clock, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function PendingContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [displayEmail, setDisplayEmail] = useState(email || 'your email');

  useEffect(() => {
    if (email) {
      setDisplayEmail(email);
    }
  }, [email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full">
        <div className="text-center">
          {/* Pending icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-[#FFCC00]/20 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-[#FFCC00] animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">Pending Approval</h1>
          <p className="text-white/60 text-sm mb-6">
            Your registration is being reviewed by our admin team
          </p>

          {/* Email info */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 text-left">
              <Mail className="w-5 h-5 text-[#00CCFF] flex-shrink-0" />
              <div>
                <p className="text-xs text-white/60">Registered Email</p>
                <p className="text-sm font-medium text-white break-all">{displayEmail}</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-[#FFCC00]/10 border border-[#FFCC00]/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-white/80">
              ✉️ An approval notification email has been sent to the admin team at{' '}
              <strong>khanmaghaz29@gmail.com</strong>
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#00FF88]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-[#00FF88] rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Registration Submitted</p>
                <p className="text-xs text-white/60">Your application has been recorded</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#FFCC00]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-3 h-3 text-[#FFCC00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Pending Review</p>
                <p className="text-xs text-white/60">Admin team is reviewing your details</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-white/40 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Account Activated</p>
                <p className="text-xs text-white/60">You'll be notified once approved</p>
              </div>
            </div>
          </div>

          {/* Info message */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <p className="text-xs text-white/70">
              <strong>Typical approval time:</strong> Usually within 24 hours. You'll receive an email notification once
              your account has been approved by the admin team.
            </p>
          </div>

          {/* Back to login button */}
          <Link
            href="/login"
            className="w-full px-4 py-2 bg-[#00CCFF]/20 text-[#00CCFF] rounded-lg hover:bg-[#00CCFF]/30 transition-colors font-medium inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
