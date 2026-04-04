import { BookOpen, ArrowRight } from 'lucide-react';

export default function PetInsider() {
  const articles = [
    {
      emoji: '🐾',
      badge: 'Getting Started',
      badgeColor: 'bg-purple-50 text-purple-700',
      title: 'What to Consider When Choosing a New Pet',
    },
    {
      emoji: '🦁',
      badge: 'Training',
      badgeColor: 'bg-orange-50 text-orange-700',
      title: 'Tips for Training Your Cat',
    },
    {
      emoji: '🐕',
      badge: 'Health',
      badgeColor: 'bg-green-50 text-green-700',
      title: 'How to Keep Your Dog Healthy',
    },
    {
      emoji: '💉',
      badge: 'Health',
      badgeColor: 'bg-blue-50 text-blue-700',
      title: 'Understanding Pet Vaccinations',
    },
  ];

  return (
    <div className="mb-6 sm:mb-8 px-4">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <BookOpen className="text-blue-600" size={20} className="sm:w-6 sm:h-6" />
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Pet Insider</h2>
        </div>
        <button className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 text-xs sm:text-sm transition-colors">
          View All
          <ArrowRight size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {articles.map((article, index) => (
          <div
            key={index}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">{article.emoji}</div>
            <div className={`inline-block ${article.badgeColor} text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full mb-2 sm:mb-3`}>
              {article.badge}
            </div>
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-snug">{article.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
