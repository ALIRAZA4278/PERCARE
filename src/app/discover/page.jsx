'use client';

import { Clock, MapPin, Search, Shield, SlidersHorizontal, Star, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const FILTERS = ['All', 'Vets', 'Clinics', 'Hospitals'];

const FILTER_TYPE = {
  Vets: 'vet',
  Clinics: 'clinic',
  Hospitals: 'hospital',
};

function initial(name) {
  const last = name.trim().split(' ').filter(Boolean).slice(-1)[0];
  return last ? last[0].toUpperCase() : '?';
}

function DiscoverList() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [filter, setFilter] = useState('All');
  const [vets, setVets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [vetsRes, clinicsRes] = await Promise.all([
        supabase
          .from('vet_profiles')
          .select('*, user:profiles(full_name, avatar_url, city, is_verified)'),
        supabase.from('clinics').select('*'),
      ]);
      setVets(vetsRes.data || []);
      setClinics(clinicsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const allItems = [
    ...vets.map((v) => ({
      id: v.id,
      type: 'vet',
      name: v.user?.full_name || 'Veterinarian',
      specialization: v.specialization || 'General Veterinarian',
      location: v.user?.city || 'Unknown',
      clinic: v.qualification || '',
      rating: v.rating || 0,
      reviews: v.total_reviews || 0,
      available: v.is_available,
      verified: !!v.user?.is_verified,
      emergency: false,
      href: `/vet/${v.id}`,
    })),
    ...clinics.map((c) => ({
      id: c.id,
      type: c.is_emergency_available ? 'hospital' : 'clinic',
      name: c.name,
      specialization: c.is_emergency_available
        ? 'Emergency & General Care'
        : 'Veterinary Clinic',
      location: c.city || 'Unknown',
      clinic: c.address || '',
      rating: c.rating || 0,
      reviews: c.total_reviews || 0,
      available: true,
      verified: !!c.is_approved,
      emergency: c.is_emergency_available,
      href: `/clinic/${c.id}`,
    })),
  ];

  const filtered = allItems.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.specialization.toLowerCase().includes(q) ||
      item.clinic.toLowerCase().includes(q);
    const matchesFilter = filter === 'All' || item.type === FILTER_TYPE[filter];
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 py-4">
          <h1 className="text-xl font-bold text-foreground mb-3">Discover Vets</h1>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, specialization..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-expo"
              />
            </div>
            <button
              type="button"
              aria-label="Filters"
              className="h-11 w-11 rounded-xl bg-card border border-border flex items-center justify-center btn-press transition-expo hover:bg-muted"
            >
              <SlidersHorizontal className="h-4 w-4 text-foreground" />
            </button>
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {FILTERS.map((name) => (
              <button
                key={name}
                onClick={() => setFilter(name)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold btn-press transition-expo ${
                  filter === name
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {name}
              </button>
            ))}
            <Link
              href="/lost-found"
              className="ml-auto shrink-0 px-4 py-2 rounded-xl bg-emergency text-emergency-foreground text-xs font-semibold btn-press transition-expo hover:opacity-90 flex items-center gap-1.5"
            >
              <TriangleAlert className="h-3.5 w-3.5" /> Emergency
            </Link>
          </div>
        </div>
      </div>

      <div className="h-48 md:h-64 bg-muted flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Map view coming soon</p>
        </div>
      </div>

      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> results found
            near you
          </p>
          <button type="button" className="text-xs font-medium text-primary btn-press">
            Sort by distance
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-foreground mb-2">No results found</h3>
            <p className="text-sm text-muted-foreground">Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="group block p-4 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 btn-press cursor-pointer"
              >
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-muted-foreground">
                      {initial(item.name)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-sm text-foreground">{item.name}</h3>
                          {item.verified && <Shield className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{item.specialization}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-3.5 w-3.5 text-amber fill-amber" />
                        <span className="text-xs font-semibold text-foreground">{item.rating}</span>
                        <span className="text-xs text-muted-foreground">({item.reviews})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 min-w-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </span>
                      {item.clinic && (
                        <span className="text-xs text-muted-foreground truncate min-w-0">
                          {item.clinic}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                            item.available
                              ? 'bg-vitality/10 text-vitality'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                        {item.emergency && (
                          <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-emergency/10 text-emergency">
                            24/7
                          </span>
                        )}
                      </div>
                      <span className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center btn-press transition-expo hover:opacity-90">
                        {item.type === 'vet' ? 'Book' : 'View'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverList />
    </Suspense>
  );
}
