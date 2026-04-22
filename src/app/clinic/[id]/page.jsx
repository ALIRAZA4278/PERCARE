'use client';

import { ArrowLeft, Star, MapPin, Heart, Shield, Phone, Globe, Clock, Stethoscope } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BookVetModal from '@/components/BookVetModal';

export default function ClinicDetailPage() {
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [clinic, setClinic] = useState(null);
  const [vets, setVets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchClinic();
  }, [id]);

  const fetchClinic = async () => {
    const [clinicRes, vetsRes, servicesRes] = await Promise.all([
      supabase.from('clinics').select('*').eq('id', id).single(),
      supabase.from('clinic_vets').select('vet:vet_profiles(id, specialization, rating, user:profiles(full_name))').eq('clinic_id', id).eq('status', 'approved'),
      supabase.from('clinic_services').select('name').eq('clinic_id', id),
    ]);

    setClinic(clinicRes.data);
    setVets(vetsRes.data?.map(cv => cv.vet).filter(Boolean) || []);
    setServices(servicesRes.data?.map(s => s.name) || []);
    setLoading(false);
  };

  const formatHours = (c) => {
    if (!c) return null;
    const days = c.working_days?.join(', ');
    const open = c.opening_time ? c.opening_time.slice(0, 5) : null;
    const close = c.closing_time ? c.closing_time.slice(0, 5) : null;
    if (!days && !open) return null;
    const timeStr = open && close ? `${open} – ${close}` : '';
    return [days, timeStr].filter(Boolean).join(': ');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-gray-700 mb-4">Clinic not found</p>
        <Link href="/vets" className="text-blue-600 hover:underline">Back to Vets</Link>
      </div>
    );
  }

  const hours = formatHours(clinic);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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

        <div className="flex gap-2 mb-5 overflow-hidden rounded-xl">
          {['🏥', '🩺'].map((emoji, i) => (
            <div key={i} className={`flex-1 h-36 sm:h-48 bg-gray-200 flex items-center justify-center overflow-hidden rounded-xl`}>
              {clinic.image_url && i === 0 ? (
                <img src={clinic.image_url} alt={clinic.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl opacity-50">{emoji}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{clinic.name}</h2>
          {clinic.rating > 0 && (
            <div className="flex items-center gap-1 mb-2.5">
              <Star size={15} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">{Number(clinic.rating).toFixed(1)}</span>
              {clinic.total_reviews > 0 && <span className="text-sm text-gray-500">({clinic.total_reviews})</span>}
            </div>
          )}
          <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-3">
            <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
            <span>{clinic.address}, {clinic.city}</span>
          </div>
          {clinic.description && <p className="text-sm text-gray-600 leading-relaxed mb-3">{clinic.description}</p>}
          {clinic.is_emergency_available && (
            <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-100">
              <Shield size={12} />
              24/7 Emergency Available
            </div>
          )}
        </div>

        {(clinic.phone || clinic.website || hours) && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Contact & Hours</h3>
            <div className="space-y-2.5">
              {clinic.phone && (
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Phone size={15} className="text-gray-400" /><span>{clinic.phone}</span>
                </div>
              )}
              {clinic.website && (
                <div className="flex items-center gap-2.5 text-sm text-blue-600">
                  <Globe size={15} className="text-gray-400" /><span>{clinic.website}</span>
                </div>
              )}
              {hours && (
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Clock size={15} className="text-gray-400" /><span>{hours}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <span key={s} className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full border border-blue-100">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {vets.length > 0 && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Our Veterinarians</h3>
            <div className="space-y-2">
              {vets.map((vet) => (
                <Link key={vet.id} href={`/vets/${vet.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                      <Stethoscope size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{vet.user?.full_name || 'Dr. Vet'}</p>
                      <p className="text-xs text-gray-500">{vet.specialization || 'General Practice'}</p>
                    </div>
                  </div>
                  {vet.rating > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Star size={13} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">{Number(vet.rating).toFixed(1)}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 lg:ml-64">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3">
          {clinic.phone ? (
            <a href={`tel:${clinic.phone}`} className="bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl text-center text-sm hover:bg-gray-50 transition-colors">
              Call
            </a>
          ) : (
            <div className="bg-gray-100 text-gray-400 font-semibold py-3.5 rounded-xl text-center text-sm cursor-not-allowed">No phone</div>
          )}
          <button onClick={() => setIsBookOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
            Book Appointment
          </button>
        </div>
      </div>

      <BookVetModal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} petName="Buddy" petEmoji="🐕" />
    </div>
  );
}
