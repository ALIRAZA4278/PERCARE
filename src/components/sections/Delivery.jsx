import { Truck, Shield, Headphones } from 'lucide-react';

export default function Delivery() {
  const deliveryFeatures = [
    { icon: Truck, label: 'Free Delivery', color: 'blue' },
    { icon: Shield, label: 'Tamper-Proof', color: 'blue' },
    { icon: Headphones, label: 'On-Spot Help', color: 'blue' },
  ];

  return (
    <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 mb-6 sm:mb-8 mx-4">
      <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Truck className="text-blue-600" size={20} className="sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1.5 sm:mb-2 text-base sm:text-lg">Free & Fast Delivery</h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            We deliver pet products right to your doorstep — quickly and free of charge. Our company takes full responsibility for every order. If anything arrives tampered with, broken, misplaced, or missing, our delivery rider will assist you on the spot and resolve the issue immediately.
          </p>
        </div>
      </div>

      {/* Delivery Features */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {deliveryFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.label} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
              <div className="flex justify-center mb-1.5 sm:mb-2">
                <Icon className="text-blue-600" size={20} className="sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">{feature.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
