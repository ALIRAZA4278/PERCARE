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
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 max-w-3xl mx-auto py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/profile" className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10 shrink-0">
              <ArrowLeft size={18} className="text-foreground" />
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-foreground">Settings</h1>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-3xl mx-auto py-6 sm:py-8">
        <div className="space-y-2 sm:space-y-3">
          {/* Toggle Items */}
          {toggleItems.map(({ icon: Icon, label, description, value, onChange }) => (
            <div key={label} className="flex items-center justify-between bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                  <Icon size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">{label}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <button onClick={onChange}
                className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <div className="absolute top-0.5 w-6 h-6 bg-card rounded-full shadow-card transition-transform"
                  style={{ transform: value ? 'translateX(20px)' : 'translateX(2px)' }}
                />
              </button>
            </div>
          ))}

          {/* Language */}
          <button className="w-full flex items-center justify-between bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border hover:shadow-card-hover transition-all group text-left">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                <Globe size={20} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm sm:text-base">Language</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">English (US)</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground transition-colors flex-shrink-0 group-hover:text-primary" />
          </button>

          {/* Help & Support */}
          <button onClick={() => setShowHelp(true)} className="w-full flex items-center justify-between bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border hover:shadow-card-hover transition-all group text-left">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                <HelpCircle size={20} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm sm:text-base">Help & Support</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">FAQs and contact</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground transition-colors flex-shrink-0 group-hover:text-primary" />
          </button>

          {/* About PetCare */}
          <button onClick={() => setShowAbout(true)} className="w-full flex items-center justify-between bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border hover:shadow-card-hover transition-all group text-left">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                <Info size={20} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm sm:text-base">About PetCare</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground transition-colors flex-shrink-0 group-hover:text-primary" />
          </button>

          {/* Log Out */}
          <button onClick={() => { logout(); router.push('/'); }} className="w-full flex items-center bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border hover:shadow-card-hover transition-all group text-left gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emergency/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-emergency/20">
              <LogOut size={20} className="text-emergency" />
            </div>
            <div>
              <h3 className="font-bold text-emergency text-sm sm:text-base">Log Out</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>

      {/* Help & Support Modal */}
      {showHelp && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setShowHelp(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-md shadow-elevated">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Help & Support</h2>
                <button onClick={() => setShowHelp(false)} className="w-8 h-8 bg-muted hover:bg-muted-foreground/10 rounded-full flex items-center justify-center transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <div className="p-5 space-y-2">
                <Link href="/profile/settings/faq" onClick={() => setShowHelp(false)}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HelpCircle size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">FAQs</p>
                      <p className="text-xs text-muted-foreground">Find answers to common questions</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Link>

                {[
                  { icon: Mail, label: 'Email Support', sub: 'support@petcare.pk', color: 'bg-primary/10 text-primary' },
                  { icon: Phone, label: 'Call Us', sub: '+92 300 1234567', color: 'bg-vitality/10 text-vitality' },
                  { icon: MessageSquare, label: 'WhatsApp', sub: 'Chat with us on WhatsApp', color: 'bg-vitality/10 text-vitality' },
                ].map(({ icon: Icon, label, sub, color }) => (
                  <button key={label} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-muted transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${color.split(' ')[0]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} className={color.split(' ')[1]} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-muted-foreground" />
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
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setShowAbout(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-md shadow-elevated">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">About PetCare</h2>
                <button onClick={() => setShowAbout(false)} className="w-8 h-8 bg-muted hover:bg-muted-foreground/10 rounded-full flex items-center justify-center transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <div className="p-6 text-center">
                {/* Logo */}
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🐾</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">PetCare Ecosystem</h3>
                <p className="text-sm text-muted-foreground mb-4">Version 1.0.0 (Build 2026.03)</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Pakistan's trusted pet ecosystem. Discover vets, shop for products, adopt from shelters, and manage your pet's health — all in one place.
                </p>

                <div className="border-t border-border pt-4 mb-4">
                  <div className="space-y-2.5">
                    {[
                      { label: 'Platform', value: 'Web & Mobile' },
                      { label: 'Developer', value: 'PetCare Team' },
                      { label: 'Contact', value: 'hello@petcare.pk' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                  <button className="hover:text-primary transition-colors font-medium">Terms</button>
                  <span>·</span>
                  <button className="hover:text-primary transition-colors font-medium">Privacy Policy</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
