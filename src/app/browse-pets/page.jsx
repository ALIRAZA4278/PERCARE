'use client';

import { ArrowLeft, ArrowRight, Stethoscope, Shield, Utensils, Home, RefreshCw, Phone, Search, SlidersHorizontal, Heart, Eye, Star, Truck, CheckCircle, PawPrint } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function BrowsePetsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All Pets');
  const [searchQuery, setSearchQuery] = useState('');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    const { data } = await supabase
      .from('company_pets')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });
    setPets(data || []);
    setLoading(false);
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { router.push('/login'); return; }
  };

  const categories = ['All Pets', 'Dogs & Puppies', 'Cats & Kittens', 'Birds', 'Rabbits', 'Fish'];

  const speciesMap = {
    'Dogs & Puppies': 'dog', 'Cats & Kittens': 'cat', 'Birds': 'bird', 'Rabbits': 'rabbit', 'Fish': 'fish',
  };

  const emojiMap = { dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰', fish: '🐠', other: '🐾' };

  const filtered = pets.filter(pet => {
    const catMatch = activeCategory === 'All Pets' || pet.species === speciesMap[activeCategory];
    const searchMatch = !searchQuery.trim() ||
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchQuery.toLowerCase()));
    return catMatch && searchMatch;
  });

  const features = [
    { icon: Stethoscope, title: 'Vet-Checked & Healthy', description: 'Every pet undergoes thorough veterinary examination before listing' },
    { icon: Shield, title: 'Free Vaccination', description: 'Complete vaccination coverage included with every pet' },
    { icon: Utensils, title: 'Starter Food Kit', description: 'Premium food supply to get your pet started on the right diet' },
    { icon: Home, title: 'Free Cage/House', description: 'Appropriate housing included — cage, tank, or bed based on pet type' },
    { icon: RefreshCw, title: '100-Day Guarantee', description: 'Full replacement within 7 days if pet passes away within 100 days' },
    { icon: Phone, title: '24/7 Vet Support', description: 'Round-the-clock veterinary assistance via call for your pet' },
  ];

  const steps = [
    { num: 1, title: 'Choose Your Pet', description: 'Browse our curated selection of healthy, verified pets' },
    { num: 2, title: 'Place Your Order', description: 'Select your pet and complete a simple checkout process' },
    { num: 3, title: 'We Prepare Everything', description: 'Health check, vaccination, food kit, and housing are arranged' },
    { num: 4, title: 'Safe Delivery', description: 'Your pet is delivered safely and comfortably to your doorstep' },
    { num: 5, title: 'Ongoing Support', description: 'Get 24/7 vet support and guidance for your new companion' },
  ];

  const reviews = [
    { name: 'Ahmed K.', rating: 5, text: '"Got my Golden Retriever puppy from PetCare. Arrived healthy, vaccinated, and with a full food kit. Incredible service!"' },
    { name: 'Sara M.', rating: 5, text: '"The 100-day guarantee gave me peace of mind. My Persian kitten is thriving and the vet support has been amazing."' },
    { name: 'Usman R.', rating: 4, text: '"Ordered a pair of Betta fish — they arrived in perfect condition. The tank setup was a bonus I didn\'t expect!"' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-b from-gray-100 to-gray-50 py-8 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft size={16} />Back to Home
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              <PawPrint size={13} />Company-Owned Pets Only
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Your New Best Friend, <span className="text-blue-600">Delivered Safely.</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
              We take care of everything — health, food, shelter, and support. Browse our curated selection of premium pets.
            </p>
            <Link href="#browse" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              Explore Pets <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="py-10 sm:py-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">What You Get With Every Pet</h2>
            <p className="text-sm sm:text-base text-gray-600">A complete package designed for trust, safety, and your pet's well-being</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3"><Icon size={20} className="text-blue-600" /></div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">{title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="browse" className="pb-10 sm:pb-14">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}>
                <PawPrint size={14} />{cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by name or breed..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm bg-white" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16"><p className="text-gray-500">Loading pets...</p></div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4"><span className="font-semibold text-gray-900">{filtered.length}</span> pets found</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map((pet) => (
                  <Link key={pet.id} href={`/browse-pets/${pet.id}`} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                    <div className="relative aspect-square bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      {pet.image_url ? (
                        <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl sm:text-6xl">{emojiMap[pet.species] || '🐾'}</span>
                      )}
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle size={10} />Vet Certified
                      </div>
                      <button onClick={handleLike} className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart size={15} className="text-gray-400" />
                      </button>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-gray-900 text-sm">{pet.name}</h3>
                      <p className="text-xs text-gray-500 mb-2 capitalize">{pet.breed || pet.species} · {pet.age_years ? `${pet.age_years}y` : ''}{pet.age_months ? ` ${pet.age_months}m` : ''}</p>
                      <p className="text-sm sm:text-base font-bold text-blue-600">Rs. {pet.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🐾</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No pets available yet</h3>
                  <p className="text-gray-600">Check back soon for new arrivals!</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="py-10 sm:py-14 border-t border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
            <p className="text-sm sm:text-base text-gray-600">A simple, safe process from selection to delivery</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {steps.map(({ num, title, description }) => (
              <div key={num} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 text-center hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm">{num}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="py-10 sm:py-14 border-t border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Trusted by Pet Lovers</h2>
            <p className="text-sm sm:text-base text-gray-600">Hear from families who found their perfect companion</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {reviews.map((review) => (
              <div key={review.name} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200">
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.text}</p>
                <p className="font-bold text-gray-900 text-sm">{review.name}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[
              { icon: Truck, label: 'Safe Delivery', color: 'text-blue-600 bg-blue-50 border-blue-100' },
              { icon: CheckCircle, label: 'Verified Health', color: 'text-green-600 bg-green-50 border-green-100' },
              { icon: Stethoscope, label: 'Vet Approved', color: 'text-green-600 bg-green-50 border-green-100' },
              { icon: Shield, label: '100-Day Guarantee', color: 'text-blue-600 bg-blue-50 border-blue-100' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium ${color}`}>
                <Icon size={15} />{label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
