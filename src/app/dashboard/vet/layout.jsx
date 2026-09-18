'use client';

import DashboardShell from '@/components/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VetDashboardLayout({ children }) {
  const { profile, isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
      return;
    }
    if (!loading && profile && profile.role !== 'veterinarian') {
      router.push('/');
    }
  }, [loading, isLoggedIn, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn || !profile || profile.role !== 'veterinarian') return null;

  return <DashboardShell role="vet">{children}</DashboardShell>;
}
