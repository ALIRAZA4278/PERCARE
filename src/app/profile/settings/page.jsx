'use client';

import { ArrowLeft, Bell, Moon, Globe, HelpCircle, Info, LogOut, ChevronRight, X, ExternalLink, Mail, Phone, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const toggleItems = [
    { icon: Bell, label: 'Push Notifications', description: 'Reminders, updates & alerts', value: pushNotifications, onChange: () => setPushNotifications(!pushNotifications) },
    { icon: Moon, label: 'Dark Mode', description: 'Switch appearance', value: darkMode, onChange: () => setDarkMode(!darkMode) },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft size={18} className="text-gray-700" />
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-2 sm:space-y-3">
          {/* Toggle Items */}
          {toggleItems.map(({ icon: Icon, label, description, value, onChange }) => (
            <div key={label} className="flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                  <Icon size={20} className="text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">{label}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{description}</p>
                </div>
              </div>
              <button onClick={onChange}
                className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform"
                  style={{ transform: value ? 'translateX(20px)' : 'translateX(2px)' }}
                />
              </button>
            </div>
          ))}

          {/* Language */}
          <button className="w-full flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-all group text-left">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                <Globe size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Language</h3>
                <p className="text-xs sm:text-sm text-gray-600">English (US)</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
          </button>

          {/* Help & Support */}
          <button onClick={() => setShowHelp(true)} className="w-full flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-all group text-left">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                <HelpCircle size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Help & Support</h3>
                <p className="text-xs sm:text-sm text-gray-600">FAQs and contact</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
          </button>

          {/* About PetCare */}
          <button onClick={() => setShowAbout(true)} className="w-full flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-all group text-left">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                <Info size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">About PetCare</h3>
                <p className="text-xs sm:text-sm text-gray-600">Version 1.0.0</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
          </button>

          {/* Log Out */}
          <button onClick={() => { logout(); router.push('/'); }} className="w-full flex items-center bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-all group text-left gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-100">
              <LogOut size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-600 text-sm sm:text-base">Log Out</h3>
              <p className="text-xs sm:text-sm text-gray-600">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>

      {/* Help & Support Modal */}
      {showHelp && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowHelp(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Help & Support</h2>
                <button onClick={() => setShowHelp(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
              <div className="p-5 space-y-2">
                <Link href="/profile/settings/faq" onClick={() => setShowHelp(false)}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HelpCircle size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">FAQs</p>
                      <p className="text-xs text-gray-600">Find answers to common questions</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>

                {[
                  { icon: Mail, label: 'Email Support', sub: 'support@petcare.pk', color: 'bg-blue-50 text-blue-600' },
                  { icon: Phone, label: 'Call Us', sub: '+92 300 1234567', color: 'bg-green-50 text-green-600' },
                  { icon: MessageSquare, label: 'WhatsApp', sub: 'Chat with us on WhatsApp', color: 'bg-emerald-50 text-emerald-600' },
                ].map(({ icon: Icon, label, sub, color }) => (
                  <button key={label} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${color.split(' ')[0]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} className={color.split(' ')[1]} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{label}</p>
                        <p className="text-xs text-gray-600">{sub}</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* About PetCare Modal */}
      {showAbout && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAbout(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">About PetCare</h2>
                <button onClick={() => setShowAbout(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
              <div className="p-6 text-center">
                {/* Logo */}
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🐾</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">PetCare Ecosystem</h3>
                <p className="text-sm text-gray-500 mb-4">Version 1.0.0 (Build 2026.03)</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  Pakistan's trusted pet ecosystem. Discover vets, shop for products, adopt from shelters, and manage your pet's health — all in one place.
                </p>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="space-y-2.5">
                    {[
                      { label: 'Platform', value: 'Web & Mobile' },
                      { label: 'Developer', value: 'PetCare Team' },
                      { label: 'Contact', value: 'hello@petcare.pk' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-semibold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                  <button className="hover:text-blue-600 transition-colors font-medium">Terms</button>
                  <span>·</span>
                  <button className="hover:text-blue-600 transition-colors font-medium">Privacy Policy</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
