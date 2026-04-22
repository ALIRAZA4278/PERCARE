'use client';

import { ArrowLeft, Star, MapPin, Heart, Clock, Phone, Award, Globe, Shield, Stethoscope, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BookVetModal from '@/components/BookVetModal';

export default function VetDetailPage() {
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [vet, setVet] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchVet();
  }, [id]);

  const fetchVet = async () => {
    const { data: vetData } = await supabase
      .from('vet_profiles')
      .select('*, user:profiles(full_name, email)')
      .eq('id', id)
      .single();

    if (vetData) {
      const { data: clinicLink } = await supabase
        .from('clinic_vets')
        .select('clinic:clinics(id, name, address, city, phone)')
        .eq('vet_id', id)
        .eq('status', 'approved')
        .limit(1)
        .single();

      const { data: revs } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles(full_name)')
        .eq('target_type', 'vet')
        .eq('target_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      setVet(vetData);
      setClinic(clinicLink?.clinic || null);
      setReviews(revs || []);
    }

    setLoading(false);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!vet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-gray-700 mb-4">Vet not found</p>
        <Link href="/vets" className="text-blue-600 hover:underline">Back to Vets</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
        <div className="flex items-center gap-2 mb-5">
          <Link href="/vets" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Vet Profile</h1>
        </div>

        <div className="flex gap-2 mb-5 overflow-hidden rounded-xl">
          {['🩺', '🐕', '🏥'].map((emoji, i) => (
            <div key={i} className="flex-1 h-32 sm:h-44 bg-gray-200 flex items-center justify-center">
              <span className="text-4xl sm:text-5xl opacity-50">{emoji}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <Stethoscope size={24} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold text-gray-900">{vet.user?.full_name || 'Dr. Vet'}</h2>
                {vet.is_available && (
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">{vet.specialization || 'General Practice'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            {vet.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={15} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-gray-900">{vet.rating.toFixed(1)}</span>
                {vet.total_reviews > 0 && <span className="text-sm text-gray-500">({vet.total_reviews})</span>}
              </div>
            )}
            {clinic && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin size={14} className="text-gray-400" />
                <span>{clinic.city}</span>
              </div>
            )}
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

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
          {vet.qualification && <p className="text-sm text-gray-600 leading-relaxed mb-4">{vet.qualification}</p>}
          <div className="grid grid-cols-2 gap-3">
            {vet.experience_years && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award size={15} className="text-gray-400 shrink-0" />
                <span>{vet.experience_years} years experience</span>
              </div>
            )}
            {vet.license_number && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield size={15} className="text-gray-400 shrink-0" />
                <span>{vet.license_number}</span>
              </div>
            )}
            {vet.languages_spoken?.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe size={15} className="text-gray-400 shrink-0" />
                <span>{vet.languages_spoken.join(', ')}</span>
              </div>
            )}
            {vet.contact_phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={15} className="text-gray-400 shrink-0" />
                <span>{vet.contact_phone}</span>
              </div>
            )}
            {vet.consultation_fee && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-gray-400 shrink-0">💰</span>
                <span>Rs. {vet.consultation_fee.toLocaleString()} / visit</span>
              </div>
            )}
          </div>
        </div>

        {vet.services_offered?.length > 0 && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {vet.services_offered.map((s) => (
                <span key={s} className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full border border-blue-100">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {clinic && (
          <Link href={`/clinic/${clinic.id}`} className="block bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 hover:shadow-md transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Clinic</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{clinic.name}</p>
                <p className="text-xs text-gray-500">{clinic.address}{clinic.city ? `, ${clinic.city}` : ''}</p>
                {clinic.phone && <p className="text-xs text-blue-600">{clinic.phone}</p>}
              </div>
            </div>
          </Link>
        )}

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Reviews ({reviews.length})</h3>
          </div>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-blue-600 font-semibold text-xs">{(review.reviewer?.full_name || 'U').charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{review.reviewer?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={12} className={j < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 lg:ml-64">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3">
          {vet.contact_phone ? (
            <a href={`tel:${vet.contact_phone}`} className="bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl text-center text-sm hover:bg-gray-50 transition-colors">
              Call
            </a>
          ) : (
            <div className="bg-gray-100 text-gray-400 font-semibold py-3.5 rounded-xl text-center text-sm cursor-not-allowed">
              No phone
            </div>
          )}
          <button onClick={() => setIsBookOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
            Book Appointment
          </button>
        </div>
      </div>

      <BookVetModal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} vetId={id} vetName={vet.user?.full_name} />
    </div>
  );
}
