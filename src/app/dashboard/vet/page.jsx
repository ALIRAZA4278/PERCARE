'use client';

import { Calendar, Users, DollarSign, Star, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function VetDashboardPage() {
  const { user, profile } = useAuth();
  const [vetProfile, setVetProfile] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [stats, setStats] = useState({ todayCount: 0, activePatients: 0, revenue: 0, rating: 0 });
  const [pendingActions, setPendingActions] = useState({ pendingAppointments: 0, vaccineReminders: 0, pendingReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    // Get vet profile
    const { data: vp } = await supabase
      .from('vet_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setVetProfile(vp);

    if (!vp) { setLoading(false); return; }

    const today = new Date().toISOString().split('T')[0];

    // Fetch all data in parallel
    const [todayAptsRes, allAptsRes, pendingAptsRes, recentAptsRes] = await Promise.all([
      // Today's appointments
      supabase.from('appointments')
        .select('*, pet:pets(name, species, breed), owner:profiles!pet_owner_id(full_name)')
        .eq('vet_id', vp.id)
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true }),
      // Total unique patients (only confirmed/completed, exclude vet's own id)
      supabase.from('appointments')
        .select('pet_owner_id, fee')
        .eq('vet_id', vp.id)
        .in('status', ['confirmed', 'completed'])
        .neq('pet_owner_id', user.id),
      // Pending appointments
      supabase.from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('vet_id', vp.id)
        .eq('status', 'pending'),
      // Recent patients (completed appointments)
      supabase.from('appointments')
        .select('*, pet:pets(name, species, breed), owner:profiles!pet_owner_id(full_name)')
        .eq('vet_id', vp.id)
        .eq('status', 'completed')
        .order('appointment_date', { ascending: false })
        .limit(5),
    ]);

    setTodayAppointments(todayAptsRes.data || []);
    setRecentPatients(recentAptsRes.data || []);

    // Calculate revenue from completed appointments
    const completedApts = (allAptsRes.data || []);
    const uniquePatients = new Set(completedApts.map(a => a.pet_owner_id)).size;
    const revenue = completedApts.reduce((sum, a) => sum + (a.fee || 0), 0);

    setStats({
      todayCount: (todayAptsRes.data || []).length,
      activePatients: uniquePatients,
      revenue,
      rating: vp.rating || 0,
    });

    setPendingActions({
      pendingAppointments: pendingAptsRes.count || 0,
      vaccineReminders: 0,
      pendingReviews: 0,
    });

    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!vetProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🩺</div>
          <h2 className="text-xl font-bold text-foreground mb-2">Set Up Your Vet Profile</h2>
          <p className="text-muted-foreground mb-6">Complete your professional profile to start using the dashboard.</p>
          <Link href="/dashboard/vet/profile" className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg btn-press transition-expo text-sm">
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {getGreeting()}, {profile?.full_name?.split(' ')[0]}! 🩺
          </h1>
          <p className="text-sm text-muted-foreground mt-1">You have {stats.todayCount} appointment{stats.todayCount !== 1 ? 's' : ''} today</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/vet/appointments"
            className="bg-card border border-border hover:bg-muted text-foreground font-medium px-4 py-2 rounded-lg transition-colors text-sm">
            View Schedule
          </Link>
          <button className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg btn-press transition-expo text-sm">
            Accept Walk-in
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { icon: Calendar, label: "Today's Appointments", value: stats.todayCount, color: 'bg-primary/10 text-primary' },
          { icon: Users, label: 'Active Patients', value: stats.activePatients, color: 'bg-vitality/10 text-vitality' },
          { icon: DollarSign, label: 'This Month Revenue', value: `Rs. ${(stats.revenue / 1000).toFixed(0)}K`, color: 'bg-amber/10 text-amber' },
          { icon: Star, label: 'Avg. Rating', value: stats.rating || '—', color: 'bg-primary/10 text-primary' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl sm:rounded-2xl bg-card shadow-card p-4 sm:p-5">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Today's Schedule + Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-3 rounded-xl sm:rounded-2xl bg-card shadow-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Today's Schedule</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
              {stats.todayCount} appointments
            </span>
          </div>
          {todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-3 sm:p-4 rounded-xl border border-border hover:bg-muted transition-colors">
                  <div className="text-center flex-shrink-0 w-14">
                    <p className="text-sm font-bold text-foreground">{formatTime(apt.appointment_time)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">
                      {apt.pet?.name || 'Pet'} ({apt.pet?.breed || apt.pet?.species || ''})
                    </p>
                    <p className="text-xs text-muted-foreground">{apt.owner?.full_name || 'Owner'} · {apt.reason || 'Appointment'}</p>
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    apt.status === 'confirmed' ? 'bg-vitality/10 text-vitality' : 'bg-amber/10 text-amber'
                  }`}>
                    {apt.status === 'confirmed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                    {apt.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No appointments scheduled for today</p>
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="lg:col-span-2 rounded-xl sm:rounded-2xl bg-card shadow-card p-5 sm:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Recent Patients</h3>
          {recentPatients.length > 0 ? (
            <div className="space-y-4">
              {recentPatients.map((apt) => (
                <div key={apt.id} className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{apt.pet?.name || 'Pet'}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.pet?.breed || apt.pet?.species || ''} · Owner: {apt.owner?.full_name || ''}
                    </p>
                    <p className="text-xs text-muted-foreground">Last visit: {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-vitality/10 text-vitality">Healthy</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">No recent patients</p>
          )}
        </div>
      </div>

      {/* Pending Actions + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Pending Actions */}
        <div className="rounded-xl sm:rounded-2xl bg-card shadow-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-amber" />
            <h3 className="text-lg font-bold text-foreground">Pending Actions</h3>
          </div>
          <div className="space-y-3">
            {pendingActions.pendingAppointments > 0 && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="w-2 h-2 rounded-full bg-amber" />
                {pendingActions.pendingAppointments} appointment request{pendingActions.pendingAppointments > 1 ? 's' : ''} need approval
              </div>
            )}
            {pendingActions.vaccineReminders > 0 && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="w-2 h-2 rounded-full bg-primary btn-press transition-expo" />
                {pendingActions.vaccineReminders} vaccination reminder{pendingActions.vaccineReminders > 1 ? 's' : ''} to send
              </div>
            )}
            {pendingActions.pendingReviews > 0 && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="w-2 h-2 rounded-full bg-vitality btn-press transition-expo" />
                {pendingActions.pendingReviews} review request{pendingActions.pendingReviews > 1 ? 's' : ''} pending
              </div>
            )}
            {pendingActions.pendingAppointments === 0 && pendingActions.vaccineReminders === 0 && pendingActions.pendingReviews === 0 && (
              <p className="text-sm text-muted-foreground">No pending actions</p>
            )}
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-xl sm:rounded-2xl bg-card shadow-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary" />
            <h3 className="text-lg font-bold text-foreground">Performance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-xl p-4 text-center border border-border">
              <p className="text-2xl font-bold text-foreground">{stats.activePatients}</p>
              <p className="text-xs text-muted-foreground">Total Patients</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center border border-border">
              <p className="text-2xl font-bold text-foreground">{stats.rating ? `${((stats.rating / 5) * 100).toFixed(0)}%` : '—'}</p>
              <p className="text-xs text-muted-foreground">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
