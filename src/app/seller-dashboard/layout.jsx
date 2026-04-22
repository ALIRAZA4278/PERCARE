'use client';

import SellerSidebar from '@/components/SellerSidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SellerDashboardLayout({ children }) {
  const { profile, isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) { router.push('/login'); return; }
    if (!loading && profile && !['seller', 'company'].includes(profile.role)) { router.push('/'); }
  }, [loading, isLoggedIn, profile]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!isLoggedIn || !profile || !['seller', 'company'].includes(profile.role)) return null;

  return (
    <div>
      <SellerSidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen bg-gray-50">{children}</main>
    </div>
  );
}
