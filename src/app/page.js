import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Stats from '@/components/sections/Stats';
import BuyerProtection from '@/components/sections/BuyerProtection';
import Delivery from '@/components/sections/Delivery';
import ExclusiveDeals from '@/components/sections/ExclusiveDeals';
import BringHomeHappiness from '@/components/sections/BringHomeHappiness';
import AINameGenerator from '@/components/sections/AINameGenerator';
import PetInsider from '@/components/sections/PetInsider';
import HelpUsImprove from '@/components/sections/HelpUsImprove';
import QuickActions from '@/components/sections/QuickActions';

// No page-level container: every section sets its own px-4 md:px-8 and
// max-w-5xl, matching the reference. A wrapper here would double the gutters.
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Stats />
      <BuyerProtection />
      <Delivery />
      <ExclusiveDeals />
      <BringHomeHappiness />
      <AINameGenerator />
      <PetInsider />
      <HelpUsImprove />
      <QuickActions />
    </div>
  );
}
