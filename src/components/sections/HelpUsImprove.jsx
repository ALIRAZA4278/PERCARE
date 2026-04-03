'use client';

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

export default function HelpUsImprove() {
  const [activeTab, setActiveTab] = useState('General');
  const tabs = ['General', 'Feature', 'Bug', 'Design'];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <MessageSquare className="text-blue-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Help Us Improve</h2>
      </div>
      <p className="text-gray-600 text-sm mb-5 leading-relaxed">
        Got an idea to make PetCare better? We'd love to hear from you.
      </p>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-medium px-4 py-2 rounded-lg transition-colors text-sm ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        placeholder="Tell us what you'd like to see improved..."
        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none mb-4 text-sm"
        rows={4}
      />

      {/* Submit Button */}
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
        <Send size={18} />
        Submit Suggestion
      </button>
    </div>
  );
}
