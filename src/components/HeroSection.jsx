'use client';

import { Search, Stethoscope, ShoppingBag, Heart, AlertTriangle, MapPin } from 'lucide-react';

export default function HeroSection() {
  const features = [
    {
      icon: Stethoscope,
      title: 'Find Vets',
      description: 'Discover trusted veterinarians and clinics near you',
      color: 'blue',
    },
    {
      icon: ShoppingBag,
      title: 'Pet Shop',
      description: 'Quality pet products from verified sellers',
      color: 'green',
    },
    {
      icon: Heart,
      title: 'Shelters',
      description: 'Adopt, donate, and support animal welfare',
      color: 'red',
    },
    {
      icon: AlertTriangle,
      title: 'Lost & Found',
      description: 'Report lost pets or help reunite found animals',
      color: 'yellow',
    },
  ];

  const stats = [
    { number: '500+', label: 'Verified Vets', color: 'blue', icon: Stethoscope },
    { number: '120+', label: 'Clinics', color: 'green', icon: ShoppingBag },
    { number: '2,000+', label: 'Products', color: 'yellow', icon: ShoppingBag },
    { number: '50+', label: 'Shelters', color: 'red', icon: Heart },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero Content */}
      <div className="text-center mb-12">
        <p className="text-blue-600 text-sm font-semibold mb-4 uppercase tracking-wide">
          Pakistan's Trusted Pet Ecosystem
        </p>
        <h1 className="text-5xl font-bold mb-4">
          Better care for your best friend.
        </h1>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Discover veterinarians, shop for pet products, adopt from shelters, 
          and manage your pet's health — all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
            <Search size={18} />
            Find a Vet
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <div className="flex items-center gap-3 bg-white rounded-full border border-gray-200 px-6 py-3 shadow-sm">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search vets, clinics, products..."
              className="flex-1 outline-none text-gray-700"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-full flex items-center gap-2 transition-colors">
              <MapPin size={16} />
              Near me
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          const bgColors = {
            blue: 'bg-blue-50',
            green: 'bg-green-50',
            red: 'bg-red-50',
            yellow: 'bg-yellow-50',
          };
          const iconColors = {
            blue: 'text-blue-600',
            green: 'text-green-600',
            red: 'text-red-600',
            yellow: 'text-yellow-600',
          };
          return (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
            >
              <div className={`w-12 h-12 ${bgColors[feature.color]} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className={iconColors[feature.color]} size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const bgColors = {
            blue: 'bg-blue-50',
            green: 'bg-green-50',
            red: 'bg-red-50',
            yellow: 'bg-yellow-50',
          };
          const iconColors = {
            blue: 'text-blue-200',
            green: 'text-green-200',
            red: 'text-red-200',
            yellow: 'text-yellow-200',
          };
          return (
            <div
              key={stat.label}
              className={`${bgColors[stat.color]} rounded-xl p-6 relative overflow-hidden`}
            >
              <div className={`absolute top-4 right-4 ${iconColors[stat.color]}`}>
                <Icon size={40} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Buyer Protection */}
      <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-100">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🛡️</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">100% Buyer Protection</h3>
            <p className="text-sm text-gray-700 mb-4">
              Every product on our platform is backed by our accountability guarantee. We only allow verified sellers and companies to list products — so you can shop with complete confidence.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-green-600">✓</span>
                <span>Verified Sellers Only</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-green-600">✓</span>
                <span>Full Accountability</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-green-600">✓</span>
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free & Fast Delivery */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-8">
        <div className="flex gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🚚</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Free & Fast Delivery</h3>
            <p className="text-sm text-gray-700">
              We deliver pet products right to your doorstep — quickly and free of charge. Our company takes full responsibility for every order. If anything arrives tampered with, broken, misplaced, or missing, our delivery rider will assist you on the spot and resolve the issue immediately.
            </p>
          </div>
        </div>

        {/* Delivery Features */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-blue-600 mb-2">🚚</div>
            <p className="text-sm font-medium text-gray-900">Free Delivery</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-blue-600 mb-2">🔒</div>
            <p className="text-sm font-medium text-gray-900">Tamper-Proof</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-blue-600 mb-2">🤝</div>
            <p className="text-sm font-medium text-gray-900">On-Spot Help</p>
          </div>
        </div>
      </div>

      {/* Exclusive Deals */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏷️</span>
          <h2 className="text-2xl font-bold">Exclusive Deals — Only on PetCare</h2>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              🩺 VET DEALS
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Up to 30% Off</h3>
            <p className="text-sm text-gray-600">On consultations & checkups at partner clinics</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              📦 PRODUCT DEALS
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Up to 40% Off</h3>
            <p className="text-sm text-gray-600">Premium food, toys & accessories</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
            <div className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              🐕 SHELTER IMPACT
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Rs. 3.2M+</h3>
            <p className="text-sm text-gray-600">Raised for shelters through our platform</p>
          </div>
        </div>
      </div>

      {/* Bring Home Happiness Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 overflow-hidden relative">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              💚 NEW FEATURE
            </div>
            <h2 className="text-4xl font-bold mb-2">
              Bring Home Happiness,{' '}
              <span className="text-blue-600">Safely.</span>
            </h2>
            <p className="text-gray-600 mb-6">
              Healthy, vaccinated pets delivered with care, love, and a 100-day guarantee. 
              Everything your new companion needs — from food to a cozy home.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs">✓</span>
                </div>
                <span className="text-gray-700">Vet-Checked & Healthy</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs">✓</span>
                </div>
                <span className="text-gray-700">100-Day Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs">✓</span>
                </div>
                <span className="text-gray-700">Starter Food Included</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs">✓</span>
                </div>
                <span className="text-gray-700">Safe Home Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs">✓</span>
                </div>
                <span className="text-gray-700">24/7 Vet Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs">✓</span>
                </div>
                <span className="text-gray-700">Free Vaccination</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                Browse Pets
                <span>→</span>
              </button>
              <button className="text-gray-700 font-medium hover:text-gray-900">
                How it Works
              </button>
            </div>
          </div>

          {/* Pet Images */}
          <div className="relative">
            <div className="text-8xl">🐕🐱🦜🐠</div>
          </div>
        </div>
      </div>

      {/* AI Pet Name Generator */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-blue-600">✨</div>
          <h3 className="font-semibold text-xl">AI Pet Name Generator</h3>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Tell us about your pet — species, personality, color — and we'll suggest the perfect name.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. playful golden puppy, calm grey kitten..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
            <span>🚀</span>
            Generate
          </button>
        </div>
      </div>

      {/* Pet Insider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-blue-600 text-2xl">📖</div>
            <h2 className="text-2xl font-bold">Pet Insider</h2>
          </div>
          <button className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
            View All
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">🐾</div>
            <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Getting Started
            </div>
            <h3 className="font-semibold text-gray-900">What to Consider When Choosing a New Pet</h3>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">🦁</div>
            <div className="inline-block bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Training
            </div>
            <h3 className="font-semibold text-gray-900">Tips for Training Your Cat</h3>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">🐕</div>
            <div className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Health
            </div>
            <h3 className="font-semibold text-gray-900">How to Keep Your Dog Healthy</h3>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">💉</div>
            <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Health
            </div>
            <h3 className="font-semibold text-gray-900">Understanding Pet Vaccinations</h3>
          </div>
        </div>
      </div>

      {/* Help Us Improve */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-blue-600 text-2xl">💬</div>
          <h2 className="text-2xl font-bold">Help Us Improve</h2>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Got an idea to make PetCare better? We'd love to hear from you.
        </p>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6">
          <button className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg">
            General
          </button>
          <button className="bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-200">
            Feature
          </button>
          <button className="bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-200">
            Bug
          </button>
          <button className="bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-200">
            Design
          </button>
        </div>

        {/* Textarea */}
        <textarea
          placeholder="Tell us what you'd like to see improved..."
          className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none mb-4"
          rows={4}
        />

        {/* Submit Button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
          <span>🚀</span>
          Submit Suggestion
        </button>
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-4 mb-8">
        {/* Lost or Found a Pet */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-yellow-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Lost or Found a Pet?</h3>
                <p className="text-sm text-gray-600">Report a lost pet or help reunite found animals with their owners.</p>
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
              <span className="text-2xl">→</span>
            </div>
          </div>
        </div>

        {/* Report a Rescue */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <span className="text-red-600 text-2xl">🚨</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Report a Rescue</h3>
                <p className="text-sm text-gray-600">Spotted an abandoned or injured animal? Report it for rescue.</p>
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
              <span className="text-2xl">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-gray-900 transition-colors">FAQ</a>
          <span className="text-gray-300">·</span>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms & Conditions</a>
          <span className="text-gray-300">·</span>
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
