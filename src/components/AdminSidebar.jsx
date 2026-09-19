'use client';

import {
  AlertTriangle,
  Building2,
  CheckSquare,
  Flag,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  PawPrint,
  ScrollText,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Stethoscope,
  Store,
  Ticket,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { allowedNav, ROLE_COLORS, ROLE_LABELS } from '@/lib/adminRoles';

const ALL_NAV = [
  { name: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { name: 'Approvals', icon: CheckSquare, href: '/admin/approvals' },
  { name: 'Users', icon: Users, href: '/admin/users' },
  { name: 'Vets', icon: Stethoscope, href: '/admin/vets' },
  { name: 'Clinics', icon: Building2, href: '/admin/clinics' },
  { name: 'Sellers', icon: ShoppingBag, href: '/admin/sellers' },
  { name: 'Stores', icon: Store, href: '/admin/stores' },
  { name: 'Shelters', icon: Home, href: '/admin/shelters' },
  { name: 'Products', icon: Package, href: '/admin/products' },
  { name: 'Pets', icon: PawPrint, href: '/admin/pets' },
  { name: 'Lost & Found', icon: AlertTriangle, href: '/admin/lost-found' },
  { name: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
  { name: 'Reports', icon: Flag, href: '/admin/reports' },
  { name: 'Reviews', icon: Star, href: '/admin/reviews' },
  { name: 'Tickets', icon: Ticket, href: '/admin/tickets' },
  { name: 'Audit Log', icon: ScrollText, href: '/admin/audit' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminSidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();

  const adminRole = profile?.admin_role || 'super_admin';
  const nav = allowedNav(adminRole, ALL_NAV);
  const roleBadgeClass = ROLE_COLORS[adminRole] || ROLE_COLORS.support;
  const roleLabel = ROLE_LABELS[adminRole] || 'Admin';

  const isActive = (href) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 h-16 flex items-center gap-2 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
          <Shield className="h-4 w-4 text-background" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-foreground">PetCare</div>
          <div className="text-[10px] text-muted-foreground -mt-0.5">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {nav.map(({ name, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive(href)
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{name}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
            {profile?.full_name?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || 'Admin'}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">{profile?.email}</div>
          </div>
        </div>

        <span
          className={`inline-flex items-center px-2 py-0.5 mx-2 mb-2 rounded-full text-[10px] font-bold border ${roleBadgeClass}`}
        >
          {roleLabel}
        </span>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
