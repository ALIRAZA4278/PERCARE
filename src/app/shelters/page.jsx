'use client';

import { Heart, MapPin, Clock, ChevronRight, AlertTriangle, PawPrint } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import RescueRequestModal from '@/components/RescueRequestModal';

export default function SheltersPage() {
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    const { data } = await supabase
      .from('shelters')
      .select('*, animals:shelter_animals(id)')
      .order('created_at', { ascending: false });
    setShelters(data || []);
    setLoading(false);
  };

  const getEmoji = (index) => ['🐕', '🐾', '🐱', '🐰', '🦜'][index % 5];

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

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
          {shelters.map((shelter, index) => (
            <Link key={shelter.id} href={`/shelters/${shelter.id}`} className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-40 sm:h-48 bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                {shelter.image_url ? (
                  <img src={shelter.image_url} alt={shelter.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl sm:text-7xl opacity-80 group-hover:scale-110 transition-transform">{getEmoji(index)}</span>
                )}
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">{shelter.name}</h3>
                  <div className="flex items-center gap-1 text-red-400 flex-shrink-0">
                    <Heart size={14} className="fill-red-400" />
                    <span className="text-xs font-semibold">{shelter.animals?.length || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1"><MapPin size={13} className="text-gray-400" /><span>{shelter.city}</span></div>
                  {shelter.opening_time && (
                    <div className="flex items-center gap-1"><Clock size={13} className="text-gray-400" /><span>{shelter.opening_time} – {shelter.closing_time}</span></div>
                  )}
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

        {shelters.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No shelters found</h3>
            <p className="text-gray-600">Shelters will appear here once registered.</p>
          </div>
        )}
      </div>

      <RescueRequestModal isOpen={isRescueModalOpen} onClose={() => setIsRescueModalOpen(false)} />
    </div>
  );
}
