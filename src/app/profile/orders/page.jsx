'use client';

import { ArrowLeft, Package, ChevronRight, CheckCircle, Truck, Clock, XCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function MyOrdersPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusConfig = {
    pending: { icon: Clock, label: 'Pending', color: 'bg-yellow-50 text-yellow-700' },
    confirmed: { icon: CheckCircle, label: 'Confirmed', color: 'bg-blue-50 text-blue-700' },
    processing: { icon: RefreshCw, label: 'Processing', color: 'bg-orange-50 text-orange-700' },
    shipped: { icon: Truck, label: 'Shipped', color: 'bg-blue-50 text-blue-700' },
    delivered: { icon: CheckCircle, label: 'Delivered', color: 'bg-green-50 text-green-700' },
    cancelled: { icon: XCircle, label: 'Cancelled', color: 'bg-red-50 text-red-700' },
    refunded: { icon: RefreshCw, label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
  };

  useEffect(() => {
    if (!authLoading && !isLoggedIn) { router.push('/login'); return; }
    if (user) fetchOrders();
  }, [user, authLoading, isLoggedIn]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(name))')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const getOrderSummary = (order) => {
    if (!order.items || order.items.length === 0) return 'Order';
    const first = order.items[0]?.product?.name || 'Product';
    if (order.items.length === 1) return first;
    return `${first} + ${order.items.length - 1} more`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft size={18} className="text-gray-700" />
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-gray-900">My Orders</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-2 sm:space-y-3">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <div key={order.id} className="flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <Package size={20} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{getOrderSummary(order)}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{order.id.slice(0, 8).toUpperCase()} · {formatDate(order.created_at)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${config.color}`}>
                        <StatusIcon size={11} />
                        {config.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">Rs. {order.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
              </div>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here.</p>
            <Link href="/marketplace" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2 text-sm">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
