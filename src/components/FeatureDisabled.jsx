'use client';

import { Clock, House } from 'lucide-react';
import Link from 'next/link';

export default function FeatureDisabled({ title = 'Coming Soon' }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Clock className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This section isn&apos;t available yet. We&apos;re rolling it out soon — check back later.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press transition-expo hover:opacity-90"
        >
          <House className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
