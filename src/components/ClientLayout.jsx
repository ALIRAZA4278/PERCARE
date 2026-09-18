'use client';

import Sidebar from "@/components/Sidebar";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { FeatureFlagsProvider } from "@/context/FeatureFlagsContext";
import { usePathname } from "next/navigation";

const authRoutes = ['/login', '/signup'];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = authRoutes.includes(pathname);
  const isDashboardPage = pathname.startsWith('/dashboard/vet') || pathname.startsWith('/dashboard/seller') || pathname.startsWith('/dashboard/shelter') || pathname.startsWith('/admin-dashboard') || pathname.startsWith('/admin');

  if (isAuthPage || isDashboardPage) {
    return (
      <AuthProvider>
        <FeatureFlagsProvider>
          <CartProvider>{children}</CartProvider>
        </FeatureFlagsProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <FeatureFlagsProvider>
        <CartProvider>
          <Sidebar />
          <main className="lg:ml-64 pt-16 lg:pt-0">
            {children}
          </main>
        </CartProvider>
      </FeatureFlagsProvider>
    </AuthProvider>
  );
}
