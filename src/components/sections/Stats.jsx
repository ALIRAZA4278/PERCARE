'use client';

import { Stethoscope, Building2, Package, Home } from 'lucide-react';

export default function Stats() {
  const stats = [
    { number: '500+', label: 'Verified Vets', color: 'blue', icon: Stethoscope },
    { number: '120+', label: 'Clinics', color: 'green', icon: Building2 },
    { number: '2,000+', label: 'Products', color: 'yellow', icon: Package },
    { number: '50+', label: 'Shelters', color: 'red', icon: Home },
  ];

  const bgColors = { blue: 'bg-blue-50', green: 'bg-green-50', red: 'bg-red-50', yellow: 'bg-yellow-50' };
  const iconColors = { blue: 'text-blue-200', green: 'text-green-200', red: 'text-red-200', yellow: 'text-yellow-200' };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8 px-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${bgColors[stat.color]} rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden`}
          >
            <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 ${iconColors[stat.color]} opacity-40`}>
              <Icon size={36} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 relative z-10">{stat.number}</h3>
            <p className="text-xs sm:text-sm text-gray-600 relative z-10">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
