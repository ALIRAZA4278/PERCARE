'use client';

import { ArrowLeft, Lock, Eye, Smartphone, Shield, Key, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PrivacySecurityPage() {
  const items = [
    { icon: Lock, label: 'Change Password', description: 'Update your account password' },
    { icon: Eye, label: 'Login Activity', description: 'Review recent sign-ins' },
    { icon: Smartphone, label: 'Two-Factor Authentication', description: 'Add extra account security' },
    { icon: Shield, label: 'Privacy Settings', description: 'Control data sharing preferences' },
    { icon: Key, label: 'Active Sessions', description: 'Manage devices and sessions' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/profile" className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft size={18} className="text-foreground" />
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-foreground">Privacy & Security</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-2 sm:space-y-3">
          {items.map(({ icon: Icon, label, description }) => (
            <button key={label} className="w-full flex items-center justify-between bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border hover:shadow-card-hover transition-all group text-left">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                  <Icon size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">{label}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground group-hover:text-muted-foreground transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
