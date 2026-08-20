'use client';

import { Users, CheckSquare, ShoppingBag, Flag, Ticket, TrendingUp, AlertCircle, Stethoscope, Store, Home, Package, PawPrint, Star, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const roleBadge = {
  admin: 'bg-red-100 text-red-700',
  veterinarian: 'bg-blue-100 text-blue-700',
  seller: 'bg-orange-100 text-orange-700',
  shelter: 'bg-green-100 text-green-700',
  company: 'bg-purple-100 text-purple-700',
  pet_owner: 'bg-gray-100 text-gray-600',
};

export default function AdminOverviewPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0, totalVets: 0, pendingVets: 0,
    totalStores: 0, pendingStores: 0, totalShelters: 0,
    totalProducts: 0, pendingProducts: 0, totalPets: 0,
    totalOrders: 0, pendingOrders: 0, totalRevenue: 0,
    openReports: 0, openTickets: 0, totalReviews: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [
      usersRes, vetsRes, pendingVetsRes,
      storesRes, pendingStoresRes, sheltersRes,
      productsRes, pendingProductsRes, petsRes,
      ordersRes, pendingOrdersRes, revenueRes,
      openReportsRes, openTicketsRes, reviewsRes,
      recentUsersRes, recentOrdersRes, recentReportsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('vet_profiles').select('id', { count: 'exact', head: true }).eq('is_approved', true),
      supabase.from('vet_profiles').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_approved', true),
      supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('shelters').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_approved', false).eq('is_active', true),
      supabase.from('pets').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('total_amount'),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('orders').select('id, total_amount, status, created_at, buyer:profiles!buyer_id(full_name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('reports').select('id, reason, target_type, status, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    const revenue = (revenueRes.data || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    setStats({
      totalUsers: usersRes.count || 0,
      totalVets: vetsRes.count || 0, pendingVets: pendingVetsRes.count || 0,
      totalStores: storesRes.count || 0, pendingStores: pendingStoresRes.count || 0,
      totalShelters: sheltersRes.count || 0,
      totalProducts: productsRes.count || 0, pendingProducts: pendingProductsRes.count || 0,
      totalPets: petsRes.count || 0,
      totalOrders: ordersRes.count || 0, pendingOrders: pendingOrdersRes.count || 0,
      totalRevenue: revenue,
      openReports: openReportsRes.count || 0,
      openTickets: openTicketsRes.count || 0,
      totalReviews: reviewsRes.count || 0,
    });
    setRecentUsers(recentUsersRes.data || []);
    setRecentOrders(recentOrdersRes.data || []);
    setRecentReports(recentReportsRes.data || []);
    setLoading(false);
  };

  const kpi1 = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/users' },
    { label: 'Active Vets', value: stats.totalVets, icon: Stethoscope, color: 'text-cyan-600', bg: 'bg-cyan-50', href: '/admin/vets', sub: stats.pendingVets > 0 ? `${stats.pendingVets} pending approval` : null },
    { label: 'Active Stores', value: stats.totalStores, icon: Store, color: 'text-orange-600', bg: 'bg-orange-50', href: '/admin/stores', sub: stats.pendingStores > 0 ? `${stats.pendingStores} pending approval` : null },
    { label: 'Shelters', value: stats.totalShelters, icon: Home, color: 'text-green-600', bg: 'bg-green-50', href: '/admin/shelters' },
    { label: 'Active Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/products', sub: stats.pendingProducts > 0 ? `${stats.pendingProducts} pending approval` : null },
    { label: 'Pets Listed', value: stats.totalPets, icon: PawPrint, color: 'text-pink-600', bg: 'bg-pink-50', href: '/admin/pets' },
  ];

  const kpi2 = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-yellow-600', bg: 'bg-yellow-50', href: '/admin/orders', sub: stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : null },
    { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/admin/orders' },
    { label: 'Open Reports', value: stats.openReports, icon: Flag, color: stats.openReports > 0 ? 'text-red-600' : 'text-green-600', bg: stats.openReports > 0 ? 'bg-red-50' : 'bg-green-50', href: '/admin/reports' },
    { label: 'Open Tickets', value: stats.openTickets, icon: Ticket, color: stats.openTickets > 0 ? 'text-orange-600' : 'text-green-600', bg: stats.openTickets > 0 ? 'bg-orange-50' : 'bg-green-50', href: '/admin/tickets' },
    { label: 'Pending Approvals', value: stats.pendingVets + stats.pendingStores + stats.pendingProducts, icon: CheckSquare, color: (stats.pendingVets + stats.pendingStores + stats.pendingProducts) > 0 ? 'text-red-600' : 'text-green-600', bg: (stats.pendingVets + stats.pendingStores + stats.pendingProducts) > 0 ? 'bg-red-50' : 'bg-green-50', href: '/admin/approvals' },
    { label: 'Total Reviews', value: stats.totalReviews, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', href: '/admin/reviews' },
  ];

  const orderStatusBadge = { pending: 'bg-orange-100 text-orange-700', confirmed: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

  if (loading) return (
    <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-500">
        <Activity size={20} className="animate-pulse" />
        <span className="text-sm">Loading dashboard...</span>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {profile?.full_name?.split(' ')[0]} — FluffyNest at a glance</p>
      </div>

      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Platform</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-7">
        {kpi1.map(({ label, value, icon: Icon, color, bg, href, sub }) => (
          <Link key={label} href={href}
            className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-gray-300 transition-all">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={17} className={color} />
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-orange-600 mt-1 font-semibold">{sub}</p>}
          </Link>
        ))}
      </div>

      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Operations</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {kpi2.map(({ label, value, icon: Icon, color, bg, href, sub }) => (
          <Link key={label} href={href}
            className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-gray-300 transition-all">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={17} className={color} />
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${color} ${typeof value === 'string' && value.length > 8 ? 'text-lg sm:text-xl' : ''}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-orange-600 mt-1 font-semibold">{sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Recent Signups</h3>
            <Link href="/admin/users" className="text-xs text-red-500 hover:text-red-600 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length === 0
              ? <p className="text-gray-600 text-xs text-center py-4">No users yet</p>
              : recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">
                    {u.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{u.full_name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${roleBadge[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-red-500 hover:text-red-600 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0
              ? <p className="text-gray-600 text-xs text-center py-4">No orders yet</p>
              : recentOrders.map(o => (
                <div key={o.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <ShoppingBag size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{o.buyer?.full_name || '—'}</p>
                    <p className="text-[10px] text-gray-500">Rs. {Number(o.total_amount || 0).toLocaleString()}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${orderStatusBadge[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-orange-600" />
              <h3 className="text-base font-bold text-gray-900">Recent Reports</h3>
            </div>
            <Link href="/admin/reports" className="text-xs text-red-500 hover:text-red-600 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentReports.length === 0
              ? <p className="text-gray-600 text-xs text-center py-4">No reports yet</p>
              : recentReports.map(r => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <Flag size={12} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 capitalize">{r.reason?.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{r.target_type}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${r.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{r.status}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
