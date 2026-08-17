'use client';

import { Home, Clock } from 'lucide-react';
import Link from 'next/link';

export default function FeatureDisabled({ title = 'Coming Soon' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Clock size={28} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">This section isn&apos;t available yet. We&apos;re rolling it out soon — check back later.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors">
          <Home size={16} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
