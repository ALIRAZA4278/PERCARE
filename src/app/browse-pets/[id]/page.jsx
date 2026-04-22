'use client';

import { ArrowLeft, Heart, CheckCircle, Stethoscope, Shield, Utensils, Home, RefreshCw, Phone, Truck, PawPrint, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PetDetailPage() {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
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

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-gray-700 mb-4">Pet not found</p>
        <Link href="/browse-pets" className="text-blue-600 hover:underline">Back to Pets</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Link href="/browse-pets" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-5 transition-colors">
          <ArrowLeft size={16} />Back to Pets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="relative">
            <div className="bg-white rounded-2xl border border-gray-200 aspect-square flex items-center justify-center overflow-hidden">
              {pet.image_url ? (
                <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl sm:text-9xl">{emojiMap[pet.species] || '🐾'}</span>
              )}
              <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle size={12} />Vet Certified
              </div>
              <div className="absolute top-4 right-4">
                <button onClick={handleLike} className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Heart size={16} className={liked ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full mb-2 border border-blue-100">
              <PawPrint size={12} />{pet.species?.toUpperCase() || 'PET'}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{pet.name}</h1>
            {pet.breed && <p className="text-sm sm:text-base text-gray-500 mb-4 capitalize">{pet.breed}</p>}

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'AGE', value: pet.age_years ? `${pet.age_years}y${pet.age_months ? ` ${pet.age_months}m` : ''}` : pet.age_months ? `${pet.age_months}m` : 'N/A' },
                { label: 'GENDER', value: pet.gender ? (pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)) : 'N/A' },
                { label: 'COLOR', value: pet.color || 'N/A' },
                { label: 'SPECIES', value: pet.species ? (pet.species.charAt(0).toUpperCase() + pet.species.slice(1)) : 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl p-3.5 border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{value}</p>
                </div>
              ))}
            </div>

            {pet.description && <p className="text-sm text-gray-600 leading-relaxed mb-5">{pet.description}</p>}

            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-5">Rs. {Number(pet.price).toLocaleString()}</p>

            <div className="flex items-center gap-3 mb-6">
              <button onClick={handleBuy} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                <ShoppingBag size={16} />Buy Now
              </button>
              <button className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                <Phone size={16} />Inquire
              </button>
            </div>

            <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-green-600" />
                <h3 className="font-bold text-gray-900 text-sm">Package Includes</h3>
              </div>
              <div className="space-y-2.5">
                {packageIncludes.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <Icon size={15} className="text-green-600 shrink-0" />
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
