'use client';

import { ArrowLeft, Bell, Moon, Globe, HelpCircle, Info, LogOut, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function VetSettingsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const settingsItems = [
    {
      icon: Bell, label: 'Push Notifications', description: 'Reminders, updates & alerts',
      type: 'toggle', value: pushNotifications, onChange: () => setPushNotifications(!pushNotifications),
      iconBg: 'bg-primary/10', iconColor: 'text-primary',
    },
    {
      icon: Moon, label: 'Dark Mode', description: 'Switch appearance',
      type: 'toggle', value: darkMode, onChange: () => setDarkMode(!darkMode),
      iconBg: 'bg-muted', iconColor: 'text-muted-foreground',
    },
    {
      icon: Globe, label: 'Language', description: 'English (US)',
      type: 'link', iconBg: 'bg-primary/10', iconColor: 'text-primary',
    },
    {
      icon: HelpCircle, label: 'Help & Support', description: 'FAQs and contact',
      type: 'link', iconBg: 'bg-primary/10', iconColor: 'text-primary',
    },
    {
      icon: Info, label: 'About PetCare', description: 'Version 1.0.0',
      type: 'link', iconBg: 'bg-muted', iconColor: 'text-muted-foreground',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/vet" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-foreground" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="max-w-3xl">
        <div className="rounded-2xl bg-card shadow-card divide-y divide-border">
          {settingsItems.map(({ icon: Icon, label, description, type, value, onChange, iconBg, iconColor }) => (
            <div key={label} className="flex items-center justify-between p-4 sm:p-5 hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm sm:text-base">{label}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              {type === 'toggle' ? (
                <button onClick={onChange}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-card rounded-full shadow transition-transform ${value ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              ) : (
                <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Log Out */}
        <div className="rounded-2xl bg-card shadow-card mt-4">
          <button onClick={handleLogout}
            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 w-full hover:bg-emergency/10 transition-colors rounded-xl sm:rounded-2xl">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emergency/10 rounded-full flex items-center justify-center flex-shrink-0">
              <LogOut size={18} className="text-emergency" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-emergency text-sm sm:text-base">Log Out</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
