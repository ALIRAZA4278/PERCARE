'use client';

import { Search, MapPin, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function VetsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vets, setVets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [vetsRes, clinicsRes] = await Promise.all([
      supabase.from('vet_profiles').select('*, user:profiles(full_name, avatar_url, city)'),
      supabase.from('clinics').select('*'),
    ]);
    setVets(vetsRes.data || []);
    setClinics(clinicsRes.data || []);
    setLoading(false);
  };

  const allItems = [
    ...vets.map(v => ({
      id: v.id, type: 'vet',
      name: v.user?.full_name || 'Veterinarian',
      specialization: v.specialization || 'General Veterinarian',
      location: v.user?.city || 'Unknown',
      rating: v.rating || 0, reviews: v.total_reviews || 0,
      available: v.is_available, emergency: false,
      href: `/vets/${v.id}`,
    })),
    ...clinics.map(c => ({
      id: c.id, type: c.is_emergency_available ? 'hospital' : 'clinic',
      name: c.name,
      specialization: c.is_emergency_available ? 'Emergency & General Care' : 'Veterinary Clinic',
      location: c.city || 'Unknown',
      rating: c.rating || 0, reviews: c.total_reviews || 0,
      available: true, emergency: c.is_emergency_available,
      href: `/clinic/${c.id}`,
    })),
  ];

  const filtered = allItems.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter ||
      (activeFilter === 'emergency' && item.emergency);
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Find Vets & Clinics</h1>
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name or specialization..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'vet', 'clinic', 'hospital', 'emergency'].map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors capitalize whitespace-nowrap ${activeFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((item) => (
            <Link key={`${item.type}-${item.id}`} href={item.href}
              className="bg-white rounded-xl sm:rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.type === 'vet' ? 'bg-blue-50' : item.type === 'hospital' ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <span className="text-2xl">{item.type === 'vet' ? '👨‍⚕️' : item.type === 'hospital' ? '🏥' : '🏨'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.specialization}</p>
                </div>
                {item.emergency && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">24/7</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" />{item.location}</div>
                <div className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" />{item.rating} ({item.reviews})</div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-xs font-medium text-gray-600">{item.available ? 'Available' : 'Unavailable'}</span>
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
      </div>
    </div>
  );
}
