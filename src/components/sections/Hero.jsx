'use client';

import { Search, MapPin } from 'lucide-react';

export default function Hero() {
  return (
    <div className="text-center mb-12">
      <p className="text-blue-600 text-sm font-semibold mb-3 uppercase tracking-wide">
        Pakistan's Trusted Pet Ecosystem
      </p>
      <h1 className="text-5xl font-bold mb-4 text-gray-900">
        Better care for your best friend.
      </h1>
      <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
        Discover veterinarians, shop for pet products, adopt from shelters, 
        and manage your pet's health — all in one place.
      </p>

      {/* Find a Vet Button */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Search size={18} />
          Find a Vet
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <div className="flex items-center gap-3 bg-white rounded-full border border-gray-200 px-6 py-3.5 shadow-sm hover:shadow-md transition-shadow">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search vets, clinics, products..."
            className="flex-1 outline-none text-gray-700 text-sm"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-full flex items-center gap-2 transition-colors">
            <MapPin size={16} />
            Near me
          </button>
        </div>
      </div>
    </div>
  );
}
