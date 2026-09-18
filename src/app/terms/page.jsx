import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions — PetCare',
};

const SECTIONS = [
  {
    heading: '1. Acceptance of Terms',
    body: 'By accessing or using PetCare, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform.',
  },
  {
    heading: '2. Platform Services',
    body: 'PetCare provides veterinary discovery, pet product marketplace, shelter support, lost & found reporting, and pet management services. We act as an intermediary connecting users with verified service providers and sellers.',
  },
  {
    heading: '3. User Accounts',
    body: 'Users must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account credentials. Unauthorized use of accounts must be reported immediately.',
  },
  {
    heading: '4. Pet Selling Policy',
    body: 'Public pet selling is strictly prohibited on PetCare. Only company-owned and verified pets may be listed. This policy exists to protect animal welfare and prevent exploitation.',
  },
  {
    heading: '5. Marketplace & Orders',
    body: 'All sellers must be verified before listing products. PetCare provides buyer protection — if products arrive damaged, tampered, or missing, our team will resolve the issue. Medicine products require admin approval before listing.',
  },
  {
    heading: '6. Reviews & Content',
    body: 'Only verified users may leave reviews. PetCare reserves the right to moderate or remove reviews that violate community guidelines. All user-generated content must be truthful and respectful.',
  },
  {
    heading: '7. Limitation of Liability',
    body: "PetCare is not liable for the quality of veterinary services provided by third-party practitioners. We facilitate connections but do not provide medical advice. Always consult a licensed veterinarian for your pet's health concerns.",
  },
  {
    heading: '8. Changes to Terms',
    body: 'PetCare reserves the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.',
  },
];

export default function TermsPage() {
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
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Terms &amp; Conditions</h1>
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
