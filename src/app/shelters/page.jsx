'use client';

import { Heart, MapPin, Clock, ChevronRight, AlertTriangle, PawPrint } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import RescueRequestModal from '@/components/RescueRequestModal';

export default function SheltersPage() {
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);

  const shelters = [
    { id: 1, name: 'Happy Tails Shelter', location: 'Lahore', hours: '9 AM – 6 PM', animals: 24, donationGoal: 85, image: '🐕' },
    { id: 2, name: 'Safe Paws Foundation', location: 'Islamabad', hours: '8 AM – 5 PM', animals: 42, donationGoal: 62, image: '🐾' },
    { id: 3, name: 'Second Chance Animal Rescue', location: 'Karachi', hours: '10 AM – 7 PM', animals: 67, donationGoal: 40, image: '🐱' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Animal Shelters</h1>
              <p className="text-sm text-gray-600 mt-0.5">Adopt, donate, and support animal welfare</p>
            </div>
            <button onClick={() => setIsRescueModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm">
              <AlertTriangle size={16} />
              <span className="hidden sm:inline">Rescue Request</span>
              <span className="sm:hidden">Rescue</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {shelters.map((shelter) => (
            <Link key={shelter.id} href={`/shelters/${shelter.id}`} className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-40 sm:h-48 bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <span className="text-6xl sm:text-7xl opacity-80 group-hover:scale-110 transition-transform">{shelter.image}</span>
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">{shelter.name}</h3>
                  <div className="flex items-center gap-1 text-red-400 flex-shrink-0">
                    <Heart size={14} className="fill-red-400" />
                    <span className="text-xs font-semibold">{shelter.animals}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1"><MapPin size={13} className="text-gray-400" /><span>{shelter.location}</span></div>
                  <div className="flex items-center gap-1"><Clock size={13} className="text-gray-400" /><span>{shelter.hours}</span></div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-600">Donation goal</span>
                    <span className="text-xs font-bold text-blue-600">{shelter.donationGoal}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${shelter.donationGoal}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm">
                    <PawPrint size={15} /><span>View Shelter</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <RescueRequestModal isOpen={isRescueModalOpen} onClose={() => setIsRescueModalOpen(false)} />
    </div>
  );
}
