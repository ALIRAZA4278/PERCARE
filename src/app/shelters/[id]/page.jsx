'use client';

import { ArrowLeft, Heart, MapPin, Phone, Mail, Globe, Clock, PawPrint, Users, DollarSign, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import AdoptModal from '@/components/AdoptModal';

export default function ShelterDetailPage() {
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [liked, setLiked] = useState(false);

  const shelter = {
    id: 1, name: 'Happy Tails Shelter', location: '42-B, Gulberg III, Main Boulevard, Lahore',
    description: 'Happy Tails Shelter has been a beacon of hope for abandoned and stray animals in Lahore since 2015. We rescue, rehabilitate, and rehome dogs, cats, and birds.',
    animals: 24, founded: 'Est. 2015', goalMet: 85,
    phone: '+92 300 1234567', email: 'info@happytails.pk', website: 'www.happytails.pk',
    hours: ['Monday – Friday: 9:00 AM – 6:00 PM', 'Saturday: 10:00 AM – 4:00 PM', 'Sunday: Closed'],
  };

  const animals = [
    { id: 1, name: 'Rocky', breed: 'Labrador Mix', age: '2 years', gender: 'Male', emoji: '🐕',
      traits: [{ text: 'Fetch lover', icon: '⭐' }, { text: 'Good with kids', icon: '💚' }, { text: 'Chicken', icon: '🍖' }, { text: 'Rice', icon: '❤️' }, { text: 'Belly rubs', icon: '💚' }, { text: 'Playing', icon: '💜' }] },
    { id: 2, name: 'Luna', breed: 'Tabby', age: '1 year', gender: 'Female', emoji: '🐱',
      traits: [{ text: 'Expert climber', icon: '⭐' }, { text: 'Tuna', icon: '🍖' }, { text: 'Sunny spots', icon: '💚' }, { text: 'String toys', icon: '💜' }] },
    { id: 3, name: 'Charlie', breed: 'Pomeranian', age: '4 years', gender: 'Male', emoji: '🐶',
      traits: [{ text: 'Trick performer', icon: '⭐' }, { text: 'Treats', icon: '🍖' }, { text: 'Peanut butter', icon: '❤️' }, { text: 'Walks', icon: '💚' }, { text: 'Cuddles', icon: '💜' }] },
  ];

  const donationPackages = [
    { name: 'Feed a Pet', description: 'Covers meals for one animal for a week', price: 500 },
    { name: 'Medical Aid', description: 'Covers vaccination and basic medical care', price: 2000 },
    { name: 'Full Sponsorship', description: 'Monthly full care sponsorship for one animal', price: 5000 },
  ];

  const traitColors = { '⭐': 'bg-yellow-50 text-yellow-700', '🍖': 'bg-orange-50 text-orange-700', '💚': 'bg-green-50 text-green-700', '❤️': 'bg-red-50 text-red-700', '💜': 'bg-purple-50 text-purple-700' };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Link href="/shelters" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"><ArrowLeft size={18} className="text-gray-700" /></Link>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{shelter.name}</h1>
            </div>
            <button onClick={() => setLiked(!liked)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <Heart size={20} className={liked ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Image Gallery */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {['🐕', '🐱', '🦜'].map((emoji, i) => (
            <div key={i} className={`${i === 0 ? 'col-span-2 h-40 sm:h-56' : 'h-40 sm:h-56'} bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center border border-gray-200`}>
              <span className={`${i === 0 ? 'text-6xl sm:text-8xl' : 'text-4xl sm:text-6xl'} opacity-80`}>{emoji}</span>
            </div>
          ))}
        </div>

        {/* Shelter Info */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{shelter.name}</h2>
            <div className="flex items-center gap-1 text-red-400 flex-shrink-0 bg-red-50 px-2.5 py-1 rounded-full">
              <Heart size={13} className="fill-red-400" /><span className="text-xs font-bold">{shelter.animals} animals</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
            <MapPin size={14} className="text-gray-400 flex-shrink-0" /><span>{shelter.location}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-5">{shelter.description}</p>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
            {[{ icon: PawPrint, value: shelter.animals, label: 'Animals' }, { icon: Users, value: shelter.founded, label: 'Founded' }, { icon: DollarSign, value: `${shelter.goalMet}%`, label: 'Goal Met' }].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                  <div className="flex justify-center mb-1.5"><Icon size={18} className="text-blue-600" /></div>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-gray-700">Monthly donation goal</span>
            <span className="text-sm font-bold text-blue-600">{shelter.goalMet}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${shelter.goalMet}%` }} />
          </div>
        </div>

        {/* Contact & Hours */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Contact & Hours</h3>
          <div className="space-y-3.5">
            {[{ icon: Phone, label: 'Phone', value: shelter.phone }, { icon: Mail, label: 'Email', value: shelter.email }, { icon: Globe, label: 'Website', value: shelter.website }].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><Icon size={16} className="text-blue-600" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
                  <p className={`text-sm font-semibold ${label === 'Website' ? 'text-blue-600' : 'text-gray-900'}`}>{value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><Clock size={16} className="text-blue-600" /></div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Opening Hours</p>
                {shelter.hours.map((line, i) => (<p key={i} className="text-sm font-semibold text-gray-900">{line}</p>))}
              </div>
            </div>
          </div>
        </div>

        {/* Animals */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Animals Available for Adoption</h3>
          <div className="space-y-3 sm:space-y-4">
            {animals.map((animal) => (
              <div key={animal.id} className="rounded-xl p-4 border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-xl">{animal.emoji}</span></div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">{animal.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{animal.breed} · {animal.age} · {animal.gender}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Heart size={16} className="text-gray-300 hover:text-red-400 transition-colors" /></button>
                    <button onClick={() => { setSelectedAnimal(animal); setIsAdoptModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs sm:text-sm transition-colors">Adopt</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-13">
                  {animal.traits.map((trait, i) => (
                    <span key={i} className={`${traitColors[trait.icon]} text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full`}>
                      {trait.icon} {trait.text}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donation Packages */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Donation Packages</h3>
          <div className="space-y-3">
            {donationPackages.map((pkg, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">{pkg.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{pkg.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-blue-100">PKR {pkg.price.toLocaleString()}</span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdoptModal isOpen={isAdoptModalOpen} onClose={() => { setIsAdoptModalOpen(false); setSelectedAnimal(null); }} animal={selectedAnimal} shelterName={shelter.name} />
    </div>
  );
}
