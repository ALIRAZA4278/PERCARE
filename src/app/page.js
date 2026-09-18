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

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
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
    </div>
  );
}
