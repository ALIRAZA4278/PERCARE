'use client';

import { ArrowLeft, Check, Clock, CreditCard, MapPin, Package } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// The reference shows a fixed five-step timeline; each step is marked done
// once the order has reached that stage or passed it.
const STAGES = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function buildTimeline(order) {
  const reached = STAGES.findIndex((s) => s.key === order.status);
  const placedAt = new Date(order.created_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return STAGES.map((stage, i) => ({
    label: stage.label,
    done: order.status === 'cancelled' ? false : i <= reached,
    time: i === 0 ? placedAt : i <= reached ? 'Completed' : 'Pending',
  }));
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      const { data: ord } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      const { data: its } = await supabase
        .from('order_items')
        .select('*, product:products(name, brand, image_url)')
        .eq('order_id', orderId);

      setOrder(ord);
      setItems(its || []);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const timeline = buildTimeline(order);
  const shortId = String(order.id).slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 py-4 flex items-center gap-3">
          <Link
            href="/profile/orders"
            className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Order {shortId}</h1>
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 space-y-4 max-w-lg">
        <div className="p-5 rounded-2xl bg-card shadow-card">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items on this order.</p>
          ) : (
            <div className="space-y-4 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.image_url}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.product?.brand && (
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {item.product.brand}
                      </p>
                    )}
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {item.product?.name || 'Product'}
                    </h3>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Qty: {item.quantity} · Rs. {item.total_price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{order.shipping_address || 'No address'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
              <span className="capitalize">{order.payment_method || 'Not set'}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card shadow-card">
          <h3 className="text-sm font-bold text-foreground mb-4">Tracking Timeline</h3>
          <div className="space-y-0">
            {timeline.map((step, i) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      step.done ? 'bg-vitality/10' : 'bg-muted'
                    }`}
                  >
                    {step.done ? (
                      <Check className="h-3.5 w-3.5 text-vitality" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className={`w-0.5 h-8 ${step.done ? 'bg-vitality/30' : 'bg-muted'}`} />
                  )}
                </div>
                <div className="pb-6">
                  <p
                    className={`text-sm font-semibold ${
                      step.done ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Total</span>
            <span className="text-lg font-extrabold text-foreground tabular-nums">
              Rs. {order.total_amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
