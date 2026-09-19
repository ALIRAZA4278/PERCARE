'use client';

import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/sections/Footer';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { FeatureFlagsProvider } from '@/context/FeatureFlagsContext';
import { usePathname } from 'next/navigation';

const authRoutes = ['/login', '/signup'];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = authRoutes.includes(pathname);
  const isDashboardPage =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  const content =
    isAuthPage || isDashboardPage ? (
      children
    ) : (
      // Public app shell — mirrors the reference layout: sticky desktop
      // sidebar, content column with footer, and a fixed mobile bottom nav
      // (the h-16 spacer keeps content clear of it).
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1">{children}</main>
          <Footer />
          <div className="h-16 md:hidden" />
        </div>
        <BottomNav />
      </div>
    );

  return (
    <AuthProvider>
      <FeatureFlagsProvider>
        <CartProvider>{content}</CartProvider>
      </FeatureFlagsProvider>
    </AuthProvider>
  );
}
