'use client';

import { Headset, PackageCheck, Truck } from 'lucide-react';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

const BADGES = [
  { icon: Truck, label: 'Free Delivery' },
  { icon: PackageCheck, label: 'Tamper-Proof' },
  { icon: Headset, label: 'On-Spot Help' },
];

export default function Delivery() {
  const { marketplaceEnabled } = useFeatureFlags();
  if (!marketplaceEnabled) return null;

  return (
    <section className="px-4 md:px-8 pb-12 max-w-5xl mx-auto">
      <div className="rounded-2xl bg-primary/5 border border-primary/15 p-5 md:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Truck className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground text-sm">Free &amp; Fast Delivery</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We deliver pet products right to your doorstep — quickly and free of charge. Our company
          takes full responsibility for every order. If anything arrives tampered with, broken,
          misplaced, or missing, our delivery rider will assist you on the spot and resolve the
          issue immediately.
        </p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-medium text-foreground text-center">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
