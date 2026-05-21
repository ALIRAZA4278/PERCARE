'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboardLayout({ children }) {
  const { profile, isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) { router.push('/login'); return; }
    if (!loading && profile && profile.role !== 'admin') { router.push('/'); }
  }, [loading, isLoggedIn, profile]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!isLoggedIn || !profile || profile.role !== 'admin') return null;

  return (
    <div>
      <AdminSidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen bg-gray-50">{children}</main>
    </div>
  );
}
