'use client';

import { PawPrint, Heart, HandHeart, CheckCircle, Plus, Eye, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ShelterOverviewPage() {
  const { user, profile } = useAuth();
  const [shelter, setShelter] = useState(null);
  const [stats, setStats] = useState({ animals: 0, adoptionRequests: 0, donationsMonth: 0, adoptedMonth: 0 });
  const [expenseGoal, setExpenseGoal] = useState({ spent: 0, goal: 0 });
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: s } = await supabase.from('shelters').select('*').eq('owner_id', user.id).single();
    setShelter(s);
    if (!s) { setLoading(false); return; }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      { count: animalCount },
      { data: requests },
      { data: donationsData },
      { data: adoptedData },
      { data: expenseData },
    ] = await Promise.all([
      supabase.from('shelter_animals').select('*', { count: 'exact', head: true }).eq('shelter_id', s.id).eq('adoption_status', 'available'),
      supabase.from('adoption_requests').select('*, adopter:profiles!requester_id(full_name, email), animal:shelter_animals(name, species, breed)').eq('shelter_id', s.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
      supabase.from('donations').select('*, donor:profiles(full_name)').eq('shelter_id', s.id).gte('created_at', startOfMonth).order('created_at', { ascending: false }).limit(5),
      supabase.from('adoption_requests').select('*', { count: 'exact', head: true }).eq('shelter_id', s.id).eq('status', 'approved').gte('updated_at', startOfMonth),
      supabase.from('shelter_expenses').select('amount').eq('shelter_id', s.id).gte('created_at', startOfMonth),
    ]);

    const monthlyDonationTotal = (donationsData || []).reduce((sum, d) => sum + (d.amount || 0), 0);
    const monthlyExpenses = (expenseData || []).reduce((sum, e) => sum + (e.amount || 0), 0);

    setStats({
      animals: animalCount || 0,
      adoptionRequests: (requests || []).length,
      donationsMonth: monthlyDonationTotal,
      adoptedMonth: adoptedData?.count || 0,
    });

    setExpenseGoal({ spent: monthlyExpenses, goal: s.monthly_expense_goal || 50000 });
    setAdoptionRequests(requests || []);
    setDonations(donationsData || []);
    setLoading(false);
  };

  const handleRequest = async (id, status) => {
    await supabase.from('adoption_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setAdoptionRequests(adoptionRequests.filter(r => r.id !== id));
    if (status === 'approved') setStats(s => ({ ...s, adoptionRequests: s.adoptionRequests - 1, adoptedMonth: s.adoptedMonth + 1 }));
    else setStats(s => ({ ...s, adoptionRequests: s.adoptionRequests - 1 }));
  };

  const formatK = (n) => n >= 1000 ? `Rs. ${(n / 1000).toFixed(1)}K` : `Rs. ${n}`;
  const getTimeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const progressPct = expenseGoal.goal > 0 ? Math.min((expenseGoal.spent / expenseGoal.goal) * 100, 100) : 0;

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  if (!shelter) return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Shelter Profile</h3>
        <p className="text-gray-600 mb-4">Set up your shelter profile to get started.</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome, {shelter.name}!</h1>
          <p className="text-sm text-gray-600 mt-1">Here's what's happening at your shelter today</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/shelter-dashboard/intake"
            className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
            <Plus size={16} /> New Intake
          </Link>
          <Link href="/shelter-dashboard/adoptions"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
            <Eye size={16} /> View Requests
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { icon: PawPrint, label: 'Animals in Care', value: stats.animals, iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
          { icon: Heart, label: 'Adoption Requests', value: stats.adoptionRequests, iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
          { icon: HandHeart, label: 'Donations (Month)', value: formatK(stats.donationsMonth), iconBg: 'bg-green-50', iconColor: 'text-green-600' },
          { icon: CheckCircle, label: 'Adopted This Month', value: stats.adoptedMonth, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
        ].map(({ icon: Icon, label, value, iconBg, iconColor }) => (
          <div key={label} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={iconColor} />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs sm:text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Expense Goal */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">Monthly Expense Goal</h3>
          <span className="text-sm font-semibold text-gray-700">{progressPct.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progressPct}%`,
              background: progressPct >= 80 ? '#22c55e' : 'linear-gradient(to right, #3b82f6, #22c55e)',
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Spent: {formatK(expenseGoal.spent)}</span>
          <span className="text-sm text-gray-600">Goal: {formatK(expenseGoal.goal)}</span>
        </div>
      </div>

      {/* Two-column: Adoption Requests + Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Adoption Requests */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Adoption Requests</h3>
            <Link href="/shelter-dashboard/adoptions" className="text-sm text-teal-600 hover:text-teal-700 font-medium">View all</Link>
          </div>
          {adoptionRequests.length > 0 ? (
            <div className="space-y-3">
              {adoptionRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-sm shrink-0">
                      {req.adopter?.full_name?.charAt(0) || 'A'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{req.adopter?.full_name || 'Adopter'}</p>
                      <p className="text-xs text-gray-500 truncate">{req.animal?.name} · {req.animal?.species}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleRequest(req.id, 'approved')}
                      className="w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg flex items-center justify-center transition-colors">
                      <Check size={15} />
                    </button>
                    <button onClick={() => handleRequest(req.id, 'rejected')}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors">
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No pending adoption requests</p>
          )}
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Recent Donations</h3>
            <Link href="/shelter-dashboard/donations" className="text-sm text-teal-600 hover:text-teal-700 font-medium">View all</Link>
          </div>
          {donations.length > 0 ? (
            <div className="space-y-3">
              {donations.map((don) => (
                <div key={don.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm shrink-0">
                      {don.donor?.full_name?.charAt(0) || don.donor_name?.charAt(0) || 'D'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{don.donor?.full_name || don.donor_name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{don.donation_type || 'One-time'} · {getTimeAgo(don.created_at)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 text-sm shrink-0">Rs. {(don.amount || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No donations this month</p>
          )}
        </div>
      </div>
    </div>
  );
}
