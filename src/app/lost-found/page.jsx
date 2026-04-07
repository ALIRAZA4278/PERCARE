'use client';

import { AlertTriangle, MapPin, Clock, Plus } from 'lucide-react';
import { useState } from 'react';
import ReportPetModal from '@/components/ReportPetModal';

export default function LostAndFoundPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const reports = [
    { id: 1, type: 'lost', species: 'Dog', breed: 'German Shepherd', name: 'Bruno', description: 'Brown and black, wearing a red collar. Very friendly.', location: 'Gulberg III, Lahore', timeAgo: '2 hours ago' },
    { id: 2, type: 'found', species: 'Cat', breed: 'Persian', name: 'Unknown Cat', description: 'White Persian cat found near park. No collar.', location: 'DHA Phase 5, Karachi', timeAgo: '5 hours ago' },
    { id: 3, type: 'lost', species: 'Bird', breed: 'Cockatiel', name: 'Coco', description: 'Grey cockatiel with orange cheeks. Responds to name.', location: 'F-7, Islamabad', timeAgo: '1 day ago' },
    { id: 4, type: 'found', species: 'Dog', breed: 'Labrador', name: 'Unknown Dog', description: 'Golden Labrador found in park. Very friendly, no tags.', location: 'Bahria Town, Lahore', timeAgo: '3 hours ago' },
    { id: 5, type: 'lost', species: 'Cat', breed: 'Siamese', name: 'Milo', description: 'Siamese cat with blue collar. Microchipped.', location: 'Clifton, Karachi', timeAgo: '6 hours ago' },
  ];

  const filteredReports = reports.filter(r => activeFilter === 'all' || r.type === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lost & Found</h1>
            <button onClick={() => setIsReportModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm sm:text-base">
              <Plus size={18} />
              <span className="hidden sm:inline">Report</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'lost', 'found'].map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 sm:px-5 py-2 rounded-lg font-medium text-sm transition-colors capitalize ${activeFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-4 sm:space-y-5">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex gap-4 sm:gap-5">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${report.type === 'lost' ? 'bg-red-100' : 'bg-green-100'}`}>
                  <AlertTriangle size={24} className={report.type === 'lost' ? 'text-red-600' : 'text-green-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${report.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{report.type}</span>
                    <span className="text-xs sm:text-sm text-gray-600">{report.species} · {report.breed}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{report.name}</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed">{report.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /><span>{report.location}</span></div>
                    <div className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /><span>{report.timeAgo}</span></div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm">Contact</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredReports.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600 mb-6">Try changing your filter or report a pet.</p>
            <button onClick={() => setIsReportModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2">
              <Plus size={20} />Report a Pet
            </button>
          </div>
        )}
      </div>
      <ReportPetModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </div>
  );
}
