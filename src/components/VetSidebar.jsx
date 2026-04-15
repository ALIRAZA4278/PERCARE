'use client';

import { LayoutDashboard, Calendar, Users, Building2, Store, Bell, User, Settings, LogOut, Stethoscope, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function VetSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/vet-dashboard' },
    { name: 'Appointments', icon: Calendar, href: '/vet-dashboard/appointments' },
    { name: 'Patients', icon: Users, href: '/vet-dashboard/patients' },
    { name: 'My Clinic', icon: Building2, href: '/vet-dashboard/clinic' },
    { name: 'My Store', icon: Store, href: '/vet-dashboard/store' },
    { name: 'Notifications', icon: Bell, href: '/vet-dashboard/notifications' },
    { name: 'Profile', icon: User, href: '/vet-dashboard/profile' },
    { name: 'Settings', icon: Settings, href: '/vet-dashboard/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (href) => {
    if (href === '/vet-dashboard') return pathname === '/vet-dashboard';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Stethoscope size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">PetCare</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">VET DASHBOARD</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
            {profile?.full_name?.charAt(0) || 'D'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name || 'Doctor'}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ name, icon: Icon, href }) => (
          <Link key={name} href={href} onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(href) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}>
            <Icon size={18} />
            <span>{name}</span>
          </Link>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-gray-100">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Vet Dashboard</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 lg:hidden shadow-xl">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20">
        <SidebarContent />
      </div>
    </>
  );
}
