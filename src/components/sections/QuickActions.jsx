'use client';

import { ArrowRight, Siren, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

export default function QuickActions() {
  const { sheltersEnabled } = useFeatureFlags();

  return (
    <>
      <section className="px-4 md:px-8 pb-8 max-w-5xl mx-auto space-y-3">
        <Link
          href="/lost-found"
          className="group flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-amber/40 transition-expo btn-press"
        >
          <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center shrink-0">
            <TriangleAlert className="h-6 w-6 text-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">Lost or Found a Pet?</h3>
            <p className="text-xs text-muted-foreground">
              Report a lost pet or help reunite found animals with their owners.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber group-hover:translate-x-1 transition-all shrink-0" />
        </Link>

        {sheltersEnabled && (
          <Link
            href="/shelters"
            className="group flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-emergency/40 transition-expo btn-press"
          >
            <div className="w-12 h-12 rounded-xl bg-emergency/10 flex items-center justify-center shrink-0">
              <Siren className="h-6 w-6 text-emergency" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">Report a Rescue</h3>
              <p className="text-xs text-muted-foreground">
                Spotted an abandoned or injured animal? Report it for rescue.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-emergency group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        )}
      </section>

      <section className="px-4 md:px-8 pb-12 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/faq" className="hover:text-foreground transition-colors">
            FAQ
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms &amp; Conditions
          </Link>
          <span>·</span>
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </section>
    </>
  );
}
