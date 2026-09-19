import { ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — PetCare',
};

const SECTIONS = [
  {
    heading: 'Information We Collect',
    body: 'We collect personal information you provide during registration (name, email, phone), pet profile data, location data for vet discovery and lost pet reports, and transaction data for marketplace purchases.',
  },
  {
    heading: 'How We Use Your Data',
    body: 'Your data is used to provide platform services including vet discovery, appointment booking, order processing, lost pet matching, and personalized recommendations. We never sell your personal data to third parties.',
  },
  {
    heading: 'Data Security',
    body: 'We employ industry-standard encryption and security measures to protect your data. All payment information is processed through secure, PCI-compliant payment gateways.',
  },
  {
    heading: 'Location Data',
    body: 'Location access is used solely for finding nearby vets, clinics, and lost pet reports. You can disable location sharing at any time through your device settings.',
  },
  {
    heading: 'Third-Party Services',
    body: 'We integrate with third-party services for maps, payments, and notifications. These services have their own privacy policies. We share only the minimum data required for functionality.',
  },
  {
    heading: 'Your Rights',
    body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting our support team. You may also export your pet profiles and medical records.',
  },
  {
    heading: 'Contact Us',
    body: 'For privacy-related inquiries, contact us at privacy@petcare.pk or through the suggestion form on our platform.',
  },
];

export default function PrivacyPolicyPage() {
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
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Privacy Policy</h1>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-2xl text-muted-foreground">
        {SECTIONS.map((section) => (
          <section key={section.heading} className="mb-6">
            <h2 className="text-base font-bold text-foreground mb-2">{section.heading}</h2>
            <p className="text-sm leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
