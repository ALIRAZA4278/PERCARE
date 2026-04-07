import { CheckCircle, ArrowRight } from 'lucide-react';

export default function BringHomeHappiness() {
  const features = [
    { icon: '🩺', text: 'Vet-Checked & Healthy' },
    { icon: '🛡️', text: '100-Day Guarantee' },
    { icon: '🍖', text: 'Starter Food Included' },
    { icon: '🏠', text: 'Safe Home Delivery' },
    { icon: '📞', text: '24/7 Vet Support' },
    { icon: '💉', text: 'Free Vaccination' },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 overflow-hidden relative border border-purple-100 mx-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        <div className="relative z-10">
          <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full mb-3 sm:mb-4">
            💚 NEW FEATURE
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 leading-tight">
            Bring Home Happiness,{' '}
            <span className="text-blue-600">Safely.</span>
          </h2>
          <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm">
            Healthy, vaccinated pets delivered with care, love, and a 100-day guarantee.
            Everything your new companion needs — from food to a cozy home.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            {features.map((feature) => (
              <div key={feature.text} className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={12} className="text-blue-600" />
                </div>
                <span className="text-gray-800 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm sm:text-base">
              Browse Pets
              <ArrowRight size={16} />
            </button>
            <button className="text-gray-700 font-medium hover:text-gray-900 transition-colors text-sm sm:text-base text-center sm:text-left">
              How it Works
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="text-6xl sm:text-7xl lg:text-9xl opacity-90">
            🐕🐱🦜🐠
          </div>
        </div>
      </div>
    </div>
  );
}
