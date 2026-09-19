'use client';

import { ChevronRight, Clock, Heart, MapPin, PawPrint, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import FeatureDisabled from '@/components/FeatureDisabled';
import RescueRequestModal from '@/components/RescueRequestModal';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { supabase } from '@/lib/supabase';

export default function SheltersPage() {
  const { sheltersEnabled, loading: flagsLoading } = useFeatureFlags();
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShelters = async () => {
      const { data } = await supabase
        .from('shelters')
        .select('*, animals:shelter_animals(id)')
        .order('created_at', { ascending: false });
      setShelters(data || []);
      setLoading(false);
    };
    fetchShelters();
  }, []);

  if (!flagsLoading && !sheltersEnabled) {
    return <FeatureDisabled title="Shelters" />;
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 pt-6 pb-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-foreground">Animal Shelters</h1>
          <button
            onClick={() => setIsRescueModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-emergency text-emergency-foreground text-xs font-semibold btn-press flex items-center gap-1.5"
          >
            <TriangleAlert className="h-3.5 w-3.5" /> Rescue Request
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Adopt, donate, and support animal welfare
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading...</p>
        ) : shelters.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-bold text-foreground mb-2">No shelters found</h3>
            <p className="text-sm text-muted-foreground">
              Shelters will appear here once registered.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shelters.map((shelter) => (
              <Link
                key={shelter.id}
                href={`/shelter/${shelter.id}`}
                className="rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 btn-press cursor-pointer overflow-hidden group"
              >
                <div className="h-36 bg-muted overflow-hidden flex items-center justify-center">
                  {shelter.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={shelter.image_url}
                      alt={shelter.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <PawPrint className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground text-sm">{shelter.name}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-vitality/10 text-vitality shrink-0">
                      <Heart className="h-2.5 w-2.5" /> {shelter.animals?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {shelter.city}
                    </span>
                    {shelter.opening_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {shelter.opening_time} – {shelter.closing_time}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-primary font-medium">
                    <span className="flex items-center gap-1">
                      <PawPrint className="h-3 w-3" /> View Shelter
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <RescueRequestModal
        isOpen={isRescueModalOpen}
        onClose={() => setIsRescueModalOpen(false)}
      />
    </div>
  );
}
