'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/20 flex">
      <aside className="hidden lg:flex w-64 bg-background border-r border-border sticky top-0 h-screen flex-col shrink-0">
        <AdminSidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-background border-b border-border flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted transition-colors shrink-0"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <AdminHeader />
        </header>

        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          >
            <aside
              className="w-64 h-full bg-background flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
