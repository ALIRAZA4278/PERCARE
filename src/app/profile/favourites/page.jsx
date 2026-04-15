'use client';

import { ArrowLeft, Star, Heart, Stethoscope, MapPin, ShoppingBag, Store, Home, PawPrint } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const iconMap = {
  vet: Stethoscope, clinic: MapPin, product: ShoppingBag, store: Store, shelter: Home, animal: PawPrint,
};
const filterLabels = { vet: 'Vets', clinic: 'Clinics', product: 'Products', store: 'Stores', shelter: 'Shelters', animal: 'Animals' };

export default function FavouritesPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'Vets', 'Clinics', 'Products', 'Stores', 'Shelters', 'Animals'];

  useEffect(() => {
    if (!authLoading && !isLoggedIn) { router.push('/login'); return; }
    if (user) fetchFavourites();
  }, [user, authLoading, isLoggedIn]);

  const fetchFavourites = async () => {
    const { data: favs } = await supabase
      .from('favourites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!favs || favs.length === 0) { setFavourites([]); setLoading(false); return; }

    const enriched = await Promise.all(favs.map(async (fav) => {
      let name = '', sub = '', rating = null;
      if (fav.target_type === 'vet') {
        const { data } = await supabase.from('vet_profiles').select('*, user:profiles(full_name)').eq('id', fav.target_id).single();
        if (data) { name = data.user?.full_name || 'Vet'; sub = data.specialization || 'General'; rating = data.rating; }
      } else if (fav.target_type === 'clinic') {
        const { data } = await supabase.from('clinics').select('name, city, rating').eq('id', fav.target_id).single();
        if (data) { name = data.name; sub = data.city || ''; rating = data.rating; }
      } else if (fav.target_type === 'product') {
        const { data } = await supabase.from('products').select('name, brand, rating').eq('id', fav.target_id).single();
        if (data) { name = data.name; sub = data.brand || ''; rating = data.rating; }
      } else if (fav.target_type === 'store') {
        const { data } = await supabase.from('stores').select('name, store_type, rating').eq('id', fav.target_id).single();
        if (data) { name = data.name; sub = data.store_type || ''; rating = data.rating; }
      } else if (fav.target_type === 'shelter') {
        const { data } = await supabase.from('shelters').select('name, city').eq('id', fav.target_id).single();
        if (data) { name = data.name; sub = data.city || ''; }
      } else if (fav.target_type === 'animal') {
        const { data } = await supabase.from('shelter_animals').select('name, species, breed').eq('id', fav.target_id).single();
        if (data) { name = data.name; sub = `${data.breed || data.species}`; }
      }
      return { ...fav, name, sub, rating };
    }));

    setFavourites(enriched);
    setLoading(false);
  };

  const removeFavourite = async (favId) => {
    await supabase.from('favourites').delete().eq('id', favId);
    setFavourites(favourites.filter(f => f.id !== favId));
  };

  const filterTypeMap = { Vets: 'vet', Clinics: 'clinic', Products: 'product', Stores: 'store', Shelters: 'shelter', Animals: 'animal' };
  const filtered = activeFilter === 'All' ? favourites : favourites.filter(f => f.target_type === filterTypeMap[activeFilter]);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft size={18} className="text-gray-700" />
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-gray-900">Favourites</h1>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 sm:px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-2 sm:space-y-3">
          {filtered.map((item) => {
            const Icon = iconMap[item.target_type] || PawPrint;
            return (
              <div key={item.id} className="flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{item.sub}</p>
                    <span className="text-xs font-medium text-blue-600 capitalize">{filterLabels[item.target_type] || item.target_type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {item.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">{item.rating}</span>
                    </div>
                  )}
                  <button onClick={() => removeFavourite(item.id)}>
                    <Heart size={20} className="text-red-500 fill-red-500 cursor-pointer hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No favourites yet</h3>
            <p className="text-gray-600">Save vets, products, and more to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
