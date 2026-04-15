'use client';

import { AlertTriangle, MapPin, Clock, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import ReportPetModal from '@/components/ReportPetModal';

export default function LostAndFoundPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data } = await supabase
      .from('lost_found_pets')
      .select('*, reporter:profiles(full_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  const handleSubmitReport = async (formData) => {
    if (!user) return;
    const { error } = await supabase.from('lost_found_pets').insert({
      reporter_id: user.id,
      type: formData.type,
      pet_name: formData.pet_name,
      species: formData.species,
      breed: formData.breed || null,
      color: formData.color || null,
      last_seen_location: formData.last_seen_location,
      last_seen_date: formData.last_seen_date || null,
      city: formData.city,
      contact_phone: formData.contact_phone,
      contact_email: formData.contact_email || null,
      description: formData.description,
    });
    if (error) throw error;
    fetchReports();
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const filteredReports = reports.filter(r => activeFilter === 'all' || r.type === activeFilter);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lost & Found</h1>
            <button onClick={() => setIsReportModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm sm:text-base">
              <Plus size={18} /><span className="hidden sm:inline">Report</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'lost', 'found'].map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 sm:px-5 py-2 rounded-lg font-medium text-sm transition-colors capitalize ${activeFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {f}
              </button>
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
                    <span className="text-xs sm:text-sm text-gray-600 capitalize">{report.species} {report.breed ? `· ${report.breed}` : ''}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{report.pet_name || 'Unknown Pet'}</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed">{report.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /><span>{report.last_seen_location}{report.city ? `, ${report.city}` : ''}</span></div>
                    <div className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /><span>{getTimeAgo(report.created_at)}</span></div>
                  </div>
                  {report.contact_phone && (
                    <a href={`tel:${report.contact_phone}`} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm inline-block">Contact</a>
                  )}
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
      <ReportPetModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSubmit={handleSubmitReport} />
    </div>
  );
}
