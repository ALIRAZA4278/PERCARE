'use client';

import { ArrowLeft, Clock, MapPin, MessageCircle, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const EMOJI = { dog: '🐕', cat: '🐈', bird: '🐦' };

export default function LostFoundDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      const { data } = await supabase
        .from('lost_found_pets')
        .select('*, reporter:profiles(full_name)')
        .eq('id', id)
        .single();
      setReport(data);
      setLoading(false);
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Report not found</p>
      </div>
    );
  }

  const isLost = report.type === 'lost';
  const emoji = EMOJI[(report.species || '').toLowerCase()] || '🐾';
  const phone = report.contact_phone || '';

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 py-4 flex items-center gap-3">
          <Link
            href="/lost-found"
            className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">
            {isLost ? 'Lost Pet' : 'Found Pet'}
          </h1>
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 space-y-4 max-w-lg">
        <div className="p-5 rounded-2xl bg-card shadow-card">
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isLost ? 'bg-emergency/10' : 'bg-vitality/10'
              }`}
            >
              <span className="text-3xl">{emoji}</span>
            </div>
            <div>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isLost ? 'bg-emergency/10 text-emergency' : 'bg-vitality/10 text-vitality'
                }`}
              >
                {report.type}
              </span>
              <h2 className="text-lg font-bold text-foreground mt-1">
                {report.pet_name || 'Unknown Pet'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {report.species}
                {report.breed ? ` · ${report.breed}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <p className="text-sm font-bold text-foreground">{report.color || '—'}</p>
              <p className="text-[10px] text-muted-foreground">Color</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <p className="text-sm font-bold text-foreground">{report.city || '—'}</p>
              <p className="text-[10px] text-muted-foreground">City</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card shadow-card">
          <h3 className="text-sm font-bold text-foreground mb-2">Details</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {report.last_seen_location}
            </span>
            {report.last_seen_date && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {report.last_seen_date}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card shadow-card">
          <h3 className="text-sm font-bold text-foreground mb-3">Reported By</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {report.reporter?.full_name || 'PetCare user'}
              </p>
              <p className="text-xs text-muted-foreground">
                {phone || report.contact_email || 'No contact provided'}
              </p>
            </div>
          </div>
        </div>

        {phone && (
          <div className="flex gap-3">
            <a
              href={`tel:${phone}`}
              className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-semibold btn-press transition-expo hover:opacity-90"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
            <a
              href={`https://wa.me/${phone.replace(/\s/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-12 rounded-xl border border-border bg-card flex items-center justify-center gap-2 text-sm font-semibold text-foreground btn-press transition-expo hover:bg-muted"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
