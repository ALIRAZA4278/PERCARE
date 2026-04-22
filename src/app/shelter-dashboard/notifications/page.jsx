'use client';

import { Calendar, Heart, HandHeart, AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const iconMap = {
  adoption: { icon: Heart, iconBg: 'bg-pink-50', iconColor: 'text-pink-600', borderColor: 'border-pink-200' },
  donation: { icon: HandHeart, iconBg: 'bg-green-50', iconColor: 'text-green-600', borderColor: 'border-green-200' },
  approval: { icon: CheckCircle, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', borderColor: 'border-blue-200' },
  system: { icon: Bell, iconBg: 'bg-gray-50', iconColor: 'text-gray-600', borderColor: 'border-gray-200' },
  appointment: { icon: Calendar, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', borderColor: 'border-blue-200' },
  lost_found: { icon: AlertTriangle, iconBg: 'bg-red-50', iconColor: 'text-red-600', borderColor: 'border-red-200' },
};

export default function ShelterNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    setNotifications(data || []);
    setLoading(false);
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const getTimeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">Stay updated on your shelter activity</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-teal-600 font-medium text-sm hover:text-teal-700">Mark all read</button>
        )}
      </div>
      <div className="max-w-3xl space-y-3">
        {notifications.map((n) => {
          const config = iconMap[n.type] || iconMap.system;
          const Icon = config.icon;
          return (
            <div key={n.id} onClick={() => markAsRead(n.id)}
              className={`bg-white rounded-xl p-4 sm:p-5 border cursor-pointer hover:shadow-md transition-all ${n.is_read ? 'border-gray-200' : `${config.borderColor} border-l-4`}`}>
              <div className="flex gap-3 sm:gap-4">
                <div className={`w-10 h-10 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}><Icon size={18} className={config.iconColor} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-bold text-sm ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h3>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">{getTimeAgo(n.created_at)}</span>
                  </div>
                  <p className={`text-xs sm:text-sm ${n.is_read ? 'text-gray-500' : 'text-gray-700'}`}>{n.message}</p>
                </div>
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <div className="text-center py-16"><div className="text-6xl mb-4">🔔</div><h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3><p className="text-gray-600">You're all caught up!</p></div>
        )}
      </div>
    </div>
  );
}
