'use client';

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

export default function HelpUsImprove() {
  const [activeTab, setActiveTab] = useState('General');
  const tabs = ['General', 'Feature', 'Bug', 'Design'];

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 mb-6 sm:mb-8 hover:shadow-md transition-shadow mx-4">
      <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
        <MessageSquare className="text-blue-600" size={20} />
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Help Us Improve</h2>
      </div>
      <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed">
        Got an idea to make PetCare better? We'd love to hear from you.
      </p>

      <div className="flex flex-wrap gap-2 mb-4 sm:mb-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <textarea
        placeholder="Tell us what you'd like to see improved..."
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none mb-3 sm:mb-4 text-xs sm:text-sm"
        rows={4}
      />

      <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm sm:text-base">
        <Send size={16} />
        Submit Suggestion
      </button>
    </div>
  );
}
