'use client';

import {
  Home,
  Search,
  ShoppingBag,
  Heart,
  TriangleAlert,
  User,
  Bell,
  PawPrint,
  LogIn,
  UserPlus,
  Stethoscope,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

const itemClass = (isActive) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-expo btn-press ${
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`;

export default function Sidebar() {
  const pathname = usePathname();
  const { isLoggedIn, profile } = useAuth();
  const { marketplaceEnabled, sheltersEnabled } = useFeatureFlags();

  const mainNav = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Discover Vets', icon: Search, path: '/discover' },
    marketplaceEnabled && { label: 'Marketplace', icon: ShoppingBag, path: '/shop' },
    sheltersEnabled && { label: 'Shelters', icon: Heart, path: '/shelters' },
    { label: 'Lost & Found', icon: TriangleAlert, path: '/lost-found' },
  ].filter(Boolean);

  const accountNav = [
    { label: 'My Pets', icon: PawPrint, path: '/pets' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  // Role dashboards are not in the reference sidebar, but dropping them would
  // strand the 24 dashboard pages, so they are kept and styled as normal items.
  const dashboardLink =
    (profile?.role === 'veterinarian' && { label: 'Vet Dashboard', path: '/dashboard/vet' }) ||
    (profile?.role === 'seller' && marketplaceEnabled && {
      label: 'Seller Dashboard',
      path: '/dashboard/seller',
    }) ||
    (profile?.role === 'shelter' && sheltersEnabled && {
      label: 'Shelter Dashboard',
      path: '/dashboard/shelter',
    }) ||
    null;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-card border-r border-border shrink-0">
      <div className="p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">PetCare</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Main
        </p>
        {mainNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path} className={itemClass(pathname === item.path)}>
              <Icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {isLoggedIn && (
          <div className="pt-4">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </p>
            {dashboardLink && (
              <Link
                href={dashboardLink.path}
                className={itemClass(pathname === dashboardLink.path)}
              >
                <LayoutDashboard className="h-6 w-6" />
                <span>{dashboardLink.label}</span>
              </Link>
            )}
            {accountNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className={itemClass(pathname === item.path)}>
                  <Icon className="h-6 w-6" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="p-3 m-3 space-y-2 shrink-0">
        <div className="p-4 rounded-2xl bg-muted">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Emergency?</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Find emergency vets near you instantly.
          </p>
          <Link
            href="/discover"
            className="block w-full text-center py-2 rounded-lg bg-emergency text-emergency-foreground text-xs font-semibold btn-press transition-expo hover:opacity-90"
          >
            Find Emergency Vet
          </Link>
        </div>

        {!isLoggedIn && (
          <div className="flex gap-2">
            <Link
              href="/login"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors btn-press"
            >
              <LogIn className="h-3.5 w-3.5" />
              Login
            </Link>
            <Link
              href="/signup"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-foreground text-xs font-semibold hover:bg-muted transition-colors btn-press"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
