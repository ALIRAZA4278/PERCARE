import { Sparkles, Send } from 'lucide-react';

export default function AINameGenerator() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 mb-6 sm:mb-8 hover:shadow-md transition-shadow mx-4">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <Sparkles className="text-blue-600" size={20} className="sm:w-6 sm:h-6" />
        <h3 className="font-bold text-lg sm:text-xl text-gray-900">AI Pet Name Generator</h3>
      </div>
      <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed">
        Tell us about your pet — species, personality, color — and we'll suggest the perfect name.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          type="text"
          placeholder="e.g. playful golden puppy, calm grey kitten..."
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-xs sm:text-sm"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm sm:text-base">
          <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
          Generate
        </button>
      </div>
    </div>
  );
}
