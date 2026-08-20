'use client';

import {
  LayoutDashboard, CheckSquare, Users, ShoppingBag, Flag, Star,
  Ticket, ScrollText, LogOut, Shield, Menu, X, Stethoscope,
  Store, Home, Package, PawPrint, Building2, AlertTriangle, Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { allowedNav, ROLE_LABELS, ROLE_COLORS } from '@/lib/adminRoles';

const ALL_NAV = [
  { name: 'Overview',   icon: LayoutDashboard, href: '/admin' },
  { name: 'Approvals',  icon: CheckSquare,     href: '/admin/approvals' },
  { name: 'Users',      icon: Users,           href: '/admin/users' },
  { name: 'Vets',       icon: Stethoscope,     href: '/admin/vets' },
  { name: 'Clinics',    icon: Building2,       href: '/admin/clinics' },
  { name: 'Stores',     icon: Store,           href: '/admin/stores' },
  { name: 'Shelters',   icon: Home,            href: '/admin/shelters' },
  { name: 'Products',   icon: Package,         href: '/admin/products' },
  { name: 'Pets',       icon: PawPrint,        href: '/admin/pets' },
  { name: 'Lost & Found', icon: AlertTriangle, href: '/admin/lost-found' },
  { name: 'Orders',     icon: ShoppingBag,     href: '/admin/orders' },
  { name: 'Reports',    icon: Flag,            href: '/admin/reports' },
  { name: 'Reviews',    icon: Star,            href: '/admin/reviews' },
  { name: 'Tickets',    icon: Ticket,          href: '/admin/tickets' },
  { name: 'Audit Log',  icon: ScrollText,      href: '/admin/audit' },
  { name: 'Settings',   icon: Settings,        href: '/admin/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminRole = profile?.admin_role || 'super_admin';
  const NAV = allowedNav(adminRole, ALL_NAV);
  const roleBadgeClass = ROLE_COLORS[adminRole] || ROLE_COLORS.support;
  const roleLabel = ROLE_LABELS[adminRole] || 'Admin';

  const isActive = (href) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">FluffyNest</h1>
            <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">ADMIN PANEL</p>
          </div>
        </div>
      </div>

      {/* Admin info + role badge */}
      <div className="px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-red-900 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-[10px] text-gray-500 truncate">{profile?.email}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadgeClass}`}>
          {roleLabel}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 overflow-y-auto space-y-0.5">
        {NAV.map(({ name, icon: Icon, href }) => (
          <Link key={href} href={href} onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(href)
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}>
            <Icon size={16} className="shrink-0" />
            <span>{name}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-gray-200 shrink-0">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden shadow-2xl">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 border-r border-gray-200 z-20">
        <SidebarContent />
      </div>
    </>
  );
}
