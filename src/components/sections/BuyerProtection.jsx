import { CheckCircle } from 'lucide-react';

export default function BuyerProtection() {
  const features = ['Verified Sellers Only', 'Full Accountability', 'Easy Returns'];

  return (
    <div className="bg-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6 border border-green-100 mx-4">
      <div className="flex gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xl sm:text-2xl">🛡️</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1.5 sm:mb-2 text-base sm:text-lg">100% Buyer Protection</h3>
          <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 leading-relaxed">
            Every product on our platform is backed by our accountability guarantee. We only allow verified sellers and companies to list products — so you can shop with complete confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 text-xs sm:text-sm">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-green-700">
                <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
