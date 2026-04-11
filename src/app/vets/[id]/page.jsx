'use client';

import { ArrowLeft, Star, MapPin, Heart, Clock, Phone, Award, Globe, Shield, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import BookVetModal from '@/components/BookVetModal';

export default function VetDetailPage() {
  const [liked, setLiked] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);

  const vet = {
    name: 'Dr. Arsalan Khan',
    specialization: 'General Practice',
    rating: 4.9,
    reviews: 128,
    distance: '1.2 km',
    emergency: true,
    about: 'Dr. Arsalan Khan is a highly experienced veterinarian specializing in general practice with a focus on companion animals. He graduated from UVAS Lahore and has been practicing for over 8 years.',
    experience: '8 years experience',
    license: 'VET-PAK-2018-1234',
    languages: 'English, Urdu',
    phone: '+92 300 1234567',
    services: ['General Checkup', 'Vaccination', 'Surgery', 'Dental Care', 'Emergency Care'],
    availability: [
      { day: 'Monday', hours: '9:00 AM – 5:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM – 5:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM – 5:00 PM' },
      { day: 'Thursday', hours: '9:00 AM – 5:00 PM' },
      { day: 'Friday', hours: '9:00 AM – 1:00 PM' },
      { day: 'Saturday', hours: '10:00 AM – 3:00 PM' },
    ],
    reviewsList: [
      { name: 'Ali Hassan', date: 'Mar 10, 2026', rating: 5, comment: 'Excellent vet! Took great care of my dog during surgery.' },
      { name: 'Fatima Noor', date: 'Feb 28, 2026', rating: 5, comment: 'Good experience overall. Dr. Arsalan explained everything clearly.' },
      { name: 'Usman Raza', date: 'Feb 15, 2026', rating: 5, comment: 'Best vet in Lahore! Highly recommended.' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
        <div className="flex items-center gap-2 mb-5">
          <Link href="/vets" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Vet Profile</h1>
        </div>

        {/* Image Gallery */}
        <div className="flex gap-2 mb-5 overflow-hidden rounded-xl">
          {['🩺', '🐕', '🏥'].map((emoji, i) => (
            <div key={i} className="flex-1 h-32 sm:h-44 bg-gray-200 flex items-center justify-center">
              <span className="text-4xl sm:text-5xl opacity-50">{emoji}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
              <Stethoscope size={24} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold text-gray-900">{vet.name}</h2>
                <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
              </div>
              <p className="text-sm text-gray-500">{vet.specialization}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <Star size={15} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">{vet.rating}</span>
              <span className="text-sm text-gray-500">({vet.reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={14} className="text-gray-400" />
              <span>{vet.distance}</span>
            </div>
          </div>

          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              liked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Heart size={14} className={liked ? 'fill-red-500 text-red-500' : ''} />
            Save to Favourites
          </button>
        </div>

        {/* Emergency Badge */}
        {vet.emergency && (
          <div className="bg-red-50 rounded-2xl px-5 py-3 mb-4 border border-red-100">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-red-500" />
              <span className="text-sm font-semibold text-red-600">24/7 Emergency Available</span>
            </div>
          </div>
        )}

        {/* About */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{vet.about}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award size={15} className="text-gray-400 flex-shrink-0" />
              <span>{vet.experience}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield size={15} className="text-gray-400 flex-shrink-0" />
              <span>{vet.license}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe size={15} className="text-gray-400 flex-shrink-0" />
              <span>{vet.languages}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={15} className="text-gray-400 flex-shrink-0" />
              <span>{vet.phone}</span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Services</h3>
          <div className="flex flex-wrap gap-2">
            {vet.services.map((s) => (
              <span key={s} className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full border border-blue-100">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Availability</h3>
          <div className="space-y-0">
            {vet.availability.map(({ day, hours }) => (
              <div key={day} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{day}</span>
                <span className="text-sm text-gray-500 font-mono">{hours}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Reviews ({vet.reviewsList.length})</h3>
            <button className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors">Write a Review</button>
          </div>
          <div className="space-y-3">
            {vet.reviewsList.map((review, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-xs">{review.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mb-1.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={12} className={j < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 lg:ml-64">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3">
          <a href={`tel:${vet.phone}`} className="bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl text-center text-sm hover:bg-gray-50 transition-colors">
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
