'use client';

import { Clock, MapPin, Phone, Plus, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReportPetModal from '@/components/ReportPetModal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const FILTERS = ['All', 'Lost', 'Found'];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function LostAndFoundPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    const { data } = await supabase
      .from('lost_found_pets')
      .select('*, reporter:profiles(full_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmitReport = async (formData) => {
    if (!user) return;
    const { error } = await supabase.from('lost_found_pets').insert({
      reporter_id: user.id,
      type: formData.type,
      pet_name: formData.pet_name,
      species: formData.species,
      breed: formData.breed || null,
      color: formData.color || null,
      last_seen_location: formData.last_seen_location,
      last_seen_date: formData.last_seen_date || null,
      city: formData.city,
      contact_phone: formData.contact_phone,
      contact_email: formData.contact_email || null,
      description: formData.description,
    });
    if (error) throw error;
    fetchReports();
  };

  const filteredReports =
    activeFilter === 'All'
      ? reports
      : reports.filter((r) => r.type === activeFilter.toLowerCase());

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">Lost &amp; Found</h1>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold btn-press transition-expo hover:opacity-90 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Report
            </button>
          </div>

          <div className="flex gap-2">
            {FILTERS.map((name) => (
              <button
                key={name}
                onClick={() => setActiveFilter(name)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold btn-press transition-expo ${
                  activeFilter === name
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading...</p>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-foreground mb-2">No reports found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Try changing your filter or report a pet.
            </p>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold btn-press transition-expo hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Report a Pet
            </button>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isLost = report.type === 'lost';
            return (
              <Link
                key={report.id}
                href={`/lost-found/${report.id}`}
                className="block p-4 rounded-2xl bg-card shadow-card btn-press hover:shadow-card-hover transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isLost ? 'bg-emergency/10' : 'bg-vitality/10'
                    }`}
                  >
                    <TriangleAlert
                      className={`h-5 w-5 ${isLost ? 'text-emergency' : 'text-vitality'}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isLost
                            ? 'bg-emergency/10 text-emergency'
                            : 'bg-vitality/10 text-vitality'
                        }`}
                      >
                        {report.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {report.species}
                        {report.breed ? ` · ${report.breed}` : ''}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-foreground">
                      {report.pet_name || 'Unknown Pet'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{report.description}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {report.last_seen_location}
                        {report.city ? `, ${report.city}` : ''}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(report.created_at)}
                      </span>
                    </div>

                    {report.contact_phone && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(`tel:${report.contact_phone}`);
                        }}
                        className="mt-3 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold btn-press transition-expo hover:opacity-90 flex items-center gap-1.5"
                      >
                        <Phone className="h-3 w-3" />
                        Contact
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <ReportPetModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
}
