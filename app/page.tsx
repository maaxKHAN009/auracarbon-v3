'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { LoginForm } from '@/components/auth/login-form';
import { RegistrationForm } from '@/components/auth/registration-form';
import { AdminSetupForm } from '@/components/auth/admin-setup-form';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showAdminSetup, setShowAdminSetup] = useState(false);

  const handleLogin = (userRole: 'client' | 'admin', newUserId?: string, newUserEmail?: string) => {
    setRole(userRole);
    setUserId(newUserId || '');
    setUserEmail(newUserEmail || '');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserId('');
    setUserEmail('');
  };

  const handleRegistrationComplete = () => {
    setShowRegister(false);
  };

  if (showAdminSetup) {
    return <AdminSetupForm />;
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegistrationForm
          onRegistrationComplete={handleRegistrationComplete}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
        onAdminSetup={() => setShowAdminSetup(true)}
      />
    );
  }

  return (
    <main className="min-h-screen">
      <DashboardLayout role={role} userId={userId} userEmail={userEmail} onLogout={handleLogout} />
    </main>
  );
}
