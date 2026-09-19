'use client';

import { ArrowLeft, Package, ChevronRight, CheckCircle, Truck, Clock, XCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { supabase } from '@/lib/supabase';

export default function MyOrdersPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { marketplaceEnabled } = useFeatureFlags();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusConfig = {
    pending: { icon: Clock, label: 'Pending', color: 'bg-amber/10 text-amber' },
    confirmed: { icon: CheckCircle, label: 'Confirmed', color: 'bg-primary/10 text-primary' },
    processing: { icon: RefreshCw, label: 'Processing', color: 'bg-amber/10 text-amber' },
    shipped: { icon: Truck, label: 'Shipped', color: 'bg-primary/10 text-primary' },
    delivered: { icon: CheckCircle, label: 'Delivered', color: 'bg-vitality/10 text-vitality' },
    cancelled: { icon: XCircle, label: 'Cancelled', color: 'bg-emergency/10 text-emergency' },
    refunded: { icon: RefreshCw, label: 'Refunded', color: 'bg-muted text-foreground' },
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
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 max-w-3xl mx-auto py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/profile" className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft size={18} className="text-foreground" />
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-foreground">My Orders</h1>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-3xl mx-auto py-6 sm:py-8">
        <div className="space-y-2 sm:space-y-3">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <Link key={order.id} href={`/profile/orders/${order.id}`} className="flex items-center justify-between rounded-2xl bg-card shadow-card p-4 sm:p-5 hover:shadow-card-hover transition-all btn-press cursor-pointer group">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm sm:text-base truncate">{getOrderSummary(order)}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{order.id.slice(0, 8).toUpperCase()} · {formatDate(order.created_at)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${config.color}`}>
                        <StatusIcon size={11} />
                        {config.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">Rs. {order.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
            {marketplaceEnabled && (
              <Link href="/shop" className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2 text-sm">
                Browse Products
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
