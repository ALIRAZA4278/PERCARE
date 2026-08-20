'use client';

import Link from 'next/link';
import { Stethoscope, Mail, Phone, MapPin } from 'lucide-react';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

export default function Footer() {
  const { marketplaceEnabled, sheltersEnabled } = useFeatureFlags();

  const taglineParts = [
    'vets',
    marketplaceEnabled && 'products',
    sheltersEnabled && 'shelters',
    'pet care',
  ].filter(Boolean);

  const exploreLinks = [
    { label: 'Find Vets', href: '/vets' },
    marketplaceEnabled && { label: 'Marketplace', href: '/marketplace' },
    sheltersEnabled && { label: 'Shelters', href: '/shelters' },
    { label: 'Lost & Found', href: '/lost-found' },
  ].filter(Boolean);

  const companyLinks = [
    { label: 'Pet Tips', href: '/' },
    { label: 'Contact Us', href: 'mailto:support@petcare.pk' },
    { label: 'FAQ', href: '/profile/settings/faq' },
  ];

  const legalLinks = [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ];

  return (
    <footer className="mt-6 sm:mt-8 border-t border-gray-200 px-4">
      <div className="max-w-7xl mx-auto py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Stethoscope size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900">PetCare</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Pakistan&apos;s trusted pet ecosystem — {taglineParts.join(', ')}, all in one place.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Explore</h3>
            <ul className="space-y-2">
              {exploreLinks.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
            <a href="mailto:support@petcare.pk" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
              <Mail size={14} /> support@petcare.pk
            </a>
            <a href="tel:+924235761234" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
              <Phone size={14} /> +92 42 3576 1234
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> Lahore, Pakistan
            </span>
          </div>
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} PetCare Ecosystem. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
