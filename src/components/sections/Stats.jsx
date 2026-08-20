'use client';

import { Stethoscope, Building2, Package, Home, PawPrint, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

export default function Stats() {
  const { marketplaceEnabled, sheltersEnabled } = useFeatureFlags();
  const [counts, setCounts] = useState({ vets: 0, clinics: 0, products: 0, shelters: 0, petsRegistered: 0, petsReunited: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const [vetsRes, clinicsRes, productsRes, sheltersRes, petsRes, reunitedRes] = await Promise.all([
        supabase.from('vet_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('clinics').select('id', { count: 'exact', head: true }).eq('is_approved', true),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true).eq('is_approved', true),
        supabase.from('shelters').select('id', { count: 'exact', head: true }),
        supabase.from('pets').select('id', { count: 'exact', head: true }),
        supabase.from('lost_found_pets').select('id', { count: 'exact', head: true }).eq('status', 'reunited'),
      ]);
      setCounts({
        vets: vetsRes.count || 0,
        clinics: clinicsRes.count || 0,
        products: productsRes.count || 0,
        shelters: sheltersRes.count || 0,
        petsRegistered: petsRes.count || 0,
        petsReunited: reunitedRes.count || 0,
      });
    };
    fetchCounts();
  }, []);

  const stats = [
    { number: counts.vets > 0 ? `${counts.vets}+` : '—', label: 'Verified Vets', color: 'blue', icon: Stethoscope },
    { number: counts.clinics > 0 ? `${counts.clinics}+` : '—', label: 'Clinics', color: 'green', icon: Building2 },
    marketplaceEnabled && { number: counts.products > 0 ? `${counts.products}+` : '—', label: 'Products', color: 'yellow', icon: Package },
    sheltersEnabled && { number: counts.shelters > 0 ? `${counts.shelters}+` : '—', label: 'Shelters', color: 'red', icon: Home },
    !marketplaceEnabled && { number: counts.petsRegistered > 0 ? `${counts.petsRegistered}+` : '—', label: 'Pets Registered', color: 'yellow', icon: PawPrint },
    !sheltersEnabled && { number: counts.petsReunited > 0 ? `${counts.petsReunited}+` : '—', label: 'Pets Reunited', color: 'red', icon: AlertTriangle },
  ].filter(Boolean);

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
