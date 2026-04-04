'use client';

import Sidebar from "@/components/Sidebar";
import { CartProvider } from "@/context/CartContext";

export default function ClientLayout({ children }) {
  return (
    <CartProvider>
      <Sidebar />
      <main className="lg:ml-48 pt-16 lg:pt-0">
        {children}
      </main>
    </CartProvider>
  );
}
