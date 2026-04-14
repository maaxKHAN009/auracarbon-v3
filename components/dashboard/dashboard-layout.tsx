'use client';

import React, { useEffect, useState } from 'react';
import { CarbonVelocity } from './carbon-velocity';
import { EmissionsPieChart } from './emissions-pie-chart';
import { CbamScore } from './cbam-score';
import { CarbonPricesWidget } from './carbon-prices-widget';
import { RecipeBuilder } from './recipe-builder';
import { AdminPanel } from './admin-panel';
import { AdminApprovalPanel } from './admin-approval-panel';
import { UserManagementPanel } from './user-management-panel';
import { AuditLogsViewer } from './audit-logs-viewer';
import { AccountSettings } from './account-settings';
import { HotspotAnalyzer } from './hotspot-analyzer';
import { CarbonIntensityGauge } from './carbon-intensity-gauge';
import { ExportPanel } from './export-panel';
import { MaterialSubstitutionSuggestions } from './material-substitution';
import { ScenarioPlanner } from './scenario-planner';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, User, LogOut, Shield, CheckSquare, FileText } from 'lucide-react';

interface DashboardLayoutProps {
  role: 'client' | 'admin';
  userId?: string;
  userEmail?: string;
  onLogout: () => void;
}

export function DashboardLayout({ role, userId = '', userEmail = '', onLogout }: DashboardLayoutProps) {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminSection, setAdminSection] = useState<'factors' | 'approvals' | 'users' | 'audit'>('factors');
  const [showSettings, setShowSettings] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    if (role !== 'admin') {
      setPendingApprovalsCount(0);
      return;
    }

    let active = true;
    const fetchPendingCount = async () => {
      try {
        const response = await fetch('/api/admin/approvals');
        const data = await response.json();
        if (active && data?.success) {
          setPendingApprovalsCount(Array.isArray(data.registrations) ? data.registrations.length : 0);
        }
      } catch {
        if (active) setPendingApprovalsCount(0);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [role]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF88] to-[#00CCFF] flex items-center justify-center shadow-lg shadow-[#00FF88]/20">
            <span className="font-display font-bold text-[#121212] text-xl">A</span>
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold tracking-tight text-white">AuraCarbon</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/40 uppercase tracking-widest">Command Center</p>
              {role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full bg-[#FFCC00]/20 text-[#FFCC00] text-[10px] font-bold uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Super Admin
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {role === 'admin' && (
            <button
              className="relative p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/5"
              title="Pending approvals"
              onClick={() => {
                setShowAdminPanel(true);
                setAdminSection('approvals');
              }}
            >
              <Bell className="w-5 h-5" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF3366] text-white text-[10px] font-bold leading-[18px] text-center">
                  {pendingApprovalsCount > 9 ? '+9' : pendingApprovalsCount}
                </span>
              )}
            </button>
          )}
          {role === 'admin' && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className={`p-2 transition-colors rounded-full hover:bg-white/5 ${showAdminPanel ? 'text-[#00CCFF] bg-[#00CCFF]/10' : 'text-white/60 hover:text-white'}`}
                title="Admin Panel"
              >
                <Shield className="w-5 h-5" />
              </button>
              {showAdminPanel && (
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setAdminSection('factors')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      adminSection === 'factors'
                        ? 'bg-[#00CCFF]/30 text-[#00CCFF]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Emission Factors
                  </button>
                  <button
                    onClick={() => setAdminSection('approvals')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                      adminSection === 'approvals'
                        ? 'bg-[#00CCFF]/30 text-[#00CCFF]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" /> Approvals
                  </button>
                  <button
                    onClick={() => setAdminSection('users')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                      adminSection === 'users'
                        ? 'bg-[#00CCFF]/30 text-[#00CCFF]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4" /> Users
                  </button>
                  <button
                    onClick={() => setAdminSection('audit')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                      adminSection === 'audit'
                        ? 'bg-[#00CCFF]/30 text-[#00CCFF]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Audit
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 transition-colors rounded-full hover:bg-white/5 ${showSettings ? 'text-[#FFCC00] bg-[#FFCC00]/10' : 'text-white/60 hover:text-white'}`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
            <User className="w-5 h-5 text-white/60" />
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-[#FF3366]/60 hover:text-[#FF3366] transition-colors rounded-full hover:bg-[#FF3366]/10 ml-2"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-max">
        {/* Top Row: Key Metrics - Shrink when empty, grow with content */}
        <div className="col-span-1 md:col-span-6">
          <CarbonVelocity />
        </div>
        <div className="col-span-1 md:col-span-6">
          <CbamScore />
        </div>

        {/* Middle Row: Recipe Builder & Admin Panel & Settings */}
        <div className="col-span-1 md:col-span-12">
          <AnimatePresence mode="wait">
            {showSettings ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AccountSettings userId={userId} userEmail={userEmail} onLogout={onLogout} />
              </motion.div>
            ) : showAdminPanel ? (
              <motion.div
                key={`admin-${adminSection}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {adminSection === 'factors' ? (
                  <AdminPanel onClose={() => setShowAdminPanel(false)} />
                ) : adminSection === 'approvals' ? (
                  <AdminApprovalPanel />
                ) : adminSection === 'users' ? (
                  <UserManagementPanel />
                ) : (
                  <AuditLogsViewer adminId={userId} />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="recipe"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <RecipeBuilder />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Carbon Prices Widget - Market Reference for VCM Pricing */}
        <div className="col-span-1 md:col-span-12">
          <CarbonPricesWidget />
        </div>

        {/* Bottom Row: Charts & Analytics - Dynamic sizing */}
        <div className="col-span-1 md:col-span-12 min-h-[300px]">
          <EmissionsPieChart />
        </div>

        {/* Analysis Row - Full Width when needed */}
        <div className="col-span-1 md:col-span-6">
          <HotspotAnalyzer />
        </div>
        <div className="col-span-1 md:col-span-6">
          <CarbonIntensityGauge />
        </div>

        {/* Manual Bridge Export Panel */}
        <div className="col-span-1 md:col-span-12">
          <ExportPanel />
        </div>

        {/* Material Substitution */}
        <div className="col-span-1 md:col-span-12">
          <MaterialSubstitutionSuggestions />
        </div>

        {/* Scenario Planner */}
        <div className="col-span-1 md:col-span-12">
          <ScenarioPlanner />
        </div>
      </div>
    </div>
  );
}
