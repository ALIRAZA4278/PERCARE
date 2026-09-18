'use client';

import { ArrowLeft, ChevronDown, CircleHelp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const FAQS = [
  {
    q: 'What is PetCare?',
    a: "PetCare is Pakistan's trusted pet ecosystem where you can discover veterinarians, shop pet products, adopt from shelters, report lost pets, and manage your pet's health — all in one platform.",
  },
  {
    q: 'How do I book a vet appointment?',
    a: "Go to Discover Vets, select a vet or clinic, choose an available time slot, and confirm your booking. You'll receive a confirmation and reminder notification.",
  },
  {
    q: 'Can I sell my pet on PetCare?',
    a: 'No. Public pet selling is not allowed on PetCare. Only company-owned pets can be listed and delivered by the platform itself to ensure animal welfare.',
  },
  {
    q: 'How does the marketplace work?',
    a: "Verified sellers and companies list pet products. You can browse, add to cart, and checkout. Delivery is handled by PetCare's couriers or the seller's own delivery.",
  },
  {
    q: 'Are sellers verified?',
    a: 'Yes. Every seller must be approved by our admin team before listing products. Verified sellers display a badge on their store profile.',
  },
  {
    q: 'How do I report a lost pet?',
    a: "Go to Lost & Found, tap 'Report Lost Pet', fill in the details including photos and last known location, and submit. Nearby users will be able to see your report.",
  },
  {
    q: 'How does adoption work?',
    a: 'Visit Shelters, browse animals available for adoption, and submit an adoption request. The shelter will review your application and contact you.',
  },
  {
    q: 'What if my order arrives damaged?',
    a: 'PetCare guarantees buyer protection. If your order arrives tampered with, broken, or missing items, our rider will assist on the spot. You can also report the issue from your order tracking page.',
  },
  {
    q: 'How do donations work?',
    a: 'Shelters create donation packages. You can select a package and pay via card or bank transfer. 100% of donations go directly to the shelter.',
  },
  {
    q: 'Is there an emergency vet feature?',
    a: 'Yes. Use the Emergency button in the navigation or on the Discover page to find emergency veterinary services near you instantly.',
  },
];

export default function FaqPage() {
  // Single-select, collapsible — same behaviour as the reference accordion.
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-6 pb-4 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CircleHelp className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Frequently Asked Questions</h1>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-2xl">
        <div className="space-y-2">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.q} className="border rounded-xl px-4 bg-card shadow-sm">
                <h3 className="flex">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex flex-1 items-center justify-between py-4 font-medium transition-all text-sm text-foreground text-left"
                  >
                    {item.q}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </h3>
                {isOpen && (
                  <div className="overflow-hidden text-sm">
                    <div className="pb-4 pt-0 text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
