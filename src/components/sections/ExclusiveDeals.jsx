import { Tag } from 'lucide-react';

export default function ExclusiveDeals() {
  const deals = [
    {
      badge: '🩺 VET DEALS',
      badgeColor: 'bg-green-100 text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      title: 'Up to 30% Off',
      description: 'On consultations & checkups at partner clinics',
    },
    {
      badge: '📦 PRODUCT DEALS',
      badgeColor: 'bg-blue-100 text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      title: 'Up to 40% Off',
      description: 'Premium food, toys & accessories',
    },
    {
      badge: '🐕 SHELTER IMPACT',
      badgeColor: 'bg-orange-100 text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      title: 'Rs. 3.2M+',
      description: 'Raised for shelters through our platform',
    },
  ];

  return (
    <div className="mb-6 sm:mb-8 px-4">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <Tag className="text-blue-600" size={20} className="sm:w-6 sm:h-6" />
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Exclusive Deals — Only on PetCare</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {deals.map((deal, index) => (
          <div key={index} className={`${deal.bgColor} ${deal.borderColor} rounded-xl sm:rounded-2xl p-5 sm:p-6 border hover:shadow-lg transition-shadow`}>
            <div className={`inline-block ${deal.badgeColor} text-xs font-semibold px-3 py-1.5 rounded-full mb-3`}>
              {deal.badge}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{deal.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{deal.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
