import { Sparkles, Send } from 'lucide-react';

export default function AINameGenerator() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <Sparkles className="text-blue-600" size={24} />
        <h3 className="font-bold text-xl text-gray-900">AI Pet Name Generator</h3>
      </div>
      <p className="text-gray-600 text-sm mb-5 leading-relaxed">
        Tell us about your pet — species, personality, color — and we'll suggest the perfect name.
      </p>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="e.g. playful golden puppy, calm grey kitten..."
          className="flex-1 px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Send size={18} />
          Generate
        </button>
      </div>
    </div>
  );
}
