'use client';

import { Plus, Calendar, MoreHorizontal, Syringe } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import AddPetModal from '@/components/AddPetModal';
import BookVetModal from '@/components/BookVetModal';

export default function MyPetsPage() {
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isBookVetOpen, setIsBookVetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const pets = [
    {
      id: 1,
      name: 'Buddy',
      breed: 'Golden Retriever',
      age: '3 years',
      gender: 'Male',
      emoji: '🐕',
      vaccine: { name: 'Rabies', status: 'Due in 5 days', urgent: true },
    },
    {
      id: 2,
      name: 'Whiskers',
      breed: 'Persian',
      age: '2 years',
      gender: 'Female',
      emoji: '🐱',
      vaccine: { name: 'FVRCP', status: 'Completed', urgent: false },
    },
    {
      id: 3,
      name: 'Coco',
      breed: 'Cockatiel',
      age: '1 year',
      gender: 'Male',
      emoji: '🦜',
      vaccine: { name: null, status: 'No vaccines scheduled', urgent: false },
    },
  ];

  const handleBookVet = (pet) => {
    setSelectedPet(pet);
    setIsBookVetOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Pets</h1>
              <p className="text-sm text-gray-600 mt-0.5">Manage health & records</p>
            </div>
            <button
              onClick={() => setIsAddPetOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm"
            >
              <Plus size={18} />
              <span>Add Pet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pet List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3 sm:space-y-4">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                {/* Pet Avatar */}
                <Link href={`/my-pets/${pet.id}`} className="flex-shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-50 rounded-xl flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl">{pet.emoji}</span>
                  </div>
                </Link>

                {/* Pet Info */}
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
                    {pet.breed} · {pet.age} · {pet.gender}
                  </p>

                  {/* Vaccine Status */}
                  <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${
                    pet.vaccine.urgent
                      ? 'bg-orange-50 text-orange-700'
                      : pet.vaccine.name
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Syringe size={12} />
                    <span>{pet.vaccine.name ? `${pet.vaccine.name} — ${pet.vaccine.status}` : pet.vaccine.status}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/my-pets/${pet.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 font-medium text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                    >
                      <Calendar size={14} />
                      Records
                    </Link>
                    <button
                      onClick={() => handleBookVet(pet)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm transition-colors"
                    >
                      Book Vet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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

      <AddPetModal isOpen={isAddPetOpen} onClose={() => setIsAddPetOpen(false)} />
      <BookVetModal
        isOpen={isBookVetOpen}
        onClose={() => { setIsBookVetOpen(false); setSelectedPet(null); }}
        petName={selectedPet?.name || ''}
        petEmoji={selectedPet?.emoji || ''}
      />
    </div>
  );
}
