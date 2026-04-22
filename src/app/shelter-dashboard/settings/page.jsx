'use client';

import { ArrowLeft, Bell, Moon, Globe, HelpCircle, Info, LogOut, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ShelterSettingsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const items = [
    { icon: Bell, label: 'Push Notifications', desc: 'Reminders, updates & alerts', type: 'toggle', value: pushNotifications, onChange: () => setPushNotifications(!pushNotifications), iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
    { icon: Moon, label: 'Dark Mode', desc: 'Switch appearance', type: 'toggle', value: darkMode, onChange: () => setDarkMode(!darkMode), iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
    { icon: Globe, label: 'Language', desc: 'English (US)', type: 'link', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: HelpCircle, label: 'Help & Support', desc: 'FAQs and contact', type: 'link', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { icon: Info, label: 'About PetCare', desc: 'Version 1.0.0', type: 'link', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/shelter-dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft size={18} className="text-gray-700" /></Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
      </div>
      <div className="max-w-3xl">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {items.map(({ icon: Icon, label, desc, type, value, onChange, iconBg, iconColor }) => (
            <div key={label} className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}><Icon size={18} className={iconColor} /></div>
                <div><p className="font-semibold text-gray-900 text-sm sm:text-base">{label}</p><p className="text-xs sm:text-sm text-gray-500">{desc}</p></div>
              </div>
              {type === 'toggle' ? (
                <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-teal-500' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              ) : (
                <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 mt-4">
          <button onClick={handleLogout} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 w-full hover:bg-red-50 transition-colors rounded-xl sm:rounded-2xl">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0"><LogOut size={18} className="text-red-500" /></div>
            <div className="text-left"><p className="font-semibold text-red-600 text-sm sm:text-base">Log Out</p><p className="text-xs sm:text-sm text-gray-500">Sign out of your account</p></div>
          </button>
        </div>
      </div>
    </div>
  );
}
