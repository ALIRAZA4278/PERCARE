'use client';

import { Calendar, Syringe, Package, AlertTriangle, Heart, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'appointment',
      icon: Calendar,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      title: 'Appointment Reminder',
      description: 'Your appointment with Dr. Arsalan Khan is tomorrow at 4:00 PM.',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 2,
      type: 'vaccine',
      icon: Syringe,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      title: 'Vaccination Due',
      description: "Bruno's Rabies vaccine is due in 3 days.",
      time: '3 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'order',
      icon: Package,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      title: 'Order Shipped',
      description: 'Your order #1234 has been shipped and will arrive in 2-3 days.',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 4,
      type: 'alert',
      icon: AlertTriangle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      title: 'Lost Pet Alert',
      description: 'A German Shepherd was reported lost near your area.',
      time: '1 day ago',
      read: true,
    },
    {
      id: 5,
      type: 'adoption',
      icon: Heart,
      iconBg: 'bg-pink-50',
      iconColor: 'text-pink-600',
      borderColor: 'border-pink-200',
      title: 'Adoption Update',
      description: 'Happy Paws Shelter has responded to your adoption request for Rocky.',
      time: '2 days ago',
      read: true,
      badge: { text: 'APPROVED', color: 'bg-green-50 text-green-700' },
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3 sm:space-y-4">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-md cursor-pointer ${
                  notification.read ? 'border-gray-200' : `${notification.borderColor} border-l-4`
                }`}
                onClick={() => {
                  setNotifications(notifications.map(n =>
                    n.id === notification.id ? { ...n, read: true } : n
                  ));
                }}
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${notification.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={notification.iconColor} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-sm sm:text-base ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.description}
                    </p>

                    {/* Badge */}
                    {notification.badge && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${notification.badge.color}`}>
                          <CheckCircle size={12} />
                          {notification.badge.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
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
