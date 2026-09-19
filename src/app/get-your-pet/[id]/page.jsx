'use client';

import { ArrowLeft, Heart, CheckCircle, Stethoscope, Shield, Utensils, Home, RefreshCw, Phone, Truck, PawPrint, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import FeatureDisabled from '@/components/FeatureDisabled';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PetDetailPage() {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const { petDeliveryEnabled, loading: flagsLoading } = useFeatureFlags();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const emojiMap = { dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰', fish: '🐠', other: '🐾' };

  const packageIncludes = [
    { icon: Stethoscope, text: 'Full Health Checkup Report' },
    { icon: Shield, text: 'Vaccination Certificate' },
    { icon: Utensils, text: 'Starter Food Kit (1 month)' },
    { icon: Home, text: 'Free Cage / House / Tank' },
    { icon: RefreshCw, text: '100-Day Replacement Guarantee' },
    { icon: Phone, text: '24/7 Vet Support Access' },
    { icon: Truck, text: 'Safe & Free Delivery' },
  ];

  useEffect(() => {
    if (id) fetchPet();
  }, [id]);

  const fetchPet = async () => {
    const { data } = await supabase.from('company_pets').select('*').eq('id', id).single();
    setPet(data);
    setLoading(false);
  };

  const handleLike = () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    setLiked(!liked);
  };

  const handleBuy = () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    alert('Order placed! Our team will contact you shortly.');
  };

  if (!flagsLoading && !petDeliveryEnabled) {
    return <FeatureDisabled title="Browse Pets" />;
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-foreground mb-4">Pet not found</p>
        <Link href="/get-your-pet" className="text-primary hover:underline">Back to Pets</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 md:px-8 max-w-5xl mx-auto py-4 sm:py-6">
        <Link href="/get-your-pet" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
          <ArrowLeft size={16} />Back to Pets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="relative">
            <div className="rounded-2xl bg-card shadow-card aspect-square flex items-center justify-center overflow-hidden">
              {pet.image_url ? (
                <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl sm:text-9xl">{emojiMap[pet.species] || '🐾'}</span>
              )}
              <div className="absolute top-4 left-4 bg-vitality text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle size={12} />Vet Certified
              </div>
              <div className="absolute top-4 right-4">
                <button onClick={handleLike} className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border hover:bg-muted transition-colors">
                  <Heart size={16} className={liked ? 'text-emergency fill-emergency' : 'text-muted-foreground'} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full mb-2 border border-primary/20">
              <PawPrint size={12} />{pet.species?.toUpperCase() || 'PET'}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{pet.name}</h1>
            {pet.breed && <p className="text-sm sm:text-base text-muted-foreground mb-4 capitalize">{pet.breed}</p>}

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'AGE', value: pet.age_years ? `${pet.age_years}y${pet.age_months ? ` ${pet.age_months}m` : ''}` : pet.age_months ? `${pet.age_months}m` : 'N/A' },
                { label: 'GENDER', value: pet.gender ? (pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)) : 'N/A' },
                { label: 'COLOR', value: pet.color || 'N/A' },
                { label: 'SPECIES', value: pet.species ? (pet.species.charAt(0).toUpperCase() + pet.species.slice(1)) : 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-card rounded-xl p-3.5 border border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-foreground capitalize">{value}</p>
                </div>
              ))}
            </div>

            {pet.description && <p className="text-sm text-muted-foreground leading-relaxed mb-5">{pet.description}</p>}

            <p className="text-2xl sm:text-3xl font-bold text-primary mb-5">Rs. {Number(pet.price).toLocaleString()}</p>

            <div className="flex items-center gap-3 mb-6">
              <button onClick={handleBuy} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                <ShoppingBag size={16} />Buy Now
              </button>
              <button className="px-6 py-3.5 bg-card border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-2 text-sm">
                <Phone size={16} />Inquire
              </button>
            </div>

            <div className="bg-vitality/10 rounded-2xl p-5 border border-vitality/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-vitality" />
                <h3 className="font-bold text-foreground text-sm">Package Includes</h3>
              </div>
              <div className="space-y-2.5">
                {packageIncludes.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Icon size={15} className="text-vitality shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
