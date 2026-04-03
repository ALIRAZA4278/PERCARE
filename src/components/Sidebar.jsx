'use client';

import { Home, Search, ShoppingBag, Heart, AlertTriangle, User, Bell, Waves } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const mainNav = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Discover Vets', icon: Search, href: '/vets' },
    { name: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
    { name: 'Shelters', icon: Heart, href: '/shelters' },
    { name: 'Lost & Found', icon: AlertTriangle, href: '/lost-found' },
  ];

  const accountNav = [
    { name: 'My Pets', icon: Waves, href: '/my-pets' },
    { name: 'Notifications', icon: Bell, href: '/notifications' },
    { name: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-48 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">🐾</span>
        </div>
        <span className="font-semibold text-lg">PetCare</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Main
          </p>
          <div className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Account
          </p>
          <div className="space-y-1">
            {accountNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Emergency Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-blue-600" />
            <span className="font-semibold text-sm">Emergency?</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Find emergency vets near you instantly.
          </p>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
            Find Emergency Vet
          </button>
        </div>
      </div>
    </aside>
  );
}
