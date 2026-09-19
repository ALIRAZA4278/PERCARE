'use client';

import { MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

export default function Hero() {
  const router = useRouter();
  const { marketplaceEnabled } = useFeatureFlags();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('vets');

  const tabs = [
    { id: 'vets', label: 'Vets & Clinics' },
    ...(marketplaceEnabled ? [{ id: 'products', label: 'Products' }] : []),
  ];
  const activeScope = marketplaceEnabled ? scope : 'vets';

  const handleSubmit = (event) => {
    event.preventDefault();
    const q = query.trim();
    const base = activeScope === 'products' ? '/shop' : '/discover';
    router.push(q ? `${base}?q=${encodeURIComponent(q)}` : base);
  };

  return (
    <section className="relative px-4 pt-6 pb-10 md:px-8 md:pt-16 md:pb-20 overflow-hidden">
      <div className="max-w-4xl mx-auto md:text-center">
        <p className="text-xs font-semibold text-primary mb-2 tracking-wide uppercase">
          Pakistan&apos;s Trusted Pet Ecosystem
        </p>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-3 break-words">
          Better care for your best friend.
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground mb-6 max-w-lg md:mx-auto">
          Discover veterinarians, manage your pet&apos;s health records, and reunite lost pets with
          their families — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:justify-center">
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press transition-expo hover:opacity-90"
          >
            <Search className="h-4 w-4" />
            Find a Vet
          </Link>
        </div>
      </div>

      <div className="mt-8 max-w-xl mx-auto">
        <form onSubmit={handleSubmit} role="search" className="space-y-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search vets and clinics"
              placeholder={
                marketplaceEnabled
                  ? 'Search vets, clinics, products...'
                  : 'Search vets and clinics...'
              }
              className="w-full h-12 pl-11 pr-24 rounded-2xl bg-card shadow-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-expo"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold btn-press transition-expo hover:opacity-90 flex items-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>

          <div className="flex items-center gap-2 justify-center flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setScope(tab.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-expo btn-press ${
                  activeScope === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <Link
              href="/discover"
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-card border border-border text-muted-foreground hover:text-foreground transition-expo inline-flex items-center gap-1.5"
            >
              <MapPin className="h-3 w-3" /> Near me
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
