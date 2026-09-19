'use client';

import {
  Calendar,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  ShoppingBag,
  Syringe,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AddPetModal from '@/components/AddPetModal';
import BookVetModal from '@/components/BookVetModal';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { supabase } from '@/lib/supabase';

const SPECIES_EMOJI = {
  dog: '🐕',
  cat: '🐱',
  bird: '🦜',
  rabbit: '🐰',
  fish: '🐟',
  other: '🐾',
};

const emojiFor = (species) => SPECIES_EMOJI[species] || '🐾';

function vaccineStatus(pet) {
  if (!pet.vaccinations || pet.vaccinations.length === 0) {
    return { name: null, status: 'No vaccines scheduled', urgent: false };
  }
  const upcoming = pet.vaccinations
    .filter((v) => v.next_due_date)
    .sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date));

  if (upcoming.length === 0) {
    return { name: pet.vaccinations[0].vaccine_name, status: 'Completed', urgent: false };
  }

  const next = upcoming[0];
  const daysUntil = Math.ceil((new Date(next.next_due_date) - new Date()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 7) {
    return { name: next.vaccine_name, status: `Due in ${daysUntil} days`, urgent: true };
  }
  return { name: next.vaccine_name, status: `Due ${next.next_due_date}`, urgent: false };
}

const menuItemClass =
  'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors';

export default function MyPetsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const { marketplaceEnabled } = useFeatureFlags();
  const router = useRouter();

  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isBookVetOpen, setIsBookVetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [pets, setPets] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchPets = async () => {
    const { data } = await supabase
      .from('pets')
      .select('*, vaccinations:pet_vaccinations(vaccine_name, next_due_date)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    setPets(data || []);
    setPageLoading(false);
  };

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user) fetchPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, isLoggedIn]);

  const handleAddPet = async (formData) => {
    const { vaccines, image_url, ...petData } = formData;
    const { data: newPet, error } = await supabase
      .from('pets')
      .insert({
        owner_id: user.id,
        name: petData.name,
        species: petData.species,
        breed: petData.breed || null,
        age_years: petData.age_years ? parseInt(petData.age_years) : null,
        age_months: petData.age_months ? parseInt(petData.age_months) : null,
        gender: petData.gender || null,
        weight_kg: petData.weight ? parseFloat(petData.weight) : null,
        color: petData.color || null,
        medical_notes: petData.medical_notes || null,
        is_neutered: petData.is_neutered || false,
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    if (vaccines && vaccines.length > 0 && newPet) {
      const vaccineRecords = vaccines
        .filter((v) => v.vaccine_name)
        .map((v) => ({
          pet_id: newPet.id,
          vaccine_name: v.vaccine_name,
          date_given: v.date_given || new Date().toISOString().split('T')[0],
          next_due_date: v.next_due_date || null,
        }));
      if (vaccineRecords.length > 0) {
        await supabase.from('pet_vaccinations').insert(vaccineRecords);
      }
    }

    fetchPets();
  };

  const handleBookVet = (pet) => {
    setSelectedPet(pet);
    setIsBookVetOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 pt-6 pb-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">My Pets</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage health &amp; records</p>
          </div>
          <button
            onClick={() => setIsAddPetOpen(true)}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold btn-press transition-expo hover:opacity-90 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Pet
          </button>
        </div>

        {loading || pageLoading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading...</p>
        ) : pets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-lg font-bold text-foreground mb-2">No pets yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add your first pet to start tracking.
            </p>
            <button
              onClick={() => setIsAddPetOpen(true)}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold btn-press transition-expo hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add Pet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pets.map((pet) => {
              const vaccine = vaccineStatus(pet);
              const pillClass = vaccine.urgent
                ? 'bg-amber/10 text-amber'
                : vaccine.name
                  ? 'bg-vitality/10 text-vitality'
                  : 'bg-muted text-muted-foreground';

              return (
                <div
                  key={pet.id}
                  onClick={() => router.push(`/pet/${pet.id}`)}
                  className="p-4 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <span className="text-2xl">{emojiFor(pet.species)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{pet.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {pet.breed || pet.species}
                            {' · '}
                            {pet.age_years ? `${pet.age_years}y` : ''}
                            {pet.age_months ? ` ${pet.age_months}m` : ''}
                            {' · '}
                            {pet.gender || 'Unknown'}
                          </p>
                        </div>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === pet.id ? null : pet.id);
                            }}
                            aria-label={`Actions for ${pet.name}`}
                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted btn-press transition-expo"
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </button>

                          {openMenu === pet.id && (
                            <div
                              className="absolute right-0 top-9 w-44 bg-card border border-border rounded-xl shadow-elevated z-20 overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  router.push(`/pet/${pet.id}`);
                                  setOpenMenu(null);
                                }}
                                className={menuItemClass}
                              >
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> View
                                Profile
                              </button>
                              <button
                                onClick={() => {
                                  router.push(`/pet/${pet.id}`);
                                  setOpenMenu(null);
                                }}
                                className={menuItemClass}
                              >
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" /> Edit
                                Details
                              </button>
                              <button
                                onClick={() => {
                                  handleBookVet(pet);
                                  setOpenMenu(null);
                                }}
                                className={menuItemClass}
                              >
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Book Vet
                              </button>
                              {marketplaceEnabled && (
                                <button
                                  onClick={() => {
                                    router.push(`/shop?pet=${pet.id}`);
                                    setOpenMenu(null);
                                  }}
                                  className={menuItemClass}
                                >
                                  <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" /> Shop
                                  for {pet.name}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${pillClass}`}
                        >
                          <Syringe className="h-3 w-3" />
                          {vaccine.name ? `${vaccine.name} — ${vaccine.status}` : vaccine.status}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Link
                          href={`/pet/${pet.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted btn-press transition-expo flex items-center gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Records
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookVet(pet);
                          }}
                          className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold btn-press transition-expo hover:opacity-90"
                        >
                          Book Vet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddPetModal
        isOpen={isAddPetOpen}
        onClose={() => setIsAddPetOpen(false)}
        onAdd={handleAddPet}
      />
      <BookVetModal
        isOpen={isBookVetOpen}
        onClose={() => {
          setIsBookVetOpen(false);
          setSelectedPet(null);
        }}
        petName={selectedPet?.name || ''}
        petEmoji={selectedPet ? emojiFor(selectedPet.species) : ''}
      />
    </div>
  );
}
