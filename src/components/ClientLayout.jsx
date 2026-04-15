'use client';

import Sidebar from "@/components/Sidebar";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const authRoutes = ['/login', '/signup'];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = authRoutes.includes(pathname);
  const isDashboardPage = pathname.startsWith('/vet-dashboard') || pathname.startsWith('/seller-dashboard') || pathname.startsWith('/shelter-dashboard') || pathname.startsWith('/admin-dashboard');

  if (isAuthPage || isDashboardPage) {
    return (
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Sidebar />
        <main className="lg:ml-64 pt-16 lg:pt-0">
          {children}
        </main>
      </CartProvider>
    </AuthProvider>
  );
}
