'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { CheckCircle, XCircle, Loader, Eye } from 'lucide-react';

interface PendingRegistration {
  id: string;
  email: string;
  company_name: string;
  facility_type: string;
  country: string;
  phone?: string;
  message?: string;
  created_at: string;
}

interface ModalData {
  registration: PendingRegistration;
  tempPassword?: string;
}

export function AdminApprovalPanel() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/approvals');
      const data = await response.json();

      if (data.success) {
        setRegistrations(data.registrations || []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId: string) => {
    setProcessing(registrationId);
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          registrationId,
          adminUserId: 'admin',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show modal with temp password
        const registration = registrations.find((r) => r.id === registrationId);
        if (registration) {
          setModalData({
            registration,
            tempPassword: data.tempPassword,
          });
        }

        // Remove from list
        setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Failed to approve registration');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (registrationId: string) => {
    const reason = prompt('Enter reason for rejection (optional):');

    setProcessing(registrationId);
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          registrationId,
          reason: reason || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove from list
        setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Failed to reject registration');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-[#00CCFF] animate-spin" />
        </div>
      </GlassCard>
    );
  }

  if (registrations.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <div className="text-white/40 text-sm">No pending registrations</div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Pending Registrations</h3>
            <p className="text-xs text-white/40 mt-1">{registrations.length} applications awaiting approval</p>
          </div>
        </div>

        <div className="space-y-3">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-white">{registration.company_name}</h4>
                    <span className="px-2 py-1 bg-[#FFCC00]/20 text-[#FFCC00] text-xs rounded">
                      {registration.facility_type}
                    </span>
                  </div>
                  <div className="text-xs text-white/60">
                    <p>{registration.email}</p>
                    <p className="mt-1">
                      {registration.country} {registration.phone && `• ${registration.phone}`}
                    </p>
                    <p className="mt-1 text-white/40">
                      Applied: {new Date(registration.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {registration.message && (
                    <div className="mt-3 p-2 bg-white/5 rounded border border-white/5">
                      <p className="text-xs text-white/60">{registration.message}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(registration.id)}
                    disabled={processing === registration.id}
                    className="p-2 bg-[#00FF88]/20 text-[#00FF88] rounded-lg hover:bg-[#00FF88]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    title="Approve"
                  >
                    {processing === registration.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(registration.id)}
                    disabled={processing === registration.id}
                    className="p-2 bg-[#FF3366]/20 text-[#FF3366] rounded-lg hover:bg-[#FF3366]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Reject"
                  >
                    {processing === registration.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Modal - Show temp password after approval */}
      {modalData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <GlassCard className="max-w-md w-full">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 bg-[#00FF88]/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#00FF88]" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">Registration Approved! ✓</h3>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 text-left">
                <div className="text-xs text-white/60 mb-1">Company</div>
                <div className="text-sm font-medium text-white mb-4">{modalData.registration.company_name}</div>

                <div className="text-xs text-white/60 mb-1">Temporary Password</div>
                <div className="px-3 py-2 bg-[#FFCC00]/10 border border-[#FFCC00]/30 rounded text-sm font-mono text-[#FFCC00] break-all">
                  {modalData.tempPassword}
                </div>

                <p className="text-xs text-white/60 mt-3">
                  ⚠️ Share this temporary password with the user. They should change it after first login.
                </p>
              </div>

              <div className="text-sm text-white/60 mb-4">
                An approval email has been sent to <strong>{modalData.registration.email}</strong>
              </div>

              <button
                onClick={() => setModalData(null)}
                className="w-full px-4 py-2 bg-[#00CCFF]/20 text-[#00CCFF] rounded-lg hover:bg-[#00CCFF]/30 transition-colors"
              >
                Close
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
