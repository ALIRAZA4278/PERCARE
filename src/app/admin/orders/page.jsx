'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['All', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusBadge = {
  pending: 'bg-orange-950 text-orange-400',
  confirmed: 'bg-blue-900 text-blue-400',
  shipped: 'bg-purple-900 text-purple-400',
  delivered: 'bg-green-950 text-green-400',
  cancelled: 'bg-red-900 text-red-400',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    setFiltered(tab === 'All' ? orders : orders.filter(o => o.status === tab));
  }, [orders, tab]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, buyer:profiles!buyer_id(full_name), items:order_items(*, product:products(name))')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'All' ? orders.length : orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{orders.length} total orders</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${tab === s ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {counts[s] > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === s ? 'bg-white/20' : 'bg-gray-800 text-gray-400'}`}>{counts[s]}</span>}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="w-8 px-4 py-3" />
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Order ID</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Buyer</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-600 py-12">No orders found</td></tr>
              ) : filtered.map(order => (
                <>
                  <tr key={order.id}
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                    <td className="px-4 py-3 text-gray-500">
                      {expanded === order.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.id?.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-white font-medium">{order.buyer?.full_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">Rs. {Number(order.total_amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[order.status] || 'bg-gray-800 text-gray-400'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr key={`${order.id}-items`} className="border-b border-gray-800 bg-gray-950/50">
                      <td colSpan={6} className="px-6 py-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Order Items</p>
                        {(!order.items || order.items.length === 0) ? (
                          <p className="text-xs text-gray-600">No items found</p>
                        ) : (
                          <div className="space-y-2">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                                  <span className="text-white">{item.product?.name || 'Unknown Product'}</span>
                                  <span className="text-gray-500 text-xs">× {item.quantity}</span>
                                </div>
                                <span className="text-gray-400 text-xs">Rs. {Number(item.unit_price || 0).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {order.delivery_address && (
                          <p className="text-xs text-gray-500 mt-3">Delivery: {order.delivery_address}</p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
