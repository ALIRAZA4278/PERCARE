'use client';

import { ArrowRight, Clock, Heart, Shield, Stethoscope, Truck, Utensils } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

const PERKS = [
  { icon: Stethoscope, text: 'Vet-Checked & Healthy' },
  { icon: Shield, text: '100-Day Guarantee' },
  { icon: Utensils, text: 'Starter Food Included' },
  { icon: Truck, text: 'Safe Home Delivery' },
  { icon: Clock, text: '24/7 Vet Support' },
  { icon: Heart, text: 'Free Vaccination' },
];

export default function BringHomeHappiness() {
  const { petDeliveryEnabled } = useFeatureFlags();
  if (!petDeliveryEnabled) return null;

  return (
    <section className="px-4 md:px-8 pb-12 max-w-5xl mx-auto">
      <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 via-vitality/5 to-amber/5 border border-primary/10">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vitality/10 border border-vitality/20 w-fit mb-4">
              <Heart className="h-3.5 w-3.5 text-vitality fill-vitality" />
              <span className="text-[11px] font-bold text-vitality uppercase tracking-wider">
                New Feature
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3 leading-tight">
              Bring Home Happiness, <span className="text-primary">Safely.</span>
            </h2>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-md">
              Healthy, vaccinated pets delivered with care, love, and a 100-day guarantee.
              Everything your new companion needs — from food to a cozy home.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {PERKS.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div
                    key={perk.text}
                    className="flex items-center gap-2 text-xs text-foreground font-medium"
                  >
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-3 w-3 text-primary" />
                    </div>
                    {perk.text}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/get-your-pet"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press transition-expo hover:opacity-90"
              >
                Browse Pets
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/get-your-pet#how-it-works"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-card border border-border text-foreground font-semibold text-sm btn-press transition-expo hover:bg-muted"
              >
                How It Works
              </Link>
            </div>
          </div>

          <div className="relative min-h-[240px] md:min-h-full">
            <Image
              src="/pets-hero.jpg"
              alt="Adorable pets - dogs, cats, birds and fish available from PetCare"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent md:bg-gradient-to-r md:from-background/10 md:to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
