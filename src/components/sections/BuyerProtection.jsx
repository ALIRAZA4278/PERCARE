'use client';

import { BadgeCheck, RefreshCw, Shield } from 'lucide-react';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

export default function BuyerProtection() {
  const { marketplaceEnabled } = useFeatureFlags();
  if (!marketplaceEnabled) return null;

  return (
    <section className="px-4 md:px-8 pb-12 max-w-5xl mx-auto">
      <div className="rounded-2xl bg-vitality/5 border border-vitality/20 p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-vitality/10 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="h-5 w-5 text-vitality" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">100% Buyer Protection</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Every product on our platform is backed by our accountability guarantee. We only allow
              verified sellers and companies to list products — so you can shop with complete
              confidence.
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-vitality">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified Sellers Only
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-vitality">
                <Shield className="h-3.5 w-3.5" /> Full Accountability
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-vitality">
                <RefreshCw className="h-3.5 w-3.5" /> Easy Returns
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
