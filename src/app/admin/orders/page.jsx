'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const statusBadge = {
  pending: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [statusEdits, setStatusEdits] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    let r = tab === 'All' ? orders : orders.filter(o => o.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(o =>
        o.buyer?.full_name?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q) ||
        o.shipping_city?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [orders, tab, search]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, buyer:profiles!buyer_id(full_name, email), items:order_items(*, product:products(name, image_url))')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const logAudit = (targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action: 'update_order_status', target_type: 'order', target_id: targetId, details });

  const handleStatusSave = async (order) => {
    const newStatus = statusEdits[order.id];
    if (!newStatus || newStatus === order.status) return;
    setSaving(order.id);
    await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
    await logAudit(order.id, `Status: ${order.status} → ${newStatus}`);
    if (order.buyer_id) {
      await supabase.from('notifications').insert({
        user_id: order.buyer_id,
        title: 'Order Update',
        message: `Your order status has been updated to: ${newStatus}`,
        type: 'order',
        is_read: false,
      });
    }
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
    setStatusEdits(prev => { const n = { ...prev }; delete n[order.id]; return n; });
    setSaving(null);
  };

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'All' ? orders.length : orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount || 0), 0);

  if (loading) return <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} total · Rs. {totalRevenue.toLocaleString()} delivered revenue</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buyer, order ID..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setTab(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${tab === s ? 'bg-red-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {counts[s] > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === s ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{counts[s]}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-8 px-4 py-3" />
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Order ID</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Buyer</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Payment</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-600 py-12">No orders found</td></tr>
              ) : filtered.map(order => {
                const isDirty = statusEdits[order.id] && statusEdits[order.id] !== order.status;
                return (
                  <>
                    <tr key={order.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                      <td className="px-4 py-3 text-gray-500">
                        {expanded === order.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{order.id?.slice(0, 8)}…</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 font-medium text-xs">{order.buyer?.full_name || '—'}</p>
                        <p className="text-gray-500 text-[10px] hidden sm:block">{order.buyer?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs hidden sm:table-cell">Rs. {Number(order.total_amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {order.payment_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                    {expanded === order.id && (
                      <tr key={`${order.id}-detail`} className="border-b border-gray-200 bg-gray-50">
                        <td colSpan={7} className="px-6 py-5" onClick={e => e.stopPropagation()}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Items */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items ({order.items?.length || 0})</p>
                              {(!order.items || order.items.length === 0) ? (
                                <p className="text-xs text-gray-600">No items</p>
                              ) : (
                                <div className="space-y-2">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 bg-gray-100 rounded shrink-0 overflow-hidden">
                                        {item.product?.image_url ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-xs">📦</span>}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-900 truncate">{item.product?.name || 'Unknown'}</p>
                                        <p className="text-[10px] text-gray-500">×{item.quantity} · Rs. {Number(item.unit_price || 0).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {order.shipping_address && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Delivery</p>
                                  <p className="text-xs text-gray-500">{order.shipping_address}{order.shipping_city ? `, ${order.shipping_city}` : ''}</p>
                                  {order.phone && <p className="text-xs text-gray-500 mt-0.5">{order.phone}</p>}
                                </div>
                              )}
                            </div>

                            {/* Status change */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
                              <select
                                value={statusEdits[order.id] ?? order.status}
                                onChange={e => setStatusEdits(prev => ({ ...prev, [order.id]: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm mb-3">
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                              </select>
                              <button
                                onClick={() => handleStatusSave(order)}
                                disabled={saving === order.id || !isDirty}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 disabled:text-gray-500 text-white text-xs font-semibold rounded-lg transition-colors">
                                <Save size={13} />
                                {saving === order.id ? 'Saving...' : 'Save Status'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
