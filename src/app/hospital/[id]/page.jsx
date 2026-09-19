'use client';

import { ArrowLeft, Star, MapPin, Heart, Shield, Phone, Globe, Clock, Stethoscope, Bed } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BookVetModal from '@/components/BookVetModal';

export default function HospitalDetailPage() {
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
    const open = c.opening_time ? c.opening_time.slice(0, 5) : null;
    const close = c.closing_time ? c.closing_time.slice(0, 5) : null;
    return open && close ? `${open} – ${close}` : '24/7';
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-foreground mb-4">Hospital not found</p>
        <Link href="/discover" className="text-primary hover:underline">Back to Vets</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Link href="/discover" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-foreground" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Hospital</h1>
          </div>
          <button onClick={() => setLiked(!liked)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Heart size={22} className={liked ? 'text-emergency fill-emergency' : 'text-muted-foreground'} />
          </button>
        </div>

        <div className="flex gap-2 mb-5 overflow-hidden rounded-xl">
          {['🏥', '🚑'].map((emoji, i) => (
            <div key={i} className={`flex-1 h-36 sm:h-48 flex items-center justify-center overflow-hidden rounded-xl bg-muted`}>
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
        <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{clinic.name}</h2>
          {clinic.rating > 0 && (
            <div className="flex items-center gap-1 mb-2.5">
              <Star size={15} className="text-amber fill-amber" />
              <span className="text-sm font-semibold text-foreground">{Number(clinic.rating).toFixed(1)}</span>
              {clinic.total_reviews > 0 && <span className="text-sm text-muted-foreground">({clinic.total_reviews})</span>}
            </div>
          )}
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin size={15} className="text-muted-foreground shrink-0 mt-0.5" />
            <span>{clinic.address}, {clinic.city}</span>
          </div>
          {clinic.description && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{clinic.description}</p>}
          <div className="flex items-center gap-2 flex-wrap">
            {clinic.is_emergency_available && (
              <span className="inline-flex items-center gap-1.5 bg-emergency/10 text-emergency text-xs font-semibold px-3 py-1.5 rounded-full border border-emergency/20">
                <Shield size={12} />24/7 Emergency
              </span>
            )}
            {vets.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20">
                <Stethoscope size={12} />{vets.length} Vets
              </span>
            )}
          </div>
        </div>

        {(clinic.phone || clinic.website || clinic.opening_time) && (
          <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border mb-4">
            <h3 className="text-lg font-bold text-foreground mb-3">Contact</h3>
            <div className="space-y-2.5">
              {clinic.phone && (
                <div className="flex items-center gap-2.5 text-sm text-foreground">
                  <Phone size={15} className="text-muted-foreground" /><span>{clinic.phone}</span>
                </div>
              )}
              {clinic.website && (
                <div className="flex items-center gap-2.5 text-sm text-primary">
                  <Globe size={15} className="text-muted-foreground" /><span>{clinic.website}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm text-foreground">
                <Clock size={15} className="text-muted-foreground" /><span>{formatHours(clinic)}</span>
              </div>
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border mb-4">
            <h3 className="text-lg font-bold text-foreground mb-3">Departments & Services</h3>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <span key={s} className="bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full border border-primary/20">{s}</span>
              ))}
            </div>
          </div>
        )}

        {vets.length > 0 && (
          <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border mb-4">
            <h3 className="text-lg font-bold text-foreground mb-3">Our Veterinarians</h3>
            <div className="space-y-2">
              {vets.map((vet) => (
                <Link key={vet.id} href={`/vet/${vet.id}`} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Stethoscope size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{vet.user?.full_name || 'Dr. Vet'}</p>
                      <p className="text-xs text-muted-foreground">{vet.specialization || 'General Practice'}</p>
                    </div>
                  </div>
                  {vet.rating > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Star size={13} className="text-amber fill-amber" />
                      <span className="text-sm font-semibold text-foreground">{Number(vet.rating).toFixed(1)}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-10 lg:ml-64">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3">
          {clinic.phone ? (
            <a href={`tel:${clinic.phone}`} className="bg-card border border-border text-foreground font-semibold py-3.5 rounded-xl text-center text-sm hover:bg-muted transition-colors">
              Call
            </a>
          ) : (
            <div className="bg-muted text-muted-foreground font-semibold py-3.5 rounded-xl text-center text-sm cursor-not-allowed">No phone</div>
          )}
          <button onClick={() => setIsBookOpen(true)} className="bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
            Book Appointment
          </button>
        </div>
      </div>

      <BookVetModal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} petName="Buddy" petEmoji="🐕" />
    </div>
  );
}
