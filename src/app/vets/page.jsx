'use client';

import { Search, SlidersHorizontal, MapPin, Star, Clock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function DiscoverVetsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = ['All', 'Vets', 'Clinics', 'Hospitals'];

  const listings = [
    { id: 1, type: 'vet', href: '/vets/1', initial: 'K', name: 'Dr. Arsalan Khan', specialization: 'General Practice', rating: 4.9, reviews: 128, distance: '1.2 km', location: 'PetCare Central Clinic', availability: 'Today, 4:00 PM', emergency: true, action: 'Book' },
    { id: 2, type: 'vet', href: '/vets/2', initial: 'A', name: 'Dr. Fatima Ahmed', specialization: 'Surgery & Orthopedics', rating: 4.8, reviews: 95, distance: '2.5 km', location: 'Animal Wellness Center', availability: 'Today, 5:30 PM', emergency: false, action: 'Book' },
    { id: 3, type: 'clinic', href: '/clinic/3', initial: 'C', name: 'PetCare Central Clinic', specialization: 'Full-Service Clinic', rating: 4.9, reviews: 210, distance: '1.2 km', location: 'Gulberg III, Lahore', availability: 'Open Now', emergency: true, action: 'View' },
    { id: 4, type: 'hospital', href: '/hospital/4', initial: 'H', name: 'Lahore Pet Hospital', specialization: 'Multi-Specialty Hospital', rating: 4.8, reviews: 340, distance: '2.8 km', location: 'Jail Road, Lahore', availability: 'Open 24/7', emergency: true, action: 'View' },
    { id: 5, type: 'vet', href: '/vets/5', initial: 'R', name: 'Dr. Hassan Raza', specialization: 'Dermatology', rating: 4.7, reviews: 72, distance: '3.8 km', location: 'Healthy Paws Clinic', availability: 'Tomorrow, 10:00 AM', emergency: false, action: 'Book' },
    { id: 6, type: 'vet', href: '/vets/6', initial: 'M', name: 'Dr. Ayesha Malik', specialization: 'Avian Medicine', rating: 4.9, reviews: 56, distance: '4.1 km', location: 'Feathered Friends Vet', availability: 'Today, 6:00 PM', emergency: true, action: 'Book' },
  ];

  const filtered = listings.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Vets') return item.type === 'vet';
    if (activeFilter === 'Clinics') return item.type === 'clinic';
    if (activeFilter === 'Hospitals') return item.type === 'hospital';
    if (activeFilter === 'Emergency') return item.emergency;
    return true;
  }).filter(item => {
    if (!searchQuery.trim()) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specialization.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Discover Vets</h1>

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm bg-white"
            />
          </div>
          <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white flex-shrink-0">
            <SlidersHorizontal size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveFilter('Emergency')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'Emergency'
                ? 'bg-red-600 text-white'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <AlertTriangle size={14} />
            Emergency
          </button>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-2xl border border-gray-200 p-10 sm:p-16 flex flex-col items-center justify-center mb-5">
          <MapPin size={32} className="text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 font-medium">Map view coming soon</p>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-900">{filtered.length}</span> results found near you
          </p>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
            Sort by distance
          </button>
        </div>

        {/* Listing Cards */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="block bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Avatar Circle */}
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-500 font-semibold text-sm">{item.initial}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Name + Rating row */}
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">{item.name}</h3>
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">{item.rating}</span>
                      <span className="text-xs text-gray-500">({item.reviews})</span>
                    </div>
                  </div>

                  {/* Specialization */}
                  <p className="text-xs sm:text-sm text-gray-500 mb-1.5">{item.specialization}</p>

                  {/* Distance + Location */}
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mb-2.5">
                    <MapPin size={13} className="text-gray-400" />
                    <span>{item.distance}</span>
                    <span className="mx-1">·</span>
                    <span>{item.location}</span>
                  </div>

                  {/* Availability + Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-green-500" />
                        <span className="text-xs sm:text-sm font-medium text-green-600">{item.availability}</span>
                      </div>
                      {item.emergency && (
                        <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">24/7</span>
                      )}
                    </div>
                    <span className="bg-blue-600 text-white text-xs font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      {item.action}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try changing your search or filters.</p>
          </div>
        )}

        {/* Load More */}
        {filtered.length > 0 && (
          <button className="w-full mt-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
