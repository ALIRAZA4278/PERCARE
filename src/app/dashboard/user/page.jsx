'use client';

import { Bell, ChevronRight, Heart, PawPrint, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function UserDashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ pets: 0, orders: 0, favourites: 0, unread: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [petsRes, ordersRes, favesRes, notifRes, recentRes] = await Promise.all([
        supabase
          .from('pets')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', user.id),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('buyer_id', user.id),
        supabase
          .from('favourites')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false),
        supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4),
      ]);

      setStats({
        pets: petsRes.count || 0,
        orders: ordersRes.count || 0,
        favourites: favesRes.count || 0,
        unread: notifRes.count || 0,
      });
      setRecentOrders(recentRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const tiles = [
    { label: 'My Pets', value: stats.pets, icon: PawPrint, color: 'text-primary', path: '/dashboard/user/pets' },
    { label: 'Orders', value: stats.orders, icon: ShoppingBag, color: 'text-vitality', path: '/dashboard/user/orders' },
    { label: 'Favourites', value: stats.favourites, icon: Heart, color: 'text-emergency', path: '/dashboard/user/favourites' },
    { label: 'Unread', value: stats.unread, icon: Bell, color: 'text-amber', path: '/dashboard/user/notifications' },
  ];

  const firstName = (profile?.full_name || 'there').split(' ')[0];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {firstName}! 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s what&apos;s happening with your pets
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.label}
              href={tile.path}
              className="p-4 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all btn-press flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Icon className={`h-5 w-5 ${tile.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {loading ? '—' : tile.value}
                </p>
                <p className="text-xs text-muted-foreground">{tile.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-5 rounded-2xl bg-card shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Recent Orders</h2>
          <Link href="/dashboard/user/orders" className="text-xs text-primary font-medium">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/profile/orders/${order.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {String(order.id).slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                </div>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  Rs. {order.total_amount?.toLocaleString()}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
