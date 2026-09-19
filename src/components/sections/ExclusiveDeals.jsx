'use client';

import { HandHeart, ShoppingBag, Stethoscope, Tag, TriangleAlert } from 'lucide-react';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { gridCols } from '@/lib/gridCols';

export default function ExclusiveDeals() {
  const { marketplaceEnabled, sheltersEnabled } = useFeatureFlags();

  // The reference sizes this grid off the count of optional cards, not the
  // rendered total — 2 fixed cards plus whichever flags are on.
  const count = 2 + (marketplaceEnabled ? 1 : 0) + (sheltersEnabled ? 1 : 0);

  return (
    <section className="px-4 md:px-8 pb-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-2.5 mb-4">
        <Tag className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground text-base">
          Exclusive Deals — Only on PetCare
        </h3>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols(count)} gap-3`}>
        <div className="p-4 rounded-2xl bg-vitality/5 border border-vitality/15">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="h-4 w-4 text-vitality" />
            <span className="text-xs font-bold text-vitality uppercase tracking-wider">
              Vet Deals
            </span>
          </div>
          <p className="text-xl font-extrabold text-foreground tabular-nums">Up to 30% Off</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            On consultations &amp; checkups at partner clinics
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber/5 border border-amber/15">
          <div className="flex items-center gap-2 mb-2">
            <TriangleAlert className="h-4 w-4 text-amber" />
            <span className="text-xs font-bold text-amber uppercase tracking-wider">
              Lost &amp; Found
            </span>
          </div>
          <p className="text-xl font-extrabold text-foreground tabular-nums">Free Alerts</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Community-wide alerts to help reunite pets fast
          </p>
        </div>

        {marketplaceEnabled && (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Product Deals
              </span>
            </div>
            <p className="text-xl font-extrabold text-foreground tabular-nums">Up to 40% Off</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Premium food, toys &amp; accessories
            </p>
          </div>
        )}

        {sheltersEnabled && (
          <div className="p-4 rounded-2xl bg-amber/5 border border-amber/15">
            <div className="flex items-center gap-2 mb-2">
              <HandHeart className="h-4 w-4 text-amber" />
              <span className="text-xs font-bold text-amber uppercase tracking-wider">
                Shelter Impact
              </span>
            </div>
            <p className="text-xl font-extrabold text-foreground tabular-nums">Rs. 3.2M+</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Raised for shelters through our platform
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
