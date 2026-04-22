'use client';

import { LayoutDashboard, PawPrint, Heart, HandHeart, ClipboardPlus, DollarSign, Bell, Settings, LogOut, Home, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ShelterSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/shelter-dashboard' },
    { name: 'Animals', icon: PawPrint, href: '/shelter-dashboard/animals' },
    { name: 'Adoptions', icon: Heart, href: '/shelter-dashboard/adoptions' },
    { name: 'Donations', icon: HandHeart, href: '/shelter-dashboard/donations' },
    { name: 'Intake', icon: ClipboardPlus, href: '/shelter-dashboard/intake' },
    { name: 'Financials', icon: DollarSign, href: '/shelter-dashboard/financials' },
    { name: 'Notifications', icon: Bell, href: '/shelter-dashboard/notifications' },
    { name: 'Settings', icon: Settings, href: '/shelter-dashboard/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (href) => {
    if (href === '/shelter-dashboard') return pathname === '/shelter-dashboard';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
            <Home size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">PetCare</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">SHELTER DASHBOARD</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">
            {profile?.full_name?.charAt(0) || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name || 'Shelter'}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ name, icon: Icon, href }) => (
          <Link key={name} href={href} onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(href) ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}>
            <Icon size={18} /><span>{name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
          <LogOut size={18} /><span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <Home size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Shelter Dashboard</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 lg:hidden shadow-xl"><SidebarContent /></div>
        </>
      )}

      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20"><SidebarContent /></div>
    </>
  );
}
