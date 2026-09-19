'use client';

import { Lightbulb, Send } from 'lucide-react';
import { useState } from 'react';

const TOPICS = ['general', 'feature', 'bug', 'design'];

export default function HelpUsImprove() {
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('general');
  const [status, setStatus] = useState('');

  const submit = () => {
    if (!text.trim()) {
      setStatus('Please write your suggestion first');
      return;
    }
    setStatus('Thank you! Your suggestion has been submitted 🎉');
    setText('');
    setTopic('general');
  };

  return (
    <section className="px-4 md:px-8 pb-12">
      <div className="rounded-2xl bg-card shadow-card p-5 md:p-6">
        <div className="flex items-center gap-2.5 mb-1">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground text-base">Help Us Improve</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Got an idea to make PetCare better? We&apos;d love to hear from you.
        </p>

        <div className="flex gap-2 mb-3 flex-wrap">
          {TOPICS.map((item) => (
            <button
              key={item}
              onClick={() => setTopic(item)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold capitalize transition-expo btn-press ${
                topic === item
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell us what you'd like to see improved..."
          className="w-full h-24 p-3 rounded-xl bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-expo resize-none"
        />

        {status && <p className="text-xs font-medium text-muted-foreground mt-2">{status}</p>}

        <button
          onClick={submit}
          className="mt-3 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold btn-press transition-expo hover:opacity-90"
        >
          <Send className="h-3.5 w-3.5" />
          Submit Suggestion
        </button>
      </div>
    </section>
  );
}
