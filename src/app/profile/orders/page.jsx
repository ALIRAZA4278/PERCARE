'use client';

import { ArrowLeft, Package, ChevronRight, CheckCircle, Truck, Clock } from 'lucide-react';
import Link from 'next/link';

export default function MyOrdersPage() {
  const orders = [
    { id: 'ORD-001', name: 'Premium Dog Food – Chicken', date: 'Mar 12, 2026', status: 'delivered', price: 2500 },
    { id: 'ORD-002', name: 'Cat Grooming Brush', date: 'Mar 10, 2026', status: 'shipped', price: 850 },
    { id: 'ORD-003', name: 'Flea & Tick Shampoo', date: 'Mar 8, 2026', status: 'processing', price: 650 },
    { id: 'ORD-004', name: 'Chew Toys Pack (5)', date: 'Mar 5, 2026', status: 'delivered', price: 1200 },
  ];

  const statusConfig = {
    delivered: { icon: CheckCircle, label: 'Delivered', color: 'bg-green-50 text-green-700' },
    shipped: { icon: Truck, label: 'Shipped', color: 'bg-blue-50 text-blue-700' },
    processing: { icon: Clock, label: 'Processing', color: 'bg-orange-50 text-orange-700' },
  };

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
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;
            return (
              <div key={order.id} className="flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <Package size={20} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{order.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{order.id} · {order.date}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${config.color}`}>
                        <StatusIcon size={11} />
                        {config.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">Rs. {order.price.toLocaleString()}</span>
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
