'use client';

import { ArrowLeft, Edit, Weight, Droplets, Heart, Syringe, Calendar, FileText, Plus, Eye, Trash2, PawPrint, Stethoscope, Download } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import BookVetModal from '@/components/BookVetModal';

export default function PetDetailPage() {
  const [isBookVetOpen, setIsBookVetOpen] = useState(false);

  const pet = {
    id: 1, name: 'Buddy', breed: 'Golden Retriever', age: '3 years', gender: 'Male', emoji: '🐕',
    weight: '32 kg', color: 'Golden', microchip: 'PKR-982-001-4567',
    personality: {
      talents: ['Fetch champion', 'Knows 12 tricks', 'Therapy dog certified'],
      foods: ['Chicken', 'Peanut butter', 'Carrots'],
      likes: ['Belly rubs', 'Swimming', 'Car rides', 'Meeting new people'],
      dislikes: ['Vacuum cleaner', 'Thunder', 'Bath time'],
    },
    appointments: [
      { id: 1, title: 'Rabies Vaccination', provider: 'Dr. Arsalan Khan', date: 'Mar 25, 2026', status: 'upcoming' },
      { id: 2, title: 'Annual Checkup', provider: 'PetCare Central Clinic', date: 'Jan 10, 2026', status: 'completed' },
    ],
    vaccinations: [
      { name: 'Rabies', date: 'Due Mar 25, 2026', status: 'due' },
      { name: 'DHPP', date: 'Jan 10, 2026', status: 'done' },
      { name: 'Bordetella', date: 'Nov 5, 2025', status: 'done' },
      { name: 'Leptospirosis', date: 'Sep 15, 2025', status: 'done' },
    ],
    notes: [
      { id: 1, date: 'Jan 10, 2026', text: 'Annual checkup completed. All vitals normal. Weight stable at 32kg.' },
      { id: 2, date: 'Aug 20, 2025', text: 'Mild ear infection treated. Prescribed ear drops for 7 days.' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Link href="/my-pets" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <ArrowLeft size={18} className="text-gray-700" />
              </Link>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{pet.name}</h1>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <Edit size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Pet Profile Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 rounded-xl flex items-center justify-center relative">
              <span className="text-4xl sm:text-5xl">{pet.emoji}</span>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{pet.name}</h2>
              <p className="text-sm text-gray-600">{pet.breed}</p>
              <p className="text-xs text-gray-500">{pet.age} · {pet.gender}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Weight, value: pet.weight, label: 'Weight' },
              { icon: Droplets, value: pet.color, label: 'Color' },
              { icon: Heart, value: pet.microchip, label: 'Microchip' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                <div className="flex justify-center mb-1.5"><Icon size={18} className="text-blue-600" /></div>
                <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{value}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Personality & Fun Facts */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 mb-4">
            <PawPrint size={18} className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Personality & Fun Facts</h3>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">⭐ Talents</p>
            <div className="flex flex-wrap gap-2">
              {pet.personality.talents.map((t) => (
                <span key={t} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100">{t}</span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">🍖 Favourite Foods</p>
            <div className="flex flex-wrap gap-2">
              {pet.personality.foods.map((f) => (
                <span key={f} className="bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full border border-orange-100">{f}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">👍 Likes</p>
              <ul className="space-y-1">
                {pet.personality.likes.map((l) => (
                  <li key={l} className="text-sm text-gray-700 flex items-center gap-1.5">
                    <span className="text-blue-500 text-xs">•</span>{l}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">👎 Dislikes</p>
              <ul className="space-y-1">
                {pet.personality.dislikes.map((d) => (
                  <li key={d} className="text-sm text-gray-700 flex items-center gap-1.5">
                    <span className="text-red-500 text-xs">•</span>{d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Appointments</h3>
          </div>

          <div className="space-y-3">
            {pet.appointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{apt.title}</p>
                  <p className="text-xs text-gray-600">{apt.provider} · {apt.date}</p>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                  apt.status === 'upcoming' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                }`}>{apt.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Appointment Banner */}
        <div className="bg-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium">Next Appointment</p>
            <p className="text-white font-bold text-sm">{pet.appointments[0].date} – {pet.appointments[0].title}</p>
          </div>
        </div>

        {/* Vaccination History */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Syringe size={18} className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Vaccination History</h3>
          </div>

          <div className="space-y-3">
            {pet.vaccinations.map((vax) => (
              <div key={vax.name} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{vax.name}</p>
                  <p className="text-xs text-gray-600">{vax.date}</p>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                  vax.status === 'due' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                }`}>{vax.status === 'due' ? 'DUE SOON' : 'DONE'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Notes */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Medical Notes</h3>
            </div>
            <button className="text-blue-600 font-medium text-xs sm:text-sm flex items-center gap-1 hover:text-blue-700 transition-colors">
              <Plus size={14} /> Add Note
            </button>
          </div>

          <div className="space-y-3">
            {pet.notes.map((note) => (
              <div key={note.id} className="p-3 sm:p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-blue-600">{note.date}</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors"><Eye size={14} className="text-gray-400" /></button>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors"><Trash2 size={14} className="text-gray-400" /></button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{note.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setIsBookVetOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
          >
            <Stethoscope size={16} />
            Book Vet
          </button>
          <button className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors border border-gray-200 flex items-center justify-center gap-2 text-sm">
            <Download size={16} />
            Download Records
          </button>
        </div>
      </div>

      <BookVetModal
        isOpen={isBookVetOpen}
        onClose={() => setIsBookVetOpen(false)}
        petName={pet.name}
        petEmoji={pet.emoji}
      />
    </div>
  );
}
