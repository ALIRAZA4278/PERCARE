'use client';

import { ArrowLeft, Clock, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const SUBJECTS = [
  'General Inquiry',
  'Pet Purchase Inquiry',
  'Order Support',
  'Veterinary Booking',
  'Shelter & Adoption',
  'Partnership / Selling',
];

const CONTACT_DETAILS = [
  { icon: Mail, label: 'Email', value: 'support@petcare.pk', href: 'mailto:support@petcare.pk' },
  { icon: Phone, label: 'Phone', value: '+92 42 3576 1234', href: 'tel:+924235761234' },
  { icon: MapPin, label: 'Office', value: 'Gulberg III, Lahore, Pakistan' },
  { icon: Clock, label: 'Support Hours', value: 'Mon–Sun, 9:00 AM – 11:00 PM' },
];

const inputClass =
  'w-full h-12 px-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-expo';

function ContactForm() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject');
  const petParam = searchParams.get('pet');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(
    subjectParam && SUBJECTS.includes(subjectParam) ? subjectParam : SUBJECTS[0]
  );
  const [message, setMessage] = useState(
    petParam ? `Hi, I'd like to know more about ${petParam}.` : ''
  );
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email and message');
      return;
    }
    setError('');
    setSent(true);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <form
        onSubmit={handleSubmit}
        className="md:col-span-2 space-y-3 p-5 md:p-6 rounded-2xl bg-card border border-border"
      >
        {sent ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-vitality/10 flex items-center justify-center mx-auto mb-3">
              <Send className="h-5 w-5 text-vitality" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">
              Thanks, {name.split(' ')[0]}!
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Your message has been received. We&apos;ll be in touch shortly.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setMessage('');
              }}
              className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold btn-press hover:opacity-90"
            >
              Send another message
            </button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="c-name"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
                >
                  Full Name *
                </label>
                <input
                  id="c-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="c-email"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
                >
                  Email *
                </label>
                <input
                  id="c-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="c-phone"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
                >
                  Phone
                </label>
                <input
                  id="c-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="+92 3xx xxxxxxx"
                />
              </div>
              <div>
                <label
                  htmlFor="c-subject"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
                >
                  Subject
                </label>
                <select
                  id="c-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={inputClass}
                >
                  {SUBJECTS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="c-msg"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                Message *
              </label>
              <textarea
                id="c-msg"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                className="w-full p-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-expo resize-none"
              />
            </div>

            {error && <p className="text-xs font-medium text-destructive">{error}</p>}

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press transition-expo hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" /> Send Message
            </button>
          </>
        )}
      </form>

      <div className="space-y-3">
        {CONTACT_DETAILS.map((detail) => {
          const Icon = detail.icon;
          return (
            <div key={detail.label} className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">{detail.label}</span>
              </div>
              {detail.href ? (
                <a
                  href={detail.href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {detail.value}
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">{detail.value}</p>
              )}
            </div>
          );
        })}

        <div className="p-4 rounded-2xl bg-emergency/5 border border-emergency/20">
          <p className="text-xs font-semibold text-emergency mb-1">Pet emergency?</p>
          <p className="text-xs text-muted-foreground">
            Don&apos;t wait on email — use the Find Emergency Vet button for 24/7 clinics near you.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-10">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-3">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              We&apos;re here to help
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-foreground mb-2">
            Contact PetCare
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Questions about a pet, an order, or a booking? Send us a message and our team will
            respond within 24 hours.
          </p>
        </div>

        <Suspense fallback={null}>
          <ContactForm />
        </Suspense>
      </div>
    </div>
  );
}
