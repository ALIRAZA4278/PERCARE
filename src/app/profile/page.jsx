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
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!isLoggedIn || !profile) return null;

  const menuItems = [
    { icon: PawPrint, label: 'My Pets', description: 'View and manage your pets', href: '/my-pets' },
    { icon: Edit, label: 'Edit Profile', description: 'Update your personal details', href: '/profile/edit' },
    { icon: Heart, label: 'Favorites', description: 'Saved vets, clinics & products', href: '/profile/favourites' },
    { icon: ShoppingBag, label: 'My Orders', description: 'Track your purchases', href: '/profile/orders' },
    { icon: Shield, label: 'Privacy & Security', description: 'Manage account security', href: '/profile/privacy' },
    { icon: Settings, label: 'Settings', description: 'App preferences', href: '/profile/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={32} className="text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                  <p className="text-sm text-gray-600 capitalize">{profile.role.replace('_', ' ')}</p>
                  {profile.city && (
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mt-0.5">
                      <MapPin size={13} className="text-gray-400" />
                      <span>{profile.city}{profile.country ? `, ${profile.country}` : ''}</span>
                    </div>
                  )}
                </div>
                <Link href="/profile/edit" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                  <Edit size={18} className="text-gray-500" />
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
              <div key={label} className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                <p className="text-lg sm:text-xl font-bold text-gray-900">{value}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="space-y-3">
            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{profile.email}</span>
            </div>
          </div>
        </div>

        {appointments.length > 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Upcoming Appointments</h3>
            </div>
            <div className="space-y-3">
              {appointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className="w-full text-left flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{apt.reason || 'Appointment'}</p>
                    <p className="text-xs text-gray-600">
                      {apt.vet?.user?.full_name || 'Vet'} {apt.clinic ? `· ${apt.clinic.name}` : ''} · {apt.appointment_date}
                    </p>
                    {apt.pet && <p className="text-xs text-blue-600 font-medium">Pet: {apt.pet.name}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-blue-50 text-blue-700">{apt.status}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 sm:space-y-3">
          {menuItems.map(({ icon: Icon, label, description, href }) => (
            <Link key={label} href={href}
              className="flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                  <Icon size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">{label}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{description}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {selectedAppointment && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedAppointment(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">{selectedAppointment.reason || 'Appointment'}</h2>
                    <p className="text-xs text-gray-500">{selectedAppointment.status}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAppointment(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={20} className="text-gray-700" />
                </button>
              </div>
              <div className="p-5">
                <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100 space-y-2.5">
                  {[
                    { label: 'Provider', value: selectedAppointment.vet?.user?.full_name || 'Vet' },
                    { label: 'Date', value: selectedAppointment.appointment_date },
                    { label: 'Time', value: selectedAppointment.appointment_time },
                    { label: 'Pet', value: selectedAppointment.pet?.name || 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setSelectedAppointment(null)} className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors border border-gray-200 text-sm">Close</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
