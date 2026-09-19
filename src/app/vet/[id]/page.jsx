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
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!vet) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-foreground mb-4">Vet not found</p>
        <Link href="/discover" className="text-primary hover:underline">Back to Vets</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
        <div className="flex items-center gap-2 mb-5">
          <Link href="/discover" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Vet Profile</h1>
        </div>

        <div className="flex gap-2 mb-5 overflow-hidden rounded-xl">
          {['🩺', '🐕', '🏥'].map((emoji, i) => (
            <div key={i} className="flex-1 h-32 sm:h-44 bg-muted flex items-center justify-center">
              <span className="text-4xl sm:text-5xl opacity-50">{emoji}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border mb-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Stethoscope size={24} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold text-foreground">{vet.user?.full_name || 'Dr. Vet'}</h2>
                {vet.is_available && (
                  <div className="w-4 h-4 bg-vitality/10 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-vitality rounded-full" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{vet.specialization || 'General Practice'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            {vet.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={15} className="text-amber fill-amber" />
                <span className="text-sm font-semibold text-foreground">{vet.rating.toFixed(1)}</span>
                {vet.total_reviews > 0 && <span className="text-sm text-muted-foreground">({vet.total_reviews})</span>}
              </div>
            )}
            {clinic && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin size={14} className="text-muted-foreground" />
                <span>{clinic.city}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              liked ? 'bg-emergency/10 border-emergency/20 text-emergency' : 'bg-card border-border text-foreground hover:bg-muted'
            }`}
          >
            <Heart size={14} className={liked ? 'fill-emergency text-emergency' : ''} />
            Save to Favourites
          </button>
        </div>

        <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">About</h3>
          {vet.qualification && <p className="text-sm text-muted-foreground leading-relaxed mb-4">{vet.qualification}</p>}
          <div className="grid grid-cols-2 gap-3">
            {vet.experience_years && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award size={15} className="text-muted-foreground shrink-0" />
                <span>{vet.experience_years} years experience</span>
              </div>
            )}
            {vet.license_number && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield size={15} className="text-muted-foreground shrink-0" />
                <span>{vet.license_number}</span>
              </div>
            )}
            {vet.languages_spoken?.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe size={15} className="text-muted-foreground shrink-0" />
                <span>{vet.languages_spoken.join(', ')}</span>
              </div>
            )}
            {vet.contact_phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={15} className="text-muted-foreground shrink-0" />
                <span>{vet.contact_phone}</span>
              </div>
            )}
            {vet.consultation_fee && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-muted-foreground shrink-0">💰</span>
                <span>Rs. {vet.consultation_fee.toLocaleString()} / visit</span>
              </div>
            )}
          </div>
        </div>

        {vet.services_offered?.length > 0 && (
          <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border mb-4">
            <h3 className="text-lg font-bold text-foreground mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {vet.services_offered.map((s) => (
                <span key={s} className="bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full border border-primary/20">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {clinic && (
          <Link href={`/clinic/${clinic.id}`} className="block bg-card rounded-2xl p-5 sm:p-6 border border-border mb-4 hover:shadow-card-hover transition-all">
            <h3 className="text-lg font-bold text-foreground mb-3">Clinic</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{clinic.name}</p>
                <p className="text-xs text-muted-foreground">{clinic.address}{clinic.city ? `, ${clinic.city}` : ''}</p>
                {clinic.phone && <p className="text-xs text-primary">{clinic.phone}</p>}
              </div>
            </div>
          </Link>
        )}

        <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Reviews ({reviews.length})</h3>
          </div>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted border border-border">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold text-xs">{(review.reviewer?.full_name || 'U').charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{review.reviewer?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={12} className={j < review.rating ? 'text-amber fill-amber' : 'text-muted-foreground/40'} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-10 lg:ml-64">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3">
          {vet.contact_phone ? (
            <a href={`tel:${vet.contact_phone}`} className="bg-card border border-border text-foreground font-semibold py-3.5 rounded-xl text-center text-sm hover:bg-muted transition-colors">
              Call
            </a>
          ) : (
            <div className="bg-muted text-muted-foreground font-semibold py-3.5 rounded-xl text-center text-sm cursor-not-allowed">
              No phone
            </div>
          )}
          <button onClick={() => setIsBookOpen(true)} className="bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
            Book Appointment
          </button>
        </div>
      </div>

      <BookVetModal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} vetId={id} vetName={vet.user?.full_name} />
    </div>
  );
}
