'use client';

import { Users, CheckSquare, ShoppingBag, Flag, Ticket, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AdminOverviewPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVets: 0,
    pendingStores: 0,
    activeOrders: 0,
    openReports: 0,
    openTickets: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [
      usersRes, pendingVetsRes, pendingStoresRes,
      activeOrdersRes, openReportsRes, openTicketsRes,
      recentUsersRes, recentReportsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('vet_profiles').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('reports').select('id, reason, target_type, status, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      totalUsers: usersRes.count || 0,
      pendingVets: pendingVetsRes.count || 0,
      pendingStores: pendingStoresRes.count || 0,
      activeOrders: activeOrdersRes.count || 0,
      openReports: openReportsRes.count || 0,
      openTickets: openTicketsRes.count || 0,
    });
    setRecentUsers(recentUsersRes.data || []);
    setRecentReports(recentReportsRes.data || []);
    setLoading(false);
  };

  const roleColor = {
    admin: 'bg-red-50 text-red-600',
    veterinarian: 'bg-blue-50 text-blue-600',
    seller: 'bg-orange-50 text-orange-600',
    shelter: 'bg-green-50 text-green-600',
    company: 'bg-purple-50 text-purple-600',
    pet_owner: 'bg-gray-100 text-gray-600',
  };

  const kpiCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', href: '/admin-dashboard/users' },
    { label: 'Pending Vet Approvals', value: stats.pendingVets, icon: CheckSquare, color: stats.pendingVets > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600', href: '/admin-dashboard/approvals' },
    { label: 'Pending Store Approvals', value: stats.pendingStores, icon: TrendingUp, color: stats.pendingStores > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600', href: '/admin-dashboard/approvals' },
    { label: 'Pending Orders', value: stats.activeOrders, icon: ShoppingBag, color: 'bg-yellow-50 text-yellow-600', href: '/admin-dashboard/orders' },
    { label: 'Open Reports', value: stats.openReports, icon: Flag, color: stats.openReports > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600', href: '/admin-dashboard/reports' },
    { label: 'Open Tickets', value: stats.openTickets, icon: Ticket, color: stats.openTickets > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600', href: '/admin-dashboard/tickets' },
  ];

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-sm text-gray-600 mt-1">Welcome back, {profile?.full_name?.split(' ')[0]}. Here's the platform status.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {kpiCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Signups */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Signups</h3>
            <Link href="/admin-dashboard/users" className="text-xs text-red-600 hover:underline font-medium">View all</Link>
          </div>
          {recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                    {u.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${roleColor[u.role] || 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No recent signups</p>
          )}
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900">Recent Reports</h3>
            </div>
            <Link href="/admin-dashboard/reports" className="text-xs text-red-600 hover:underline font-medium">View all</Link>
          </div>
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                    <Flag size={14} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 capitalize">{r.reason?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500 capitalize">Target: {r.target_type}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    r.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                    r.status === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-6 justify-center">
              <Clock size={16} className="text-gray-400" />
              <p className="text-sm text-gray-500">No reports yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
