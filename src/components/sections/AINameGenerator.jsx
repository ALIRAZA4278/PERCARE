'use client';

import { Check, Copy, RefreshCw, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';

const NAME_POOLS = {
  dog: ['Bruno', 'Sheru', 'Max', 'Bella', 'Rocky', 'Luna', 'Oscar', 'Daisy', 'Sultan', 'Coco'],
  cat: ['Mitti', 'Simba', 'Whiskers', 'Nala', 'Shadow', 'Mittens', 'Leo', 'Cleo', 'Billu', 'Meeko'],
  bird: ['Chirpy', 'Rio', 'Sky', 'Tweety', 'Kiwi', 'Pearl', 'Sunny', 'Mango', 'Tiki', 'Azure'],
  rabbit: [
    'Snowball',
    'Cotton',
    'Bun-Bun',
    'Hazel',
    'Pepper',
    'Marshmallow',
    'Thumper',
    'Lola',
    'Pebbles',
    'Clover',
  ],
  default: [
    'Buddy',
    'Lucky',
    'Cookie',
    'Peanut',
    'Ginger',
    'Pepper',
    'Caramel',
    'Biscuit',
    'Mochi',
    'Noodle',
  ],
};

function pickSix(pool) {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 6);
}

function suggestNames(description) {
  const text = description.toLowerCase();
  if (text.includes('dog') || text.includes('puppy')) return pickSix(NAME_POOLS.dog);
  if (text.includes('cat') || text.includes('kitten')) return pickSix(NAME_POOLS.cat);
  if (text.includes('bird') || text.includes('parrot')) return pickSix(NAME_POOLS.bird);
  if (text.includes('rabbit') || text.includes('bunny')) return pickSix(NAME_POOLS.rabbit);
  return pickSix(NAME_POOLS.default);
}

export default function AINameGenerator() {
  const [description, setDescription] = useState('');
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState('');

  const generate = () => {
    if (!description.trim()) {
      setError('Tell us about your pet first!');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setNames(suggestNames(description));
      setLoading(false);
    }, 800);
  };

  const copy = (name) => {
    navigator.clipboard?.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <section className="px-4 md:px-8 pb-12">
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-card to-vitality/5 border border-primary/10 p-5 md:p-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-bold text-foreground text-base">AI Pet Name Generator</h3>
        </div>

        <p className="text-xs text-muted-foreground mb-4 max-w-md">
          Tell us about your pet — species, personality, color — and we&apos;ll suggest the perfect
          name.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
            placeholder="e.g. playful golden puppy, calm grey kitten..."
            className="flex-1 h-11 px-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <button
            onClick={generate}
            disabled={loading}
            className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? 'Thinking…' : 'Generate'}
          </button>
        </div>

        {error && <p className="text-xs font-medium text-destructive mb-3">{error}</p>}

        {names.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {names.map((name) => (
              <button
                key={name}
                onClick={() => copy(name)}
                className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-sm text-sm font-medium text-foreground btn-press transition-all"
              >
                {name}
                {copied === name ? (
                  <Check className="h-3.5 w-3.5 text-vitality" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
