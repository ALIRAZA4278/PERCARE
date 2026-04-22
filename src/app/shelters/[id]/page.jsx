'use client';

import { ArrowLeft, Heart, MapPin, Phone, Mail, Globe, Clock, PawPrint, Users, DollarSign, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdoptModal from '@/components/AdoptModal';

export default function ShelterDetailPage() {
  const { id } = useParams();
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [liked, setLiked] = useState(false);
  const [shelter, setShelter] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const emojiMap = { dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰', fish: '🐠', other: '🐾' };

  useEffect(() => {
    if (id) fetchShelter();
  }, [id]);

  const fetchShelter = async () => {
    const [shelterRes, animalsRes, packagesRes] = await Promise.all([
      supabase.from('shelters').select('*').eq('id', id).single(),
      supabase.from('shelter_animals').select('*').eq('shelter_id', id).eq('adoption_status', 'available').order('created_at', { ascending: false }),
      supabase.from('donation_packages').select('*').eq('shelter_id', id).eq('is_active', true).order('amount'),
    ]);

    setShelter(shelterRes.data);
    setAnimals(animalsRes.data || []);
    setPackages(packagesRes.data || []);
    setLoading(false);
  };

  const formatHours = (s) => {
    if (!s) return null;
    const days = s.working_days?.join(', ');
    const open = s.opening_time ? s.opening_time.slice(0, 5) : null;
    const close = s.closing_time ? s.closing_time.slice(0, 5) : null;
    if (!days && !open) return null;
    const timeStr = open && close ? `${open} – ${close}` : '';
    return [days, timeStr].filter(Boolean).join(': ');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!shelter) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-gray-700 mb-4">Shelter not found</p>
        <Link href="/shelters" className="text-blue-600 hover:underline">Back to Shelters</Link>
      </div>
    );
  }

  const hours = formatHours(shelter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Link href="/shelters" className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"><ArrowLeft size={18} className="text-gray-700" /></Link>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{shelter.name}</h1>
            </div>
            <button onClick={() => setLiked(!liked)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
              <Heart size={20} className={liked ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {['🐕', '🐱', '🦜'].map((emoji, i) => (
            <div key={i} className={`${i === 0 ? 'col-span-2 h-40 sm:h-56' : 'h-40 sm:h-56'} bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center border border-gray-200 overflow-hidden`}>
              {shelter.image_url && i === 0 ? (
                <img src={shelter.image_url} alt={shelter.name} className="w-full h-full object-cover" />
              ) : (
                <span className={`${i === 0 ? 'text-6xl sm:text-8xl' : 'text-4xl sm:text-6xl'} opacity-80`}>{emoji}</span>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{shelter.name}</h2>
            <div className="flex items-center gap-1 text-red-400 shrink-0 bg-red-50 px-2.5 py-1 rounded-full">
              <Heart size={13} className="fill-red-400" /><span className="text-xs font-bold">{animals.length} animals</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
            <MapPin size={14} className="text-gray-400 shrink-0" /><span>{shelter.address}, {shelter.city}</span>
          </div>
          {shelter.description && <p className="text-sm text-gray-700 leading-relaxed mb-5">{shelter.description}</p>}

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
            {[
              { icon: PawPrint, value: animals.length, label: 'Animals' },
              { icon: Users, value: shelter.is_verified ? 'Verified' : 'Unverified', label: 'Status' },
              { icon: DollarSign, value: shelter.accepts_donations ? 'Yes' : 'No', label: 'Donations' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                  <div className="flex justify-center mb-1.5"><Icon size={18} className="text-blue-600" /></div>
                  <p className="text-sm sm:text-base font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {(shelter.phone || shelter.email || shelter.website || hours) && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact & Hours</h3>
            <div className="space-y-3.5">
              {shelter.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"><Phone size={16} className="text-blue-600" /></div>
                  <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Phone</p><p className="text-sm font-semibold text-gray-900">{shelter.phone}</p></div>
                </div>
              )}
              {shelter.email && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"><Mail size={16} className="text-blue-600" /></div>
                  <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email</p><p className="text-sm font-semibold text-gray-900">{shelter.email}</p></div>
                </div>
              )}
              {shelter.website && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"><Globe size={16} className="text-blue-600" /></div>
                  <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Website</p><p className="text-sm font-semibold text-blue-600">{shelter.website}</p></div>
                </div>
              )}
              {hours && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5"><Clock size={16} className="text-blue-600" /></div>
                  <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Opening Hours</p><p className="text-sm font-semibold text-gray-900">{hours}</p></div>
                </div>
              )}
            </div>
          </div>
        )}

        {animals.length > 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Animals Available for Adoption</h3>
            <div className="space-y-3 sm:space-y-4">
              {animals.map((animal) => (
                <div key={animal.id} className="rounded-xl p-4 border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        {animal.image_url ? (
                          <img src={animal.image_url} alt={animal.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span className="text-xl">{emojiMap[animal.species] || '🐾'}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">{animal.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 capitalize">
                          {animal.breed || animal.species}
                          {animal.age_years ? ` · ${animal.age_years}y` : ''}
                          {animal.age_months ? ` ${animal.age_months}m` : ''}
                          {animal.gender ? ` · ${animal.gender}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setSelectedAnimal(animal); setIsAdoptModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs sm:text-sm transition-colors">Adopt</button>
                    </div>
                  </div>
                  {animal.description && <p className="text-xs text-gray-600 leading-relaxed">{animal.description}</p>}
                  {animal.health_status && (
                    <span className="inline-block mt-1.5 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">{animal.health_status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {packages.length > 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Donation Packages</h3>
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">{pkg.name}</h4>
                    {pkg.description && <p className="text-xs sm:text-sm text-gray-600">{pkg.description}</p>}
                    {pkg.is_recurring && <span className="text-xs text-blue-600 font-medium">Monthly</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-blue-100">
                      PKR {Number(pkg.amount).toLocaleString()}
                    </span>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AdoptModal isOpen={isAdoptModalOpen} onClose={() => { setIsAdoptModalOpen(false); setSelectedAnimal(null); }} animal={selectedAnimal} shelterName={shelter.name} />
    </div>
  );
}
