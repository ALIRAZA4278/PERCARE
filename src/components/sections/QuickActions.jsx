import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { icon: AlertTriangle, bgColor: 'bg-yellow-50', iconColor: 'text-yellow-600', title: 'Lost or Found a Pet?', description: 'Report a lost pet or help reunite found animals with their owners.' },
    { emoji: '🚨', bgColor: 'bg-red-50', title: 'Report a Rescue', description: 'Spotted an abandoned or injured animal? Report it for rescue.' },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 px-4">
      {actions.map((action, index) => (
        <div
          key={index}
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 ${action.bgColor} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                {action.icon ? (
                  <action.icon className={action.iconColor} size={22} />
                ) : (
                  <span className="text-2xl sm:text-3xl">{action.emoji}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">{action.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{action.description}</p>
              </div>
            </div>
            <div className="text-gray-300 group-hover:text-gray-600 transition-colors flex-shrink-0">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
