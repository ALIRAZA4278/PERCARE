'use client';

import { Search, Eye, Truck, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700', processing: 'bg-orange-50 text-orange-700',
  shipped: 'bg-blue-50 text-blue-700', delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600', confirmed: 'bg-blue-50 text-blue-700',
};

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: s } = await supabase.from('stores').select('*').eq('owner_id', user.id).single();
    setStore(s);
    if (!s) { setLoading(false); return; }

    const { data } = await supabase
      .from('order_items')
      .select('*, order:orders(id, created_at, shipping_address, shipping_city, phone, buyer:profiles(full_name, email, phone)), product:products(name)')
      .eq('store_id', s.id)
      .order('created_at', { ascending: false });

    const orderMap = new Map();
    (data || []).forEach(item => {
      const orderId = item.order?.id;
      if (!orderId) return;
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          id: orderId,
          shortId: orderId.slice(0, 8).toUpperCase(),
          buyer: item.order.buyer?.full_name || 'Customer',
          buyerEmail: item.order.buyer?.email || '',
          buyerPhone: item.order.buyer?.phone || item.order.phone || '',
          address: `${item.order.shipping_address || ''}${item.order.shipping_city ? ', ' + item.order.shipping_city : ''}`,
          date: item.order.created_at,
          items: [],
          total: 0,
          status: item.item_status || 'pending',
        });
      }
      const o = orderMap.get(orderId);
      o.items.push(item.product?.name || 'Product');
      o.total += item.total_price || 0;
    });

    setOrders(Array.from(orderMap.values()));
    setLoading(false);
  };

  const handleShip = async (orderId) => {
    await supabase.from('order_items').update({ item_status: 'shipped' })
      .eq('store_id', store.id).in('order_id', [orderId]);
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statCounts = {
    processing: orders.filter(o => ['pending', 'processing', 'confirmed'].includes(o.status)).length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const filtered = orders.filter(o => {
    const filterMatch = activeFilter === 'All' ||
      (activeFilter === 'Processing' && ['pending', 'processing', 'confirmed'].includes(o.status)) ||
      (activeFilter === 'Shipped' && o.status === 'shipped') ||
      (activeFilter === 'Delivered' && o.status === 'delivered') ||
      (activeFilter === 'Cancelled' && o.status === 'cancelled');
    const searchMatch = !searchQuery.trim() ||
      o.shortId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyer.toLowerCase().includes(searchQuery.toLowerCase());
    return filterMatch && searchMatch;
  });

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-600 mt-1">Track and manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { value: statCounts.processing, label: 'Processing', color: 'text-orange-600' },
          { value: statCounts.shipped, label: 'Shipped', color: 'text-blue-600' },
          { value: statCounts.delivered, label: 'Delivered', color: 'text-green-600' },
          { value: statCounts.cancelled, label: 'Cancelled', color: 'text-red-600' },
        ].map(({ value, label, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs sm:text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="flex-1 relative max-w-lg">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by order ID or customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900" />
        </div>
        <div className="flex items-center gap-2">
          {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                activeFilter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-3">
        {filtered.map((order) => (
          <div key={order.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900 text-sm">ORD-{order.shortId.slice(0, 4)}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{order.buyer}</p>
              <p className="text-xs text-gray-500">{order.items.join(', ')}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <p className="font-bold text-gray-900 text-sm">Rs. {order.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
              </div>
              {['pending', 'processing', 'confirmed'].includes(order.status) && (
                <button onClick={() => handleShip(order.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                  <Truck size={12} /> Ship
                </button>
              )}
              <button onClick={() => setViewOrder(order)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                <Eye size={12} /> Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No orders</h3>
          <p className="text-gray-600">Orders will appear here when customers buy your products.</p>
        </div>
      )}

      {/* Order Details Modal */}
      {viewOrder && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setViewOrder(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Order ORD-{viewOrder.shortId.slice(0, 4)}</h2>
                <button onClick={() => setViewOrder(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} className="text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-blue-600 mb-0.5">Customer</p><p className="font-semibold text-gray-900 text-sm">{viewOrder.buyer}</p></div>
                  <div><p className="text-xs text-blue-600 mb-0.5">Status</p><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[viewOrder.status]}`}>{viewOrder.status}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-blue-600 mb-0.5">Date</p><p className="font-semibold text-gray-900 text-sm">{formatDate(viewOrder.date)}</p></div>
                  <div><p className="text-xs text-blue-600 mb-0.5">Total</p><p className="font-semibold text-gray-900 text-sm">Rs. {viewOrder.total.toLocaleString()}</p></div>
                </div>
                <div><p className="text-xs text-blue-600 mb-0.5">Items</p><p className="font-semibold text-gray-900 text-sm">{viewOrder.items.join(', ')}</p></div>
                {viewOrder.address && <div><p className="text-xs text-blue-600 mb-0.5">Delivery Address</p><p className="font-semibold text-gray-900 text-sm">{viewOrder.address}</p></div>}
                <div><p className="text-xs text-blue-600 mb-0.5">Shipping</p><p className="font-semibold text-gray-900 text-sm">PetCare Platform Shipping</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-blue-600 mb-0.5">Phone</p><p className="font-semibold text-gray-900 text-sm">{viewOrder.buyerPhone || '—'}</p></div>
                  <div><p className="text-xs text-blue-600 mb-0.5">Email</p><p className="font-semibold text-gray-900 text-sm">{viewOrder.buyerEmail || '—'}</p></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
