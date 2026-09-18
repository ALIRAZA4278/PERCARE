'use client';

import DashboardShell from '@/components/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import FeatureDisabled from '@/components/FeatureDisabled';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SellerDashboardLayout({ children }) {
  const { profile, isLoggedIn, loading } = useAuth();
  const { marketplaceEnabled, loading: flagsLoading } = useFeatureFlags();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) { router.push('/login'); return; }
    if (!loading && profile && !['seller', 'company'].includes(profile.role)) { router.push('/'); }
  }, [loading, isLoggedIn, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }
  if (!isLoggedIn || !profile || !['seller', 'company'].includes(profile.role)) return null;
  if (!flagsLoading && !marketplaceEnabled) return <FeatureDisabled title="Marketplace" />;

  return <DashboardShell role="seller">{children}</DashboardShell>;
}
