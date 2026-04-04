'use client';

import { Search, MapPin } from 'lucide-react';

export default function Hero() {
  return (
    <div className="text-center mb-8 sm:mb-12 px-4">
      <p className="text-blue-600 text-xs sm:text-sm font-semibold mb-2 sm:mb-3 uppercase tracking-wide">
        Pakistan's Trusted Pet Ecosystem
      </p>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 px-4">
        Better care for your best friend.
      </h1>
      <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
        Discover veterinarians, shop for pet products, adopt from shelters, 
        and manage your pet's health — all in one place.
      </p>

      {/* Find a Vet Button */}
      <div className="flex items-center justify-center gap-4 mb-4 sm:mb-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm sm:text-base">
          <Search size={18} />
          Find a Vet
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-full border border-gray-200 px-4 sm:px-6 py-3 sm:py-3.5 shadow-sm hover:shadow-md transition-shadow">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search vets, clinics, products..."
            className="flex-1 outline-none text-gray-700 text-xs sm:text-sm"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 transition-colors flex-shrink-0">
            <MapPin size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Near me</span>
            <span className="sm:hidden">Near</span>
          </button>
        </div>
      </div>
    </div>
  );
}
