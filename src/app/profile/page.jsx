'use client';

import { User, MapPin, Phone, Mail, Calendar, ChevronRight, PawPrint, Edit, Heart, ShoppingBag, Shield, Settings, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const profile = {
    name: 'Rabah Bin Muhammad',
    role: 'Pet Owner',
    city: 'Lahore, Pakistan',
    phone: '+92 300 1234567',
    email: 'rabah@example.com',
    stats: { pets: 3, appointments: 12, orders: 8 },
  };

  const appointments = [
    { id: 1, title: 'Rabies Vaccination', provider: 'Dr. Arsalan Khan', date: 'Mar 25, 2026', pet: 'Buddy', status: 'upcoming' },
    { id: 2, title: 'General Checkup', provider: 'PetCare Central Clinic', date: 'Apr 2, 2026', pet: 'Whiskers', status: 'upcoming' },
  ];

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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={32} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-sm text-gray-600">{profile.role}</p>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mt-0.5">
                    <MapPin size={13} className="text-gray-400" />
                    <span>{profile.city}</span>
                  </div>
                </div>
                <Link href="/profile/edit" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                  <Edit size={18} className="text-gray-500" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: profile.stats.pets, label: 'Pets' },
              { value: profile.stats.appointments, label: 'Appointments' },
              { value: profile.stats.orders, label: 'Orders' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                <p className="text-lg sm:text-xl font-bold text-gray-900">{value}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{profile.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{profile.email}</span>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
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
                  <p className="font-bold text-gray-900 text-sm">{apt.title}</p>
                  <p className="text-xs text-gray-600">{apt.provider} · {apt.date}</p>
                  <p className="text-xs text-blue-600 font-medium">Pet: {apt.pet}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-blue-50 text-blue-700">{apt.status}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 sm:space-y-3">
          {menuItems.map(({ icon: Icon, label, description, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-all group"
            >
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

      {/* Appointment Detail Modal */}
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
                    <h2 className="font-bold text-gray-900 text-sm">{selectedAppointment.title}</h2>
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
                    { label: 'Provider', value: selectedAppointment.provider },
                    { label: 'Date', value: selectedAppointment.date },
                    { label: 'Pet', value: selectedAppointment.pet },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">View Provider</button>
                  <button onClick={() => setSelectedAppointment(null)} className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors border border-gray-200 text-sm">Close</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
