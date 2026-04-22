'use client';

import { Package, ClipboardList, DollarSign, Star, AlertCircle, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SellerDashboardPage() {
  const { user, profile } = useAuth();
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState({ products: 0, activeOrders: 0, revenue: 0, rating: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [quickStats, setQuickStats] = useState({ ordersToday: 0, pendingReviews: 0, returns: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    // Get store
    const { data: s } = await supabase.from('stores').select('*').eq('owner_id', user.id).single();
    setStore(s);
    if (!s) { setLoading(false); return; }

    // Parallel fetches
    const [productsRes, ordersRes, lowStockRes, reviewsRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', s.id),
      supabase.from('order_items').select('*, order:orders(*, buyer:profiles(full_name)), product:products(name)')
        .eq('store_id', s.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('products').select('name, stock_quantity').eq('store_id', s.id).lte('stock_quantity', 10).gt('stock_quantity', 0),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('target_type', 'store').eq('target_id', s.id),
    ]);

    const allOrderItems = ordersRes.data || [];
    const activeOrders = allOrderItems.filter(oi => ['pending', 'confirmed', 'shipped'].includes(oi.item_status));
    const revenue = allOrderItems.reduce((sum, oi) => sum + (oi.total_price || 0), 0);

    const today = new Date().toISOString().split('T')[0];
    const ordersToday = allOrderItems.filter(oi => oi.created_at?.startsWith(today)).length;

    setStats({
      products: productsRes.count || 0,
      activeOrders: activeOrders.length,
      revenue,
      rating: s.rating || 0,
    });

    // Recent orders — deduplicate by order
    const seen = new Set();
    const recent = allOrderItems.filter(oi => {
      if (!oi.order || seen.has(oi.order.id)) return false;
      seen.add(oi.order.id);
      return true;
    }).slice(0, 5).map(oi => ({
      id: oi.order.id,
      productName: oi.product?.name || 'Product',
      buyer: oi.order.buyer?.full_name || 'Customer',
      price: oi.total_price || 0,
      status: oi.item_status || oi.order.status,
    }));
    setRecentOrders(recent);

    setLowStock((lowStockRes.data || []).slice(0, 5));

    setQuickStats({
      ordersToday,
      pendingReviews: reviewsRes.count || 0,
      returns: 0,
    });

    setLoading(false);
  };

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700',
    confirmed: 'bg-blue-50 text-blue-700',
    processing: 'bg-orange-50 text-orange-700',
    shipped: 'bg-blue-50 text-blue-700',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-600',
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!store) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Set Up Your Store</h2>
          <p className="text-gray-600 mb-6">Create your store to start selling products.</p>
          <Link href="/seller-dashboard/store" className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm">
            Create Store
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome, {store.name}! 🏪</h1>
          <p className="text-sm text-gray-600 mt-1">Here's your store performance today</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/seller-dashboard/products"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors text-sm">
            Manage Products
          </Link>
          <Link href="/seller-dashboard/orders"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm">
            View Orders
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { icon: Package, label: 'Total Products', value: stats.products, color: 'bg-blue-50 text-blue-600' },
          { icon: ClipboardList, label: 'Active Orders', value: stats.activeOrders, color: 'bg-green-50 text-green-600' },
          { icon: DollarSign, label: 'Revenue (Month)', value: `Rs. ${(stats.revenue / 1000).toFixed(0)}K`, color: 'bg-yellow-50 text-yellow-600' },
          { icon: Star, label: 'Store Rating', value: stats.rating || '—', color: 'bg-purple-50 text-purple-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon size={20} /></div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs sm:text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders + Low Stock + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <Link href="/seller-dashboard/orders" className="text-sm text-blue-600 font-medium hover:text-blue-700">View all</Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{order.productName}</p>
                    <p className="text-xs text-gray-500">{order.id.slice(0, 8).toUpperCase()} · {order.buyer}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-gray-900 text-sm">Rs. {order.price.toLocaleString()}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No orders yet</p>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900">Low Stock Alert</h3>
            </div>
            {lowStock.length > 0 ? (
              <div className="space-y-3">
                {lowStock.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Min: 10</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600">{item.stock_quantity} left</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">All products well stocked</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Orders Today', value: quickStats.ordersToday },
                { label: 'Pending Reviews', value: quickStats.pendingReviews },
                { label: 'Return Requests', value: quickStats.returns },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="font-bold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
