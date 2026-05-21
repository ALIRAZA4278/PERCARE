'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['All', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusColor = {
  pending: 'bg-orange-50 text-orange-600',
  confirmed: 'bg-blue-50 text-blue-600',
  shipped: 'bg-purple-50 text-purple-600',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [activeStatus, setActiveStatus] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, buyer:profiles!buyer_id(full_name, email), items:order_items(*, product:products(name, image_url))')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    const revenue = (data || []).filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total_amount || 0), 0);
    setTotalRevenue(revenue);
    setLoading(false);
  };

  const filtered = activeStatus === 'All' ? orders : orders.filter(o => o.status === activeStatus);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-600 mt-1">{orders.length} total orders · Rs. {totalRevenue.toLocaleString()} delivered revenue</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {STATUS_TABS.filter(s => s !== 'All').map(status => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <div key={status} className="bg-white rounded-xl p-3 border border-gray-200 text-center">
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor[status]}`}>{status}</span>
            </div>
          );
        })}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors capitalize ${
              activeStatus === s ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>{s}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">No orders found</p>
          </div>
        ) : filtered.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900 text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {order.buyer?.full_name || 'Unknown'} · {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900 text-sm">Rs. {Number(order.total_amount).toLocaleString()}</p>
                <p className="text-xs text-gray-500 capitalize">{order.payment_method || 'card'}</p>
              </div>
              {expandedId === order.id ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
            </div>

            {expandedId === order.id && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</p>
                <div className="space-y-2">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
                        {item.product?.image_url ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover" /> : <span className="text-sm">📦</span>}
                      </div>
                      <p className="text-sm text-gray-700 flex-1">{item.product?.name || 'Product'}</p>
                      <p className="text-xs text-gray-500">×{item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-900">Rs. {Number(item.total_price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                {order.shipping_address && (
                  <p className="text-xs text-gray-500 mt-3">📍 {order.shipping_address}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
