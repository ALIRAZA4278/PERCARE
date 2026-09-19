'use client';

import { ArrowLeft, Heart, MapPin, Phone, Mail, Globe, Clock, PawPrint, Users, DollarSign, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import FeatureDisabled from '@/components/FeatureDisabled';
import AdoptModal from '@/components/AdoptModal';

export default function ShelterDetailPage() {
  const { id } = useParams();
  const { sheltersEnabled, loading: flagsLoading } = useFeatureFlags();
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

  if (!flagsLoading && !sheltersEnabled) {
    return <FeatureDisabled title="Shelters" />;
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!shelter) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-foreground mb-4">Shelter not found</p>
        <Link href="/shelters" className="text-primary hover:underline">Back to Shelters</Link>
      </div>
    );
  }

  const hours = formatHours(shelter);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 max-w-3xl mx-auto py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Link href="/shelters" className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0"><ArrowLeft size={18} className="text-foreground" /></Link>
              <h1 className="text-base sm:text-xl font-bold text-foreground truncate">{shelter.name}</h1>
            </div>
            <button onClick={() => setLiked(!liked)} className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
              <Heart size={20} className={liked ? 'text-emergency fill-emergency' : 'text-muted-foreground'} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-3xl mx-auto py-6 sm:py-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {['🐕', '🐱', '🦜'].map((emoji, i) => (
            <div key={i} className={`${i === 0 ? 'col-span-2 h-40 sm:h-56' : 'h-40 sm:h-56'} bg-muted rounded-xl sm:rounded-2xl flex items-center justify-center border border-border overflow-hidden`}>
              {shelter.image_url && i === 0 ? (
                <img src={shelter.image_url} alt={shelter.name} className="w-full h-full object-cover" />
              ) : (
                <span className={`${i === 0 ? 'text-6xl sm:text-8xl' : 'text-4xl sm:text-6xl'} opacity-80`}>{emoji}</span>
              )}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-border mb-4 sm:mb-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{shelter.name}</h2>
            <div className="flex items-center gap-1 text-emergency shrink-0 bg-emergency/10 px-2.5 py-1 rounded-full">
              <Heart size={13} className="fill-emergency" /><span className="text-xs font-bold">{animals.length} animals</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin size={14} className="text-muted-foreground shrink-0" /><span>{shelter.address}, {shelter.city}</span>
          </div>
          {shelter.description && <p className="text-sm text-foreground leading-relaxed mb-5">{shelter.description}</p>}

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
            {[
              { icon: PawPrint, value: animals.length, label: 'Animals' },
              { icon: Users, value: shelter.is_verified ? 'Verified' : 'Unverified', label: 'Status' },
              { icon: DollarSign, value: shelter.accepts_donations ? 'Yes' : 'No', label: 'Donations' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-muted rounded-xl p-3 sm:p-4 text-center border border-border">
                  <div className="flex justify-center mb-1.5"><Icon size={18} className="text-primary" /></div>
                  <p className="text-sm sm:text-base font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {(shelter.phone || shelter.email || shelter.website || hours) && (
          <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-border mb-4 sm:mb-5">
            <h3 className="text-lg font-bold text-foreground mb-4">Contact & Hours</h3>
            <div className="space-y-3.5">
              {shelter.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Phone size={16} className="text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Phone</p><p className="text-sm font-semibold text-foreground">{shelter.phone}</p></div>
                </div>
              )}
              {shelter.email && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Mail size={16} className="text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Email</p><p className="text-sm font-semibold text-foreground">{shelter.email}</p></div>
                </div>
              )}
              {shelter.website && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Globe size={16} className="text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Website</p><p className="text-sm font-semibold text-primary">{shelter.website}</p></div>
                </div>
              )}
              {hours && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"><Clock size={16} className="text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Opening Hours</p><p className="text-sm font-semibold text-foreground">{hours}</p></div>
                </div>
              )}
            </div>
          </div>
        )}

        {animals.length > 0 && (
          <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-border mb-4 sm:mb-5">
            <h3 className="text-lg font-bold text-foreground mb-4">Animals Available for Adoption</h3>
            <div className="space-y-3 sm:space-y-4">
              {animals.map((animal) => (
                <div key={animal.id} className="rounded-xl p-4 border border-border hover:border-primary/20 hover:shadow-card-hover transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber/10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        {animal.image_url ? (
                          <img src={animal.image_url} alt={animal.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span className="text-xl">{emojiMap[animal.species] || '🐾'}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm sm:text-base">{animal.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                          {animal.breed || animal.species}
                          {animal.age_years ? ` · ${animal.age_years}y` : ''}
                          {animal.age_months ? ` ${animal.age_months}m` : ''}
                          {animal.gender ? ` · ${animal.gender}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setSelectedAnimal(animal); setIsAdoptModalOpen(true); }} className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-1.5 rounded-lg text-xs sm:text-sm transition-colors">Adopt</button>
                    </div>
                  </div>
                  {animal.description && <p className="text-xs text-muted-foreground leading-relaxed">{animal.description}</p>}
                  {animal.health_status && (
                    <span className="inline-block mt-1.5 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-vitality/10 text-vitality">{animal.health_status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {packages.length > 0 && (
          <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Donation Packages</h3>
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-border hover:border-primary/20 hover:shadow-card transition-all cursor-pointer group">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground text-sm sm:text-base">{pkg.name}</h4>
                    {pkg.description && <p className="text-xs sm:text-sm text-muted-foreground">{pkg.description}</p>}
                    {pkg.is_recurring && <span className="text-xs text-primary font-medium">Monthly</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-primary/10 text-primary font-bold text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-primary/20">
                      PKR {Number(pkg.amount).toLocaleString()}
                    </span>
                    <ChevronRight size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
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
