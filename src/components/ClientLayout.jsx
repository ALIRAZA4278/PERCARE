'use client';

import Sidebar from "@/components/Sidebar";
import { CartProvider } from "@/context/CartContext";
import { usePathname } from "next/navigation";

const authRoutes = ['/login', '/signup'];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = authRoutes.includes(pathname);

  if (isAuthPage) {
    return <CartProvider>{children}</CartProvider>;
  }

  return (
    <CartProvider>
      <Sidebar />
      <main className="lg:ml-48 pt-16 lg:pt-0">
        {children}
      </main>
    </CartProvider>
  );
}
