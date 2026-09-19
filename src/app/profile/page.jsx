'use client';

import { User, MapPin, Phone, Mail, Calendar, ChevronRight, PawPrint, Edit, Heart, ShoppingBag, Shield, Settings, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, profile, isLoggedIn, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ pets: 0, appointments: 0, orders: 0 });

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchStats();
      fetchAppointments();
    }
  }, [user, loading, isLoggedIn]);

  const fetchStats = async () => {
    const [petsRes, appointmentsRes, ordersRes] = await Promise.all([
      supabase.from('pets').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('pet_owner_id', user.id),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('buyer_id', user.id),
    ]);
    setStats({
      pets: petsRes.count || 0,
      appointments: appointmentsRes.count || 0,
      orders: ordersRes.count || 0,
    });
  };

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*, vet:vet_profiles(*, user:profiles(full_name)), clinic:clinics(name), pet:pets(name)')
      .eq('pet_owner_id', user.id)
      .in('status', ['pending', 'confirmed'])
      .order('appointment_date', { ascending: true })
      .limit(5);
    setAppointments(data || []);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!isLoggedIn || !profile) return null;

  const menuItems = [
    { icon: PawPrint, label: 'My Pets', description: 'View and manage your pets', href: '/pets' },
    { icon: Edit, label: 'Edit Profile', description: 'Update your personal details', href: '/profile/edit' },
    { icon: Heart, label: 'Favorites', description: 'Saved vets, clinics & products', href: '/profile/favourites' },
    { icon: ShoppingBag, label: 'My Orders', description: 'Track your purchases', href: '/profile/orders' },
    { icon: Shield, label: 'Privacy & Security', description: 'Manage account security', href: '/profile/privacy' },
    { icon: Settings, label: 'Settings', description: 'App preferences', href: '/profile/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 max-w-3xl mx-auto py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Profile</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 text-emergency text-sm font-medium hover:opacity-90">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-3xl mx-auto py-6 sm:py-8">
        <div className="p-5 rounded-2xl bg-card shadow-card mb-4 sm:mb-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={32} className="text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">{profile.full_name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{profile.role.replace('_', ' ')}</p>
                  {profile.city && (
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mt-0.5">
                      <MapPin size={13} className="text-muted-foreground" />
                      <span>{profile.city}{profile.country ? `, ${profile.country}` : ''}</span>
                    </div>
                  )}
                </div>
                <Link href="/profile/edit" className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10 shrink-0">
                  <Edit size={18} className="text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { value: stats.pets, label: 'Pets' },
              { value: stats.appointments, label: 'Appointments' },
              { value: stats.orders, label: 'Orders' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-lg sm:text-xl font-bold text-foreground">{value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card shadow-card mb-4 sm:mb-5">
          <div className="space-y-3">
            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{profile.email}</span>
            </div>
          </div>
        </div>

        {appointments.length > 0 && (
          <div className="p-5 rounded-2xl bg-card shadow-card mb-4 sm:mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-foreground">Upcoming Appointments</h3>
            </div>
            <div className="space-y-3">
              {appointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className="w-full text-left flex items-center justify-between p-3 sm:p-4 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-bold text-foreground text-sm">{apt.reason || 'Appointment'}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.vet?.user?.full_name || 'Vet'} {apt.clinic ? `· ${apt.clinic.name}` : ''} · {apt.appointment_date}
                    </p>
                    {apt.pet && <p className="text-xs text-primary font-medium">Pet: {apt.pet.name}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-primary/10 text-primary">{apt.status}</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 sm:space-y-3">
          {menuItems.map(({ icon: Icon, label, description, href }) => (
            <Link key={label} href={href}
              className="flex items-center justify-between bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border hover:shadow-card-hover transition-all group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">{label}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground transition-colors flex-shrink-0 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>

      {selectedAppointment && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setSelectedAppointment(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-sm shadow-elevated">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-sm">{selectedAppointment.reason || 'Appointment'}</h2>
                    <p className="text-xs text-muted-foreground">{selectedAppointment.status}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAppointment(null)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                  <X size={20} className="text-foreground" />
                </button>
              </div>
              <div className="p-5">
                <div className="bg-muted rounded-xl p-4 mb-5 border border-border space-y-2.5">
                  {[
                    { label: 'Provider', value: selectedAppointment.vet?.user?.full_name || 'Vet' },
                    { label: 'Date', value: selectedAppointment.appointment_date },
                    { label: 'Time', value: selectedAppointment.appointment_time },
                    { label: 'Pet', value: selectedAppointment.pet?.name || 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setSelectedAppointment(null)} className="w-full bg-card hover:bg-muted text-foreground font-semibold py-3 rounded-xl transition-colors border border-border text-sm">Close</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
