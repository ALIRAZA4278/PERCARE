'use client';

import { Search, Calendar, CheckCircle, Clock, X, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function VetAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [vetProfile, setVetProfile] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockData, setBlockData] = useState({ date: '', from: '', to: '', reason: '' });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: vp } = await supabase.from('vet_profiles').select('*').eq('user_id', user.id).single();
    setVetProfile(vp);
    if (!vp) { setLoading(false); return; }

    const { data } = await supabase
      .from('appointments')
      .select('*, pet:pets(name, species, breed), owner:profiles!pet_owner_id(full_name)')
      .eq('vet_id', vp.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    setAppointments(data || []);
    setLoading(false);
  };

  const handleAccept = async (aptId) => {
    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', aptId);
    setAppointments(appointments.map(a => a.id === aptId ? { ...a, status: 'confirmed' } : a));
  };

  const handleDecline = async (aptId) => {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', aptId);
    setAppointments(appointments.map(a => a.id === aptId ? { ...a, status: 'cancelled' } : a));
  };

  const handleBlockSlot = async () => {
    if (!blockData.date || !blockData.from || !blockData.to || !vetProfile) return;
    // Create a blocked appointment entry
    await supabase.from('appointments').insert({
      vet_id: vetProfile.id,
      pet_owner_id: user.id,
      appointment_date: blockData.date,
      appointment_time: blockData.from,
      status: 'cancelled',
      reason: `BLOCKED: ${blockData.reason || 'Time blocked'}`,
      notes: `Blocked until ${blockData.to}`,
    });
    setBlockData({ date: '', from: '', to: '', reason: '' });
    setShowBlockModal(false);
    fetchData();
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(a => a.appointment_date >= today && !['completed', 'cancelled'].includes(a.status));
  const past = appointments.filter(a => a.appointment_date < today || ['completed', 'cancelled'].includes(a.status));

  const filterAppointments = (list) => {
    let filtered = list;
    if (activeFilter === 'Confirmed') filtered = filtered.filter(a => a.status === 'confirmed');
    if (activeFilter === 'Pending') filtered = filtered.filter(a => a.status === 'pending');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.pet?.name?.toLowerCase().includes(q) ||
        a.owner?.full_name?.toLowerCase().includes(q) ||
        a.pet?.breed?.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const filteredUpcoming = filterAppointments(upcoming);
  const filteredPast = past;

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your upcoming and past appointments</p>
        </div>
        <button onClick={() => setShowBlockModal(true)}
          className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 self-start">
          <Calendar size={16} /> Block Time Slot
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by pet or owner..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground" />
        </div>
        <div className="flex items-center gap-2">
          {['All', 'Confirmed', 'Pending'].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeFilter === f ? 'bg-primary text-white' : 'bg-card text-foreground border border-border hover:bg-muted'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-border mb-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Upcoming ({filteredUpcoming.length})</h3>
        {filteredUpcoming.length > 0 ? (
          <div className="space-y-3">
            {filteredUpcoming.map((apt) => (
              <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border border-border hover:bg-muted transition-colors">
                <div className="flex-shrink-0 w-20">
                  <p className="text-sm font-bold text-foreground">{formatTime(apt.appointment_time)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(apt.appointment_date)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    <span className="text-primary">{apt.pet?.name || 'Pet'}</span>{' '}
                    <span className="text-muted-foreground">({apt.pet?.breed || apt.pet?.species || ''})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Owner: {apt.owner?.full_name || ''} · {apt.reason || 'Appointment'}</p>
                  {apt.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{apt.notes}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {apt.status === 'confirmed' ? (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-vitality/10 text-vitality flex items-center gap-1">
                      <CheckCircle size={12} /> Confirmed
                    </span>
                  ) : apt.status === 'pending' ? (
                    <>
                      <button onClick={() => handleAccept(apt.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border border-vitality/20 text-vitality hover:bg-vitality/10 flex items-center gap-1 transition-colors">
                        <CheckCircle size={12} /> Accept
                      </button>
                      <button onClick={() => handleDecline(apt.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border border-emergency/20 text-emergency hover:bg-emergency/10 flex items-center gap-1 transition-colors">
                        <X size={12} /> Decline
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-muted text-muted-foreground">{apt.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No upcoming appointments</p>
        )}
      </div>

      {/* Past Appointments */}
      {filteredPast.length > 0 && (
        <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Past Appointments</h3>
          <div className="space-y-3">
            {filteredPast.slice(0, 10).map((apt) => (
              <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    <span className="text-primary">{apt.pet?.name || 'Pet'}</span>{' '}
                    <span className="text-muted-foreground">({apt.pet?.breed || apt.pet?.species || ''})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{apt.owner?.full_name || ''} · {apt.reason || 'Appointment'} · {formatDate(apt.appointment_date)}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-center ${
                  apt.status === 'completed' ? 'bg-vitality/10 text-vitality' :
                  apt.status === 'cancelled' ? 'bg-emergency/10 text-emergency' :
                  'bg-muted text-muted-foreground'
                }`}>{apt.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block Time Slot Modal */}
      {showBlockModal && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setShowBlockModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-sm shadow-elevated">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Block Time Slot</h2>
                <button onClick={() => setShowBlockModal(false)} className="p-1 hover:bg-muted rounded-lg">
                  <X size={20} className="text-foreground" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
                  <input type="date" value={blockData.date} onChange={(e) => setBlockData({ ...blockData, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">From</label>
                    <input type="time" value={blockData.from} onChange={(e) => setBlockData({ ...blockData, from: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">To</label>
                    <input type="time" value={blockData.to} onChange={(e) => setBlockData({ ...blockData, to: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Reason (optional)</label>
                  <textarea value={blockData.reason} onChange={(e) => setBlockData({ ...blockData, reason: e.target.value })}
                    placeholder="e.g., Personal break, surgery..." rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleBlockSlot}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                    Block Slot
                  </button>
                  <button onClick={() => setShowBlockModal(false)}
                    className="px-4 py-2.5 bg-card hover:bg-muted text-foreground font-medium rounded-lg transition-colors border border-border text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
