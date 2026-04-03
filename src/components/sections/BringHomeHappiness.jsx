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
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-8 overflow-hidden relative border border-purple-100">
      <div className="grid grid-cols-2 gap-10">
        <div className="relative z-10">
          <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            💚 NEW FEATURE
          </div>
          <h2 className="text-4xl font-bold mb-3 leading-tight">
            Bring Home Happiness,{' '}
            <span className="text-blue-600">Safely.</span>
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed text-sm">
            Healthy, vaccinated pets delivered with care, love, and a 100-day guarantee. 
            Everything your new companion needs — from food to a cozy home.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((feature) => (
              <div key={feature.text} className="flex items-center gap-2.5 text-sm">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={14} className="text-blue-600" />
                </div>
                <span className="text-gray-800 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
              Browse Pets
              <ArrowRight size={18} />
            </button>
            <button className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
              How it Works
            </button>
          </div>
        </div>

        {/* Pet Images Placeholder */}
        <div className="relative flex items-center justify-center">
          <div className="text-9xl opacity-90">
            🐕🐱🦜🐠
          </div>
        </div>
      </div>
    </div>
  );
}
