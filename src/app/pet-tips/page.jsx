'use client';

import { ArrowLeft, BookOpen, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { PET_TIPS, PET_TIP_CATEGORIES } from '@/lib/petTips';

export default function PetTipsPage() {
  const [category, setCategory] = useState('All');
  const tips = category === 'All' ? PET_TIPS : PET_TIPS.filter((t) => t.category === category);

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-6 pb-4 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Pet Insider</h1>
            <p className="text-sm text-muted-foreground">
              Tips, guides &amp; insights for every pet parent
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {PET_TIP_CATEGORIES.map((name) => (
            <button
              key={name}
              onClick={() => setCategory(name)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-expo btn-press ${
                name === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tips.map((tip) => (
            <Link
              key={tip.id}
              href={`/pet-tips/${tip.id}`}
              className="group block p-5 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all btn-press"
            >
              <div className="text-4xl mb-3">{tip.image}</div>
              <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold mb-2">
                {tip.category}
              </span>
              <h3 className="font-bold text-foreground text-sm mb-1.5 group-hover:text-primary transition-colors">
                {tip.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tip.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> {tip.readTime}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
