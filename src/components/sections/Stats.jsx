'use client';

import { Heart, PawPrint, Shield, ShoppingBag, Stethoscope, TriangleAlert } from 'lucide-react';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { gridCols } from '@/lib/gridCols';

export default function Stats() {
  const { marketplaceEnabled, sheltersEnabled } = useFeatureFlags();

  const stats = [
    {
      value: '500+',
      label: 'Verified Vets',
      icon: Stethoscope,
      gradient: 'from-primary/15 to-primary/5',
      iconColor: 'text-primary',
      borderColor: 'border-primary/20',
    },
    {
      value: '120+',
      label: 'Clinics',
      icon: Shield,
      gradient: 'from-vitality/15 to-vitality/5',
      iconColor: 'text-vitality',
      borderColor: 'border-vitality/20',
    },
    {
      value: '8,000+',
      label: 'Pets Registered',
      icon: PawPrint,
      gradient: 'from-primary/15 to-primary/5',
      iconColor: 'text-primary',
      borderColor: 'border-primary/20',
    },
    {
      value: '300+',
      label: 'Pets Reunited',
      icon: TriangleAlert,
      gradient: 'from-amber/15 to-amber/5',
      iconColor: 'text-amber',
      borderColor: 'border-amber/20',
    },
    ...(marketplaceEnabled
      ? [
          {
            value: '2,000+',
            label: 'Products',
            icon: ShoppingBag,
            gradient: 'from-amber/15 to-amber/5',
            iconColor: 'text-amber',
            borderColor: 'border-amber/20',
          },
        ]
      : []),
    ...(sheltersEnabled
      ? [
          {
            value: '50+',
            label: 'Shelters',
            icon: Heart,
            gradient: 'from-emergency/15 to-emergency/5',
            iconColor: 'text-emergency',
            borderColor: 'border-emergency/20',
          },
        ]
      : []),
  ];

  return (
    <section className="px-4 md:px-8 pb-12 max-w-5xl mx-auto">
      <div className={`grid grid-cols-2 ${gridCols(stats.length)} gap-3`}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br ${stat.gradient} border ${stat.borderColor}`}
            >
              <Icon className={`h-8 w-8 ${stat.iconColor} opacity-20 absolute top-3 right-3`} />
              <p className="text-2xl md:text-3xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
