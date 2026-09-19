'use client';

import { Stethoscope, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

const FOOTER_GROUPS = [
  {
    title: 'Explore',
    links: [
      { label: 'Find Vets', to: '/discover' },
      { label: 'Marketplace', to: '/shop', flag: 'marketplaceEnabled' },
      { label: 'Shelters', to: '/shelters', flag: 'sheltersEnabled' },
      { label: 'Lost & Found', to: '/lost-found' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Get Your Pet', to: '/get-your-pet', flag: 'petDeliveryEnabled' },
      { label: 'Pet Tips', to: '/pet-tips' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
    ],
  },
];

export default function Footer() {
  const flags = useFeatureFlags();

  const groups = FOOTER_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((link) => !link.flag || flags?.[link.flag]),
  }));

  return (
    <footer className="border-t border-border bg-card mt-8">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">PetCare</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pakistan&apos;s trusted pet ecosystem — vets, products, shelters and pet care, all in
              one place.
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      href={link.to}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <a
              href="mailto:support@petcare.pk"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Mail className="h-3.5 w-3.5" /> support@petcare.pk
            </a>
            <a
              href="tel:+924235761234"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Phone className="h-3.5 w-3.5" /> +92 42 3576 1234
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Lahore, Pakistan
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PetCare Ecosystem. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
