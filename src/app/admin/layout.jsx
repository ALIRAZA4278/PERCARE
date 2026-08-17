'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import { canAccess } from '@/lib/adminRoles';

export default function AdminLayout({ children }) {
  const { profile, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = pathname === '/admin/login' || pathname === '/admin/setup';

  useEffect(() => {
    if (loading) return;
    if (isPublicPage) return;

    // Not logged in → login
    if (!isLoggedIn) {
      router.replace('/admin/login');
      return;
    }

    // Logged in but profile hasn't arrived yet (async fetch still in flight) → wait, don't redirect
    if (!profile) return;

    if (profile.role !== 'admin') {
      router.replace('/admin/login');
      return;
    }

    // Logged-in admin but no admin_role yet (legacy) → treat as super_admin, allow everything
    const adminRole = profile.admin_role;
    if (!adminRole) return;

    // Has a role — check page-level permission
    if (!canAccess(adminRole, pathname)) {
      router.replace('/admin'); // redirect to overview
    }
  }, [loading, isLoggedIn, profile, isPublicPage, pathname]);

  if (isPublicPage) return <>{children}</>;
  if (loading) return null;
  if (!isLoggedIn || !profile || profile.role !== 'admin') return null;

  // Check access for roles that have admin_role set
  const adminRole = profile.admin_role;
  if (adminRole && !canAccess(adminRole, pathname) && pathname !== '/admin') return null;

  return (
    <div className="bg-gray-950 min-h-screen">
      <AdminSidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen bg-gray-950">
        {children}
      </main>
    </div>
  );
}
