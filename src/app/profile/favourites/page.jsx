'use client';

import { ArrowLeft, Star, Heart, Stethoscope, MapPin, ShoppingBag, Store, Home, PawPrint } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function FavouritesPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Vets', 'Clinics', 'Products', 'Stores', 'Shelters', 'Animals'];

  const favourites = [
    { id: 1, type: 'Vets', icon: Stethoscope, name: 'Dr. Arsalan Khan', sub: 'General Practice', rating: 4.9 },
    { id: 2, type: 'Vets', icon: Stethoscope, name: 'Dr. Fatima Ahmed', sub: 'Surgery', rating: 4.8 },
    { id: 3, type: 'Clinics', icon: MapPin, name: 'PetCare Central', sub: 'Full service clinic', rating: 4.9 },
    { id: 4, type: 'Products', icon: ShoppingBag, name: 'Premium Dog Food', sub: 'PetNutra', rating: 4.8 },
    { id: 5, type: 'Stores', icon: Store, name: 'PetNutra Official', sub: 'Company Store', rating: 4.7 },
    { id: 6, type: 'Shelters', icon: Home, name: 'Happy Tails Shelter', sub: 'Lahore', rating: null },
    { id: 7, type: 'Animals', icon: PawPrint, name: 'Rocky', sub: 'Labrador Mix · 2 years', rating: null },
  ];

  const filtered = activeFilter === 'All' ? favourites : favourites.filter(f => f.type === activeFilter);

  const typeColors = {
    Vets: 'text-blue-600', Clinics: 'text-blue-600', Products: 'text-blue-600',
    Stores: 'text-blue-600', Shelters: 'text-blue-600', Animals: 'text-blue-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft size={18} className="text-gray-700" />
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-gray-900">Favourites</h1>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 sm:px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-2 sm:space-y-3">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{item.sub}</p>
                    <span className="text-xs font-medium text-blue-600">{item.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">{item.rating}</span>
                    </div>
                  )}
                  <Heart size={20} className="text-red-500 fill-red-500 cursor-pointer" />
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No favourites yet</h3>
            <p className="text-gray-600">Save vets, products, and more to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
