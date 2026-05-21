'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }) {
  const { profile, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (loading) return;
    if (isLoginPage) return;
    if (!isLoggedIn || profile?.role !== 'admin') {
      router.replace('/admin/login');
    }
  }, [loading, isLoggedIn, profile, isLoginPage]);

  // Login page — render directly, no sidebar
  if (isLoginPage) return <>{children}</>;

  // Still checking auth — show nothing (no flash of sidebar)
  if (loading) return null;

  // Not admin — show nothing (redirect happening in useEffect)
  if (!isLoggedIn || profile?.role !== 'admin') return null;

  // Confirmed admin — show full layout
  return (
    <div className="bg-gray-950 min-h-screen">
      <AdminSidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen bg-gray-950">
        {children}
      </main>
    </div>
  );
}
