'use client';

import { Stethoscope, Building2, Package, Home } from 'lucide-react';

export default function Stats() {
  const stats = [
    { number: '500+', label: 'Verified Vets', color: 'blue', icon: Stethoscope },
    { number: '120+', label: 'Clinics', color: 'green', icon: Building2 },
    { number: '2,000+', label: 'Products', color: 'yellow', icon: Package },
    { number: '50+', label: 'Shelters', color: 'red', icon: Home },
  ];

  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
  };

  const iconColors = {
    blue: 'text-blue-200',
    green: 'text-green-200',
    red: 'text-red-200',
    yellow: 'text-yellow-200',
  };

  return (
    <div className="grid grid-cols-4 gap-5 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${bgColors[stat.color]} rounded-2xl p-6 relative overflow-hidden border border-${stat.color}-100`}
          >
            <div className={`absolute top-4 right-4 ${iconColors[stat.color]} opacity-40`}>
              <Icon size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 relative z-10">{stat.number}</h3>
            <p className="text-sm text-gray-600 relative z-10">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
