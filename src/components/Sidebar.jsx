'use client';

import { Home, Search, ShoppingBag, Heart, AlertTriangle, User, Bell, Waves, Menu, X, LogIn, UserPlus, Stethoscope, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn } = useAuth();

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
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 lg:w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 z-50 lg:z-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg text-gray-900">PetCare</span>
          </Link>
          <button
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className={isLoggedIn ? 'mb-6' : ''}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Main</p>
            <div className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Icon size={18} /><span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {isLoggedIn && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Account</p>
              <div className="space-y-1">
                {accountNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Icon size={18} /><span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Emergency */}
        <div className="px-3 pb-3">
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-blue-600" />
              <span className="font-semibold text-sm text-gray-900">Emergency?</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Find emergency vets near you instantly.</p>
            <button className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 px-4 rounded-full transition-colors">
              Find Emergency Vet
            </button>
          </div>
        </div>

        {/* Login / Sign Up - only when NOT logged in */}
        {!isLoggedIn && (
          <div className="px-3 pb-4 border-t border-gray-200 pt-3">
            <div className="flex gap-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                <LogIn size={15} />Login
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors border border-gray-200 flex items-center justify-center gap-1.5">
                <UserPlus size={15} />Sign Up
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
