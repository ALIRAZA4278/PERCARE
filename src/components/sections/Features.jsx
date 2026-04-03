'use client';

import { Stethoscope, ShoppingBag, Heart, AlertTriangle } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Stethoscope,
      title: 'Find Vets',
      description: 'Discover trusted veterinarians and clinics near you',
      color: 'blue',
    },
    {
      icon: ShoppingBag,
      title: 'Pet Shop',
      description: 'Quality pet products from verified sellers',
      color: 'green',
    },
    {
      icon: Heart,
      title: 'Shelters',
      description: 'Adopt, donate, and support animal welfare',
      color: 'red',
    },
    {
      icon: AlertTriangle,
      title: 'Lost & Found',
      description: 'Report lost pets or help reunite found animals',
      color: 'yellow',
    },
  ];

  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className="grid grid-cols-4 gap-5 mb-8">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.title}
            className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all cursor-pointer border border-gray-100 group"
          >
            <div className={`w-14 h-14 ${bgColors[feature.color]} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className={iconColors[feature.color]} size={26} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-base">{feature.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
}
