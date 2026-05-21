'use client';

import { LayoutDashboard, CheckSquare, Users, ShoppingBag, Flag, Star, Ticket, ScrollText, LogOut, Shield, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/admin' },
    { name: 'Approvals', icon: CheckSquare, href: '/admin/approvals' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
    { name: 'Reports', icon: Flag, href: '/admin/reports' },
    { name: 'Reviews', icon: Star, href: '/admin/reviews' },
    { name: 'Tickets', icon: Ticket, href: '/admin/tickets' },
    { name: 'Audit Log', icon: ScrollText, href: '/admin/audit' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">FluffyNest</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">ADMIN PANEL</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-900 rounded-full flex items-center justify-center text-red-400 font-bold text-sm">
            {profile?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ name, icon: Icon, href }) => (
          <Link key={name} href={href} onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(href)
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}>
            <Icon size={18} /><span>{name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-gray-800 transition-colors w-full">
          <LogOut size={18} /><span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-950 border-b border-gray-800 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">Admin Panel</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 hover:bg-gray-800 rounded-lg text-white">
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden shadow-2xl">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 border-r border-gray-800 z-20">
        <SidebarContent />
      </div>
    </>
  );
}
