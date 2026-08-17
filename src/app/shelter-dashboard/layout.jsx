'use client';

import ShelterSidebar from '@/components/ShelterSidebar';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import FeatureDisabled from '@/components/FeatureDisabled';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ShelterDashboardLayout({ children }) {
  const { profile, isLoggedIn, loading } = useAuth();
  const { sheltersEnabled, loading: flagsLoading } = useFeatureFlags();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) { router.push('/login'); return; }
    if (!loading && profile && profile.role !== 'shelter') { router.push('/'); }
  }, [loading, isLoggedIn, profile]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!isLoggedIn || !profile || profile.role !== 'shelter') return null;
  if (!flagsLoading && !sheltersEnabled) return <FeatureDisabled title="Shelters" />;

  return (
    <div>
      <ShelterSidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen bg-gray-50">{children}</main>
    </div>
  );
}
