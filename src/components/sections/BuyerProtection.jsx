import { CheckCircle } from 'lucide-react';

export default function BuyerProtection() {
  const features = [
    'Verified Sellers Only',
    'Full Accountability',
    'Easy Returns',
  ];

  return (
    <div className="bg-green-50 rounded-2xl p-6 mb-6 border border-green-100">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🛡️</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-2 text-lg">100% Buyer Protection</h3>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            Every product on our platform is backed by our accountability guarantee. We only allow verified sellers and companies to list products — so you can shop with complete confidence.
          </p>
          <div className="flex items-center gap-8 text-sm">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-green-700">
                <CheckCircle size={16} className="text-green-600" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
