import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      title: 'Lost or Found a Pet?',
      description: 'Report a lost pet or help reunite found animals with their owners.',
    },
    {
      emoji: '🚨',
      bgColor: 'bg-red-50',
      title: 'Report a Rescue',
      description: 'Spotted an abandoned or injured animal? Report it for rescue.',
    },
  ];

  return (
    <div className="space-y-4 mb-8">
      {actions.map((action, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${action.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {action.icon ? (
                  <action.icon className={action.iconColor} size={26} />
                ) : (
                  <span className="text-3xl">{action.emoji}</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-base">{action.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
              </div>
            </div>
            <div className="text-gray-300 group-hover:text-gray-600 transition-colors">
              <ArrowRight size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
