'use client';

import {
  Bell,
  Building2,
  Calendar,
  CircleUser,
  ClipboardList,
  DollarSign,
  FileText,
  Heart,
  House,
  Inbox,
  LogOut,
  Menu,
  Package,
  PawPrint,
  Settings,
  ShoppingBag,
  Star,
  Stethoscope,
  Store,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export const DASHBOARD_NAV = {
  user: {
    title: 'My Dashboard',
    navItems: [
      { icon: House, label: 'Overview', path: '/dashboard/user' },
      { icon: PawPrint, label: 'My Pets', path: '/dashboard/user/pets' },
      { icon: Calendar, label: 'Appointments', path: '/dashboard/user/appointments' },
      { icon: ShoppingBag, label: 'My Orders', path: '/dashboard/user/orders' },
      { icon: Heart, label: 'Favourites', path: '/dashboard/user/favourites' },
      { icon: Bell, label: 'Notifications', path: '/dashboard/user/notifications' },
      { icon: CircleUser, label: 'Profile', path: '/dashboard/user/profile' },
      { icon: Settings, label: 'Settings', path: '/dashboard/user/settings' },
    ],
  },
  vet: {
    title: 'Vet Dashboard',
    navItems: [
      { icon: House, label: 'Overview', path: '/dashboard/vet' },
      { icon: Calendar, label: 'Appointments', path: '/dashboard/vet/appointments' },
      { icon: Users, label: 'Patients', path: '/dashboard/vet/patients' },
      { icon: Building2, label: 'My Clinic', path: '/dashboard/vet/clinic' },
      { icon: Store, label: 'My Store', path: '/dashboard/vet/store' },
      { icon: Bell, label: 'Notifications', path: '/dashboard/vet/notifications' },
      { icon: CircleUser, label: 'Profile', path: '/dashboard/vet/profile' },
      { icon: Settings, label: 'Settings', path: '/dashboard/vet/settings' },
    ],
  },
  seller: {
    title: 'Seller Dashboard',
    navItems: [
      { icon: House, label: 'Overview', path: '/dashboard/seller' },
      { icon: Store, label: 'My Store', path: '/dashboard/seller/store' },
      { icon: Package, label: 'Products', path: '/dashboard/seller/products' },
      { icon: ClipboardList, label: 'Orders', path: '/dashboard/seller/orders' },
      { icon: Star, label: 'Reviews', path: '/dashboard/seller/reviews' },
      { icon: TrendingUp, label: 'Analytics', path: '/dashboard/seller/analytics' },
      { icon: Bell, label: 'Notifications', path: '/dashboard/seller/notifications' },
      { icon: Settings, label: 'Settings', path: '/dashboard/seller/settings' },
    ],
  },
  shelter: {
    title: 'Shelter Dashboard',
    navItems: [
      { icon: House, label: 'Overview', path: '/dashboard/shelter' },
      { icon: PawPrint, label: 'Animals', path: '/dashboard/shelter/animals' },
      { icon: Inbox, label: 'Adoptions', path: '/dashboard/shelter/adoptions' },
      { icon: DollarSign, label: 'Donations', path: '/dashboard/shelter/donations' },
      { icon: FileText, label: 'Intake', path: '/dashboard/shelter/intake' },
      { icon: TrendingUp, label: 'Financials', path: '/dashboard/shelter/financials' },
      { icon: Bell, label: 'Notifications', path: '/dashboard/shelter/notifications' },
      { icon: Settings, label: 'Settings', path: '/dashboard/shelter/settings' },
    ],
  },
};

const ROLE_COLOR = {
  user: 'bg-primary',
  vet: 'bg-emerald-600',
  seller: 'bg-amber-600',
  shelter: 'bg-rose-600',
};

export default function DashboardShell({ role, children }) {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { title, navItems } = DASHBOARD_NAV[role];
  const accent = ROLE_COLOR[role];

  const name = profile?.full_name || 'PetCare User';
  const email = profile?.email || '';

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const panel = (
    <>
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 mb-4">
          <div className={`w-9 h-9 rounded-xl ${accent} flex items-center justify-center`}>
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground block leading-tight">PetCare</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {title}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
          <div
            className={`w-9 h-9 rounded-full ${accent} flex items-center justify-center text-white text-sm font-bold`}
          >
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-card border-r border-border shrink-0">
        {panel}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${accent} flex items-center justify-center`}>
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">{title}</span>
          </div>
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div
            className="md:hidden fixed inset-0 top-14 z-30 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          >
            <aside
              className="w-72 h-full bg-card flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {panel}
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
