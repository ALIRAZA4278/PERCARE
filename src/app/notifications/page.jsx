'use client';

import { Bell, Calendar, Check, Heart, Package, Syringe, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const TYPE_STYLE = {
  appointment: { icon: Calendar, color: 'bg-primary/10 text-primary' },
  vaccine_reminder: { icon: Syringe, color: 'bg-amber/10 text-amber' },
  order: { icon: Package, color: 'bg-vitality/10 text-vitality' },
  lost_found: { icon: TriangleAlert, color: 'bg-emergency/10 text-emergency' },
  adoption: { icon: Heart, color: 'bg-emergency/10 text-emergency' },
  system: { icon: Bell, color: 'bg-muted text-muted-foreground' },
  review: { icon: Check, color: 'bg-amber/10 text-amber' },
  approval: { icon: Check, color: 'bg-vitality/10 text-vitality' },
  ban: { icon: TriangleAlert, color: 'bg-emergency/10 text-emergency' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
      return;
    }
    if (!user) return;
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setNotifications(data || []);
      setLoading(false);
    };
    fetchNotifications();
  }, [user, authLoading, isLoggedIn, router]);

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-medium text-primary btn-press">
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 space-y-2 max-w-3xl mx-auto">
        {authLoading || loading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-bold text-foreground mb-2">No notifications</h3>
            <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const style = TYPE_STYLE[notification.type] || TYPE_STYLE.system;
            const Icon = style.icon;
            return (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 rounded-2xl bg-card shadow-card btn-press cursor-pointer transition-all duration-300 hover:shadow-card-hover ${
                  notification.is_read ? '' : 'border-l-4 border-l-primary'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-sm font-semibold ${
                          notification.is_read ? 'text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {timeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
