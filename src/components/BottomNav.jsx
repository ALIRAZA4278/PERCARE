'use client';

import { Home, Search, ShoppingBag, TriangleAlert, Bell, User, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const { marketplaceEnabled } = useFeatureFlags();

  // Third slot is Shop when the marketplace is on, Lost & Found otherwise.
  const thirdItem = marketplaceEnabled
    ? { label: 'Shop', icon: ShoppingBag, path: '/shop' }
    : { label: 'Lost & Found', icon: TriangleAlert, path: '/lost-found' };

  const items = isLoggedIn
    ? [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Discover', icon: Search, path: '/discover' },
        thirdItem,
        { label: 'Alerts', icon: Bell, path: '/notifications' },
        { label: 'Profile', icon: User, path: '/profile' },
      ]
    : [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Discover', icon: Search, path: '/discover' },
        thirdItem,
        { label: 'Login', icon: LogIn, path: '/login' },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-elevated md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-lg transition-expo btn-press ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
