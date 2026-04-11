'use client';

import { Stethoscope, ShoppingBag, Heart, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Features() {
  const features = [
    { icon: Stethoscope, title: 'Find Vets', description: 'Discover trusted veterinarians and clinics near you', color: 'blue', href: '/vets' },
    { icon: ShoppingBag, title: 'Pet Shop', description: 'Quality pet products from verified sellers', color: 'green', href: '/marketplace' },
    { icon: Heart, title: 'Shelters', description: 'Adopt, donate, and support animal welfare', color: 'red', href: '/shelters' },
    { icon: AlertTriangle, title: 'Lost & Found', description: 'Report lost pets or help reunite found animals', color: 'yellow', href: '/lost-found' },
  ];

  const bgColors = { blue: 'bg-blue-50', green: 'bg-green-50', red: 'bg-red-50', yellow: 'bg-yellow-50' };
  const iconColors = { blue: 'text-blue-600', green: 'text-green-600', red: 'text-red-600', yellow: 'text-yellow-600' };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8 px-4">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <Link
            key={feature.title}
            href={feature.href}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:shadow-lg transition-all cursor-pointer border border-gray-100 group"
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 ${bgColors[feature.color]} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className={iconColors[feature.color]} size={22} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">{feature.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed hidden sm:block">{feature.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
