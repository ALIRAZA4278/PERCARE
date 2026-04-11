'use client';

import { ArrowLeft, Star, MapPin, Heart, Shield, Phone, Globe, Clock, Bed } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import BookVetModal from '@/components/BookVetModal';

export default function HospitalDetailPage() {
  const [liked, setLiked] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);

  const hospital = {
    name: 'Lahore Pet Hospital',
    rating: 4.8,
    reviews: 340,
    address: '12 Jail Road, Lahore',
    description: "Lahore Pet Hospital is a full-service animal hospital providing comprehensive healthcare with ICU, surgery suites, radiology, and 24/7 emergency care. We have a team of 15+ veterinary specialists.",
    emergency: true,
    beds: 30,
    phone: '+92 42 37654321',
    website: 'www.lahorepethospital.pk',
    hours: '24/7',
    departments: ['Emergency & ICU', 'Surgery', 'Radiology & Imaging', 'Dental', 'Dermatology', 'Internal Medicine', 'Orthopedics'],
    facilities: ['24/7 Emergency Room', 'In-patient Wards', 'Surgical Theater', 'X-Ray & Ultrasound', 'In-house Lab', 'Pharmacy'],
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hospital</h1>
          </div>
          <button onClick={() => setLiked(!liked)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Heart size={22} className={liked ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
          </button>
        </div>

        {/* Image Gallery */}
        <div className="flex gap-2 mb-5 overflow-hidden rounded-xl">
          {['🏥', '🚑'].map((emoji, i) => (
            <div key={i} className="flex-1 h-36 sm:h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-5xl opacity-50">{emoji}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Hospital Info */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{hospital.name}</h2>
          <div className="flex items-center gap-1 mb-2.5">
            <Star size={15} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-900">{hospital.rating}</span>
            <span className="text-sm text-gray-500">({hospital.reviews})</span>
          </div>
          <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-3">
            <MapPin size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <span>{hospital.address}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{hospital.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-100">
              <Shield size={12} />
              24/7 Emergency
            </span>
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
              <Bed size={12} />
              {hospital.beds} Beds
            </span>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Contact</h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Phone size={15} className="text-gray-400" /><span>{hospital.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-blue-600">
              <Globe size={15} className="text-gray-400" /><span>{hospital.website}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Clock size={15} className="text-gray-400" /><span>{hospital.hours}</span>
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Departments</h3>
          <div className="flex flex-wrap gap-2">
            {hospital.departments.map((d) => (
              <span key={d} className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full border border-blue-100">
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Facilities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {hospital.facilities.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                <span className="text-green-600 font-bold text-xs">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 lg:ml-64">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3">
          <a href={`tel:${hospital.phone}`} className="bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl text-center text-sm hover:bg-gray-50 transition-colors">
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
