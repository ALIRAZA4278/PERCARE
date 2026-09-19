import { ArrowLeft, BookOpen, Clock, Share2 } from 'lucide-react';
import Link from 'next/link';
import { PET_TIP_DETAILS } from '@/lib/petTips';

export function generateStaticParams() {
  return Object.keys(PET_TIP_DETAILS).map((id) => ({ id }));
}

// "**bold**" segments render as emphasised runs, same as the reference.
function Paragraph({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="text-sm text-muted-foreground leading-relaxed">
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="text-foreground font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

export default async function PetTipDetailPage({ params }) {
  const { id } = await params;
  const tip = PET_TIP_DETAILS[id];

  if (!tip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">📄</p>
          <h2 className="text-lg font-bold text-foreground mb-2">Article not found</h2>
          <Link href="/pet-tips" className="text-sm text-primary font-semibold hover:underline">
            ← Back to Pet Insider
          </Link>
        </div>
      </div>
    );
  }

  const related = Object.entries(PET_TIP_DETAILS)
    .filter(([key]) => key !== String(id))
    .slice(0, 4);

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-6 pb-4 md:px-8 max-w-3xl mx-auto">
        <Link
          href="/pet-tips"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Pet Insider
        </Link>

        <div className="text-6xl mb-4">{tip.image}</div>
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          {tip.category}
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">{tip.title}</h1>

        <div className="flex items-center gap-4 mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {tip.readTime}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" /> Pet Insider
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
            <Share2 className="h-3.5 w-3.5" /> Share
          </span>
        </div>

        <div className="space-y-4">
          {tip.content.map((para, i) => (
            <Paragraph key={i} text={para} />
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="font-bold text-foreground text-base mb-4">More from Pet Insider</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map(([key, item]) => (
              <Link
                key={key}
                href={`/pet-tips/${key}`}
                className="group flex items-start gap-3 p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all btn-press"
              >
                <span className="text-2xl shrink-0">{item.image}</span>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-primary">{item.category}</span>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
