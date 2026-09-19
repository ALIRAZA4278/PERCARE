'use client';

import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  Heart,
  MapPin,
  Phone,
  Shield,
  Star,
  Stethoscope,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BookVetModal from '@/components/BookVetModal';
import { supabase } from '@/lib/supabase';

const PHOTO_TILES = ['🏥', '🩺', '🐕'];

export default function ClinicDetailPage() {
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [clinic, setClinic] = useState(null);
  const [vets, setVets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchClinic = async () => {
      const [clinicRes, vetsRes, servicesRes] = await Promise.all([
        supabase.from('clinics').select('*').eq('id', id).single(),
        supabase
          .from('clinic_vets')
          .select('vet:vet_profiles(id, specialization, rating, user:profiles(full_name))')
          .eq('clinic_id', id)
          .eq('status', 'approved'),
        supabase.from('clinic_services').select('name').eq('clinic_id', id),
      ]);

      setClinic(clinicRes.data);
      setVets(vetsRes.data?.map((cv) => cv.vet).filter(Boolean) || []);
      setServices(servicesRes.data?.map((s) => s.name) || []);
      setLoading(false);
    };
    fetchClinic();
  }, [id]);

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg font-bold text-foreground mb-2">Clinic not found</p>
        <Link href="/discover" className="text-sm text-primary font-semibold hover:underline">
          ← Back to Discover
        </Link>
      </div>
    );
  }

  const hours = formatHours(clinic);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 py-4 flex items-center gap-3">
          <Link
            href="/discover"
            className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground flex-1">Clinic</h1>
          <button
            onClick={() => setLiked(!liked)}
            aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
            className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10"
          >
            <Heart
              className={`h-4 w-4 ${liked ? 'text-emergency fill-emergency' : 'text-muted-foreground'}`}
            />
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-2xl space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {clinic.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clinic.image_url}
              alt={clinic.name}
              className="w-48 h-32 rounded-2xl object-cover shrink-0"
            />
          ) : (
            PHOTO_TILES.map((emoji, i) => (
              <div
                key={i}
                className="w-48 h-32 rounded-2xl bg-muted flex items-center justify-center shrink-0"
              >
                <span className="text-4xl opacity-50">{emoji}</span>
              </div>
            ))
          )}
        </div>

        <div className="p-6 rounded-2xl bg-card shadow-card">
          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-lg font-bold text-foreground">{clinic.name}</h2>
            {clinic.is_approved && <Shield className="h-4 w-4 text-primary" />}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            {clinic.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber fill-amber" />
                <span className="font-semibold text-foreground tabular-nums">{clinic.rating}</span>
                <span className="tabular-nums">({clinic.total_reviews || 0})</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {clinic.address}
              {clinic.city ? `, ${clinic.city}` : ''}
            </span>
          </div>

          {clinic.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{clinic.description}</p>
          )}

          {clinic.is_emergency_available && (
            <div className="mt-4 px-3 py-2 rounded-xl bg-emergency/10 text-emergency text-xs font-semibold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> 24/7 Emergency Available
            </div>
          )}
        </div>

        {(clinic.phone || clinic.website || hours) && (
          <div className="p-5 rounded-2xl bg-card shadow-card">
            <h3 className="text-sm font-bold text-foreground mb-2">Contact &amp; Hours</h3>
            <div className="space-y-2 text-sm">
              {clinic.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{clinic.phone}</span>
                </div>
              )}
              {clinic.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{clinic.website}</span>
                </div>
              )}
              {hours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{hours}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div className="p-5 rounded-2xl bg-card shadow-card">
            <h3 className="text-sm font-bold text-foreground mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <span
                  key={service}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {vets.length > 0 && (
          <div className="p-5 rounded-2xl bg-card shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">Our Veterinarians</h3>
            </div>
            <div className="space-y-2">
              {vets.map((vet) => (
                <Link
                  key={vet.id}
                  href={`/vet/${vet.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-expo btn-press"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {vet.user?.full_name || 'Veterinarian'}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {vet.specialization || 'General Practice'}
                    </p>
                  </div>
                  {vet.rating > 0 && (
                    <span className="flex items-center gap-1 text-xs shrink-0">
                      <Star className="h-3 w-3 text-amber fill-amber" />
                      <span className="tabular-nums font-semibold">{vet.rating}</span>
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {clinic.phone ? (
            <a
              href={`tel:${clinic.phone}`}
              className="flex-1 h-12 rounded-xl border border-border bg-card flex items-center justify-center gap-2 text-sm font-semibold text-foreground btn-press transition-expo hover:bg-muted"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
          ) : (
            <div className="flex-1 h-12 rounded-xl bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
              No phone
            </div>
          )}
          <button
            onClick={() => setIsBookOpen(true)}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-semibold btn-press transition-expo hover:opacity-90"
          >
            <Calendar className="h-4 w-4" /> Book Appointment
          </button>
        </div>
      </div>

      <BookVetModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        vetName={clinic.name}
      />
    </div>
  );
}
