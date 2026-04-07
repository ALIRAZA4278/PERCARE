'use client';

import { ArrowLeft, Star, MapPin, Heart, Shield, Phone, Globe, Clock, Stethoscope, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import BookVetModal from '@/components/BookVetModal';

export default function ClinicDetailPage() {
  const [liked, setLiked] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);

  const clinic = {
    name: 'PetCare Central Clinic',
    rating: 4.9,
    reviews: 210,
    address: '45-B, Main Boulevard, Gulberg III, Lahore',
    description: "PetCare Central is Lahore's premier veterinary clinic offering comprehensive pet healthcare including general checkups, surgery, vaccination, dental care, grooming, and diagnostic services.",
    emergency: true,
    phone: '+92 42 35761234',
    website: 'www.petcarecentral.pk',
    hours: 'Mon–Sat: 9:00 AM – 8:00 PM',
    services: ['General Checkup', 'Surgery', 'Vaccination', 'Dental Care', 'Grooming', 'X-Ray & Lab'],
    vets: [
      { id: 1, name: 'Dr. Arsalan Khan', specialization: 'General Practice', rating: 4.9 },
      { id: 2, name: 'Dr. Fatima Ahmed', specialization: 'Surgery', rating: 4.8 },
      { id: 3, name: 'Dr. Hassan Raza', specialization: 'Dermatology', rating: 4.7 },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Link href="/vets" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-700" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clinic</h1>
          </div>
          <button onClick={() => setLiked(!liked)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Heart size={22} className={liked ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
          </button>
        </div>

        {/* Image Gallery */}
        <div className="flex gap-2 mb-5 overflow-hidden rounded-xl">
          {['🏥', '🩺'].map((emoji, i) => (
            <div key={i} className="flex-1 h-36 sm:h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-5xl opacity-50">{emoji}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Clinic Info */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{clinic.name}</h2>
          <div className="flex items-center gap-1 mb-2.5">
            <Star size={15} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-900">{clinic.rating}</span>
            <span className="text-sm text-gray-500">({clinic.reviews})</span>
          </div>
          <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-3">
            <MapPin size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <span>{clinic.address}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{clinic.description}</p>
          {clinic.emergency && (
            <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-100">
              <Shield size={12} />
              24/7 Emergency Available
            </div>
          )}
        </div>

        {/* Contact & Hours */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Contact & Hours</h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Phone size={15} className="text-gray-400" /><span>{clinic.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-blue-600">
              <Globe size={15} className="text-gray-400" /><span>{clinic.website}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Clock size={15} className="text-gray-400" /><span>{clinic.hours}</span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Services</h3>
          <div className="flex flex-wrap gap-2">
            {clinic.services.map((s) => (
              <span key={s} className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full border border-blue-100">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Our Veterinarians */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Our Veterinarians</h3>
          <div className="space-y-2">
            {clinic.vets.map((vet) => (
              <Link key={vet.id} href={`/vets/${vet.id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Stethoscope size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{vet.name}</p>
                    <p className="text-xs text-gray-500">{vet.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Star size={13} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-gray-900">{vet.rating}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 lg:ml-48">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3">
          <a href={`tel:${clinic.phone}`} className="bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl text-center text-sm hover:bg-gray-50 transition-colors">
            Call
          </a>
          <button onClick={() => setIsBookOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
            Book Appointment
          </button>
        </div>
      </div>

      <BookVetModal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} petName="Buddy" petEmoji="🐕" />
    </div>
  );
}
