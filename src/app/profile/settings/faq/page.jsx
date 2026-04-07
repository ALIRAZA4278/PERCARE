'use client';

import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'What is PetCare?', a: 'PetCare is Pakistan\'s trusted pet ecosystem. It brings together veterinary services, a pet product marketplace, animal shelters, lost & found reporting, and pet health management — all in one platform.' },
    { q: 'How do I book a vet appointment?', a: 'Go to "My Pets", select a pet, and tap "Book Vet". You\'ll be guided through selecting a service, date & time, and provider. You can also book from the pet detail page.' },
    { q: 'Can I sell my pet on PetCare?', a: 'Currently, PetCare focuses on pet products, not pet sales. However, you can list pets for adoption through our shelter partners or use the Lost & Found feature to help reunite pets.' },
    { q: 'How does the marketplace work?', a: 'Browse verified products from trusted sellers. Add items to your cart, apply promo codes, and checkout with card or bank transfer. All orders include free delivery and buyer protection.' },
    { q: 'Are sellers verified?', a: 'Yes! We only allow verified sellers and companies to list products on our marketplace. Every seller goes through an accountability check before being approved.' },
    { q: 'How do I report a lost pet?', a: 'Go to the "Lost & Found" section and tap "Report". Fill in your pet\'s details including species, breed, last known location, and a description. Your report will be visible to other users in your area.' },
    { q: 'How does adoption work?', a: 'Visit the "Shelters" section, browse available animals, and tap "Adopt" on any pet. Fill out the adoption application with your details and experience. The shelter will review and respond to your request.' },
    { q: 'What if my order arrives damaged?', a: 'We have 100% buyer protection. If your order arrives tampered, broken, or missing, our delivery rider will assist you on the spot. You can also contact support for easy returns within 7 days.' },
    { q: 'How do donations work?', a: 'Each shelter has donation packages (e.g., Feed a Pet, Medical Aid, Full Sponsorship). Select a package and contribute directly. Your donation goes toward food, medical care, and shelter for animals in need.' },
    { q: 'Is there an emergency vet feature?', a: 'Yes! The sidebar has an "Emergency?" section. Tap "Find Emergency Vet" to locate the nearest available emergency veterinary clinic instantly.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/profile/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft size={18} className="text-gray-700" />
            </Link>
            <span className="text-sm text-gray-600">Back</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <HelpCircle size={18} className="text-blue-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 text-sm sm:text-base pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === index && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
