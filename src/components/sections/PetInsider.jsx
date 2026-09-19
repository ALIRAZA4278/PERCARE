import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

const CARDS = [
  { emoji: '🐾', title: 'What to Consider When Choosing a New Pet', category: 'Getting Started' },
  { emoji: '🐱', title: 'Tips for Training Your Cat', category: 'Training' },
  { emoji: '🐕', title: 'How to Keep Your Dog Healthy', category: 'Health' },
  { emoji: '💉', title: 'Understanding Pet Vaccinations', category: 'Health' },
];

export default function PetInsider() {
  return (
    <section className="px-4 md:px-8 pb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground text-base">Pet Insider</h3>
        </div>
        <Link
          href="/pet-tips"
          className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CARDS.map((card) => (
          <Link
            key={card.title}
            href="/pet-tips"
            className="group p-4 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all btn-press"
          >
            <div className="text-3xl mb-2">{card.emoji}</div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold mb-1.5">
              {card.category}
            </span>
            <h4 className="text-xs font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
              {card.title}
            </h4>
          </Link>
        ))}
      </div>
    </section>
  );
}
