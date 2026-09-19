'use client';

import { Heart, ShoppingBag, Stethoscope, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { gridCols } from '@/lib/gridCols';

const ACTIONS = [
  {
    icon: Stethoscope,
    title: 'Find Vets',
    description: 'Discover trusted veterinarians and clinics near you',
    path: '/discover',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: ShoppingBag,
    title: 'Pet Shop',
    description: 'Quality pet products from verified sellers',
    path: '/shop',
    color: 'bg-vitality/10 text-vitality',
    flag: 'marketplaceEnabled',
  },
  {
    icon: Heart,
    title: 'Shelters',
    description: 'Adopt, donate, and support animal welfare',
    path: '/shelters',
    color: 'bg-emergency/10 text-emergency',
    flag: 'sheltersEnabled',
  },
  {
    icon: TriangleAlert,
    title: 'Lost & Found',
    description: 'Report lost pets or help reunite found animals',
    path: '/lost-found',
    color: 'bg-amber/10 text-amber',
  },
];

export default function Features() {
  const flags = useFeatureFlags();
  const actions = ACTIONS.filter((a) => !a.flag || flags?.[a.flag]);

  return (
    <section className="px-4 md:px-8 pb-12 max-w-5xl mx-auto">
      <div className={`grid grid-cols-2 ${gridCols(actions.length)} gap-3 md:gap-4`}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.path}
              className="group flex flex-col items-center text-center p-5 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 btn-press h-full"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${action.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">{action.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
