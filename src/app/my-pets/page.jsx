'use client';

import { Plus, Calendar, MoreHorizontal, Syringe } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import AddPetModal from '@/components/AddPetModal';
import BookVetModal from '@/components/BookVetModal';

export default function MyPetsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isBookVetOpen, setIsBookVetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [pets, setPets] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user) fetchPets();
  }, [user, loading, isLoggedIn]);

  const fetchPets = async () => {
    const { data } = await supabase
      .from('pets')
      .select('*, vaccinations:pet_vaccinations(vaccine_name, next_due_date)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    setPets(data || []);
    setPageLoading(false);
  };

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
        .filter(v => v.vaccine_name)
        .map(v => ({
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

  const getSpeciesEmoji = (species) => {
    const emojis = { dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰', fish: '🐟', other: '🐾' };
    return emojis[species] || '🐾';
  };

  const getVaccineStatus = (pet) => {
    if (!pet.vaccinations || pet.vaccinations.length === 0) {
      return { name: null, status: 'No vaccines scheduled', urgent: false };
    }
    const upcoming = pet.vaccinations
      .filter(v => v.next_due_date)
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
  };

  if (loading || pageLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Pets</h1>
              <p className="text-sm text-gray-600 mt-0.5">Manage health & records</p>
            </div>
            <button onClick={() => setIsAddPetOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm">
              <Plus size={18} /><span>Add Pet</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3 sm:space-y-4">
          {pets.map((pet) => {
            const vaccine = getVaccineStatus(pet);
            return (
              <div key={pet.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <Link href={`/my-pets/${pet.id}`} className="flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-50 rounded-xl flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">{getSpeciesEmoji(pet.species)}</span>
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link href={`/my-pets/${pet.id}`} className="hover:underline">
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg">{pet.name}</h3>
                      </Link>
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                        <MoreHorizontal size={18} className="text-gray-400" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2.5">
                      {pet.breed || pet.species} · {pet.age_years ? `${pet.age_years}y` : ''}{pet.age_months ? ` ${pet.age_months}m` : ''} · {pet.gender || 'Unknown'}
                    </p>
                    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${
                      vaccine.urgent ? 'bg-orange-50 text-orange-700' : vaccine.name ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Syringe size={12} />
                      <span>{vaccine.name ? `${vaccine.name} — ${vaccine.status}` : vaccine.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/my-pets/${pet.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 font-medium text-xs sm:text-sm hover:bg-gray-50 transition-colors">
                        <Calendar size={14} /> Records
                      </Link>
                      <button onClick={() => handleBookVet(pet)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm transition-colors">
                        Book Vet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {pets.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No pets yet</h3>
            <p className="text-gray-600 mb-6">Add your first pet to get started!</p>
            <button onClick={() => setIsAddPetOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2">
              <Plus size={20} /> Add Pet
            </button>
          </div>
        )}
      </div>

      <AddPetModal isOpen={isAddPetOpen} onClose={() => setIsAddPetOpen(false)} onAdd={handleAddPet} />
      <BookVetModal
        isOpen={isBookVetOpen}
        onClose={() => { setIsBookVetOpen(false); setSelectedPet(null); }}
        petName={selectedPet?.name || ''}
        petEmoji={selectedPet ? getSpeciesEmoji(selectedPet.species) : ''}
      />
    </div>
  );
}
