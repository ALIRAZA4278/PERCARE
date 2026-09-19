'use client';

import {
  ArrowLeft,
  Award,
  Building2,
  Calendar,
  Clock,
  Globe,
  Heart,
  MapPin,
  Phone,
  Shield,
  Star,
  Stethoscope,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BookVetModal from '@/components/BookVetModal';
import { supabase } from '@/lib/supabase';

const PHOTO_TILES = ['🩺', '🐕', '🏥'];

export default function VetDetailPage() {
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [vet, setVet] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchVet = async () => {
      const { data: vetData } = await supabase
        .from('vet_profiles')
        .select('*, user:profiles(full_name, email, city, is_verified)')
        .eq('id', id)
        .single();

      if (vetData) {
        const { data: clinicLink } = await supabase
          .from('clinic_vets')
          .select('clinic:clinics(id, name, address, city, phone, is_emergency_available)')
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
    fetchVet();
  }, [id]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!vet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg font-bold text-foreground mb-2">Vet not found</p>
        <Link href="/discover" className="text-sm text-primary font-semibold hover:underline">
          ← Back to Discover
        </Link>
      </div>
    );
  }

  const facts = [
    vet.experience_years && {
      icon: Award,
      text: `${vet.experience_years} years experience`,
    },
    vet.license_number && { icon: Shield, text: vet.license_number },
    vet.languages_spoken?.length > 0 && {
      icon: Globe,
      text: vet.languages_spoken.join(', '),
    },
    vet.contact_phone && { icon: Phone, text: vet.contact_phone },
    vet.consultation_fee && {
      icon: Wallet,
      text: `Rs. ${vet.consultation_fee.toLocaleString()} / visit`,
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen pb-24 md:pb-8 overflow-x-hidden">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 py-3 flex items-center gap-3 max-w-3xl mx-auto">
          <Link
            href="/discover"
            className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10 shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground flex-1 truncate">Vet Profile</h1>
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 max-w-3xl mx-auto space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {PHOTO_TILES.map((emoji, i) => (
            <div
              key={i}
              className="w-48 h-32 rounded-2xl bg-muted flex items-center justify-center shrink-0"
            >
              <span className="text-4xl opacity-50">{emoji}</span>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-card shadow-card">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-foreground">
                  {vet.user?.full_name || 'Dr. Vet'}
                </h2>
                {vet.user?.is_verified && <Shield className="h-4 w-4 text-primary shrink-0" />}
              </div>
              <p className="text-sm text-muted-foreground">
                {vet.specialization || 'General Practice'}
              </p>

              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {vet.rating > 0 && (
                  <span className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 text-amber fill-amber" />
                    <span className="font-semibold tabular-nums">{vet.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground tabular-nums">
                      ({vet.total_reviews || 0})
                    </span>
                  </span>
                )}
                {(clinic?.city || vet.user?.city) && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {clinic?.city || vet.user?.city}
                  </span>
                )}
              </div>

              <button
                onClick={() => setLiked(!liked)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-border btn-press hover:bg-muted transition-colors"
              >
                <Heart
                  className={`h-3.5 w-3.5 ${
                    liked ? 'text-emergency fill-emergency' : 'text-muted-foreground'
                  }`}
                />
                {liked ? 'Saved' : 'Save to Favourites'}
              </button>
            </div>
          </div>

          {clinic?.is_emergency_available && (
            <div className="mt-4 px-3 py-2 rounded-xl bg-emergency/10 text-emergency text-xs font-semibold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> 24/7 Emergency Available
            </div>
          )}
        </div>

        {(vet.qualification || facts.length > 0) && (
          <div className="p-5 rounded-2xl bg-card shadow-card">
            <h3 className="text-sm font-bold text-foreground mb-2">About</h3>
            {vet.qualification && (
              <p className="text-sm text-muted-foreground leading-relaxed">{vet.qualification}</p>
            )}
            {facts.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {facts.map((fact) => {
                  const Icon = fact.icon;
                  return (
                    <div key={fact.text} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-xs text-foreground">{fact.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {vet.services_offered?.length > 0 && (
          <div className="p-5 rounded-2xl bg-card shadow-card">
            <h3 className="text-sm font-bold text-foreground mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {vet.services_offered.map((service) => (
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

        {clinic && (
          <Link
            href={`/clinic/${clinic.id}`}
            className="block p-5 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all btn-press"
          >
            <h3 className="text-sm font-bold text-foreground mb-3">Clinic</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{clinic.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {clinic.address}
                  {clinic.city ? `, ${clinic.city}` : ''}
                </p>
                {clinic.phone && <p className="text-xs text-primary">{clinic.phone}</p>}
              </div>
            </div>
          </Link>
        )}

        <div className="p-5 rounded-2xl bg-card shadow-card">
          <h3 className="text-sm font-bold text-foreground mb-3">Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold text-xs">
                        {(review.reviewer?.full_name || 'U').charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {review.reviewer?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className={`h-3 w-3 ${
                          j < review.rating ? 'text-amber fill-amber' : 'text-muted-foreground/40'
                        }`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {vet.contact_phone ? (
            <a
              href={`tel:${vet.contact_phone}`}
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
        vetId={id}
        vetName={vet.user?.full_name}
      />
    </div>
  );
}
