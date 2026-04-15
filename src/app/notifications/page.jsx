'use client';

import { Calendar, Syringe, Package, AlertTriangle, Heart, CheckCircle, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const iconMap = {
  appointment: { icon: Calendar, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', borderColor: 'border-blue-200' },
  vaccine_reminder: { icon: Syringe, iconBg: 'bg-orange-50', iconColor: 'text-orange-600', borderColor: 'border-orange-200' },
  order: { icon: Package, iconBg: 'bg-green-50', iconColor: 'text-green-600', borderColor: 'border-green-200' },
  lost_found: { icon: AlertTriangle, iconBg: 'bg-red-50', iconColor: 'text-red-600', borderColor: 'border-red-200' },
  adoption: { icon: Heart, iconBg: 'bg-pink-50', iconColor: 'text-pink-600', borderColor: 'border-pink-200' },
  system: { icon: Bell, iconBg: 'bg-gray-50', iconColor: 'text-gray-600', borderColor: 'border-gray-200' },
  review: { icon: CheckCircle, iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600', borderColor: 'border-yellow-200' },
  approval: { icon: CheckCircle, iconBg: 'bg-green-50', iconColor: 'text-green-600', borderColor: 'border-green-200' },
  ban: { icon: AlertTriangle, iconBg: 'bg-red-50', iconColor: 'text-red-600', borderColor: 'border-red-200' },
};

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
    if (user) fetchNotifications();
  }, [user, authLoading, isLoggedIn]);

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

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors">
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3 sm:space-y-4">
          {notifications.map((notification) => {
            const typeConfig = iconMap[notification.type] || iconMap.system;
            const Icon = typeConfig.icon;
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-md cursor-pointer ${
                  notification.is_read ? 'border-gray-200' : `${typeConfig.borderColor} border-l-4`
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${typeConfig.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={typeConfig.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-sm sm:text-base ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                        {getTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
