'use client';

import { Users, CheckSquare, ShoppingBag, Flag, Ticket, TrendingUp, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AdminOverviewPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, pendingVets: 0, pendingStores: 0, activeOrders: 0, openReports: 0, openTickets: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [usersRes, pendingVetsRes, pendingStoresRes, activeOrdersRes, openReportsRes, openTicketsRes, recentUsersRes, recentReportsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('vet_profiles').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('reports').select('id, reason, target_type, status, created_at').order('created_at', { ascending: false }).limit(5),
    ]);
    setStats({ totalUsers: usersRes.count || 0, pendingVets: pendingVetsRes.count || 0, pendingStores: pendingStoresRes.count || 0, activeOrders: activeOrdersRes.count || 0, openReports: openReportsRes.count || 0, openTickets: openTicketsRes.count || 0 });
    setRecentUsers(recentUsersRes.data || []);
    setRecentReports(recentReportsRes.data || []);
    setLoading(false);
  };

  const roleColor = { admin: 'bg-red-900 text-red-400', veterinarian: 'bg-blue-900 text-blue-400', seller: 'bg-orange-900 text-orange-400', shelter: 'bg-green-900 text-green-400', company: 'bg-purple-900 text-purple-400', pet_owner: 'bg-gray-800 text-gray-400' };

  const kpiCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-950', href: '/admin/users' },
    { label: 'Pending Vet Approvals', value: stats.pendingVets, icon: CheckSquare, color: stats.pendingVets > 0 ? 'text-red-400' : 'text-green-400', bg: stats.pendingVets > 0 ? 'bg-red-950' : 'bg-green-950', href: '/admin/approvals' },
    { label: 'Pending Store Approvals', value: stats.pendingStores, icon: TrendingUp, color: stats.pendingStores > 0 ? 'text-orange-400' : 'text-green-400', bg: stats.pendingStores > 0 ? 'bg-orange-950' : 'bg-green-950', href: '/admin/approvals' },
    { label: 'Pending Orders', value: stats.activeOrders, icon: ShoppingBag, color: 'text-yellow-400', bg: 'bg-yellow-950', href: '/admin/orders' },
    { label: 'Open Reports', value: stats.openReports, icon: Flag, color: stats.openReports > 0 ? 'text-red-400' : 'text-green-400', bg: stats.openReports > 0 ? 'bg-red-950' : 'bg-green-950', href: '/admin/reports' },
    { label: 'Open Tickets', value: stats.openTickets, icon: Ticket, color: stats.openTickets > 0 ? 'text-orange-400' : 'text-green-400', bg: stats.openTickets > 0 ? 'bg-orange-950' : 'bg-green-950', href: '/admin/tickets' },
  ];

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {profile?.full_name?.split(' ')[0]}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {kpiCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-800 hover:border-gray-600 transition-all">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Signups</h3>
            <Link href="/admin/users" className="text-xs text-red-500 hover:text-red-400 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length === 0 ? <p className="text-gray-600 text-sm text-center py-4">No users yet</p> : recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 font-bold text-sm shrink-0">{u.full_name?.charAt(0) || '?'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{u.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${roleColor[u.role] || 'bg-gray-800 text-gray-400'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-400" />
              <h3 className="text-lg font-bold text-white">Recent Reports</h3>
            </div>
            <Link href="/admin/reports" className="text-xs text-red-500 hover:text-red-400 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentReports.length === 0 ? <p className="text-gray-600 text-sm text-center py-4">No reports yet</p> : recentReports.map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-950 rounded-full flex items-center justify-center shrink-0">
                  <Flag size={14} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white capitalize">{r.reason?.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500 capitalize">Target: {r.target_type}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${r.status === 'pending' ? 'bg-orange-950 text-orange-400' : 'bg-green-950 text-green-400'}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
