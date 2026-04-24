'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { LoginForm } from '@/components/auth/login-form';
import { RegistrationForm } from '@/components/auth/registration-form';
import { useCarbonStore } from '@/lib/store';

const AUTH_STORAGE_KEY = 'auracarbon_auth_session';

interface PersistedAuthSession {
  isAuthenticated: boolean;
  role: 'client' | 'admin';
  userId: string;
  userEmail: string;
}

function readCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function Home() {
  const setActiveUser = useCarbonStore((state) => state.setActiveUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    try {
      const cookieRaw = readCookieValue('auth_user');
      if (cookieRaw) {
        const parsed = JSON.parse(cookieRaw);
        const restoredRole: 'client' | 'admin' = parsed.isAdmin ? 'admin' : 'client';

        setRole(restoredRole);
        setUserId(parsed.id || '');
        setUserEmail(parsed.email || '');
        setIsAuthenticated(true);

        const toPersist: PersistedAuthSession = {
          isAuthenticated: true,
          role: restoredRole,
          userId: parsed.id || '',
          userEmail: parsed.email || '',
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toPersist));
      } else {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as PersistedAuthSession;
          if (parsed.isAuthenticated) {
            setRole(parsed.role);
            setUserId(parsed.userId || '');
            setUserEmail(parsed.userEmail || '');
            setIsAuthenticated(true);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore auth session:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setAuthResolved(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setActiveUser(userId, userEmail);
    } else {
      setActiveUser();
    }
  }, [isAuthenticated, userId, userEmail, setActiveUser]);

  const handleLogin = (userRole: 'client' | 'admin', newUserId?: string, newUserEmail?: string) => {
    setRole(userRole);
    setUserId(newUserId || '');
    setUserEmail(newUserEmail || '');
    setIsAuthenticated(true);

    const session: PersistedAuthSession = {
      isAuthenticated: true,
      role: userRole,
      userId: newUserId || '',
      userEmail: newUserEmail || '',
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {
      // Ignore network errors during logout cleanup.
    });

    setIsAuthenticated(false);
    setUserId('');
    setUserEmail('');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const handleRegistrationComplete = () => {
    setShowRegister(false);
  };

  if (!authResolved) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white/60 text-sm">
        Restoring session...
      </main>
    );
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
      />
    );
  }

  return (
    <main className="min-h-screen">
      <DashboardLayout role={role} userId={userId} userEmail={userEmail} onLogout={handleLogout} />
    </main>
  );
}
