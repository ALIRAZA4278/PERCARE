'use client';

import { Search, Check, X, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
  completed: 'bg-blue-50 text-blue-700',
};

export default function ShelterAdoptionsPage() {
  const { user } = useAuth();
  const [shelter, setShelter] = useState(null);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [viewReq, setViewReq] = useState(null);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: s } = await supabase.from('shelters').select('*').eq('owner_id', user.id).single();
    setShelter(s);
    if (!s) { setLoading(false); return; }
    const { data } = await supabase.from('adoption_requests')
      .select('*, adopter:profiles!requester_id(full_name, email, phone), animal:shelter_animals(name, species, breed, image_url)')
      .eq('shelter_id', s.id).order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  const handleAction = async (id, status) => {
    await supabase.from('adoption_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    if (viewReq?.id === id) setViewReq(v => ({ ...v, status }));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  const filtered = requests.filter(r => {
    const matchSearch = !search.trim() || (r.adopter?.full_name || '').toLowerCase().includes(search.toLowerCase()) || (r.animal?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || r.status === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Adoptions</h1>
        <p className="text-sm text-gray-600 mt-1">Review and manage adoption requests</p>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { value: statCounts.pending, label: 'Pending', color: 'text-yellow-600' },
          { value: statCounts.approved, label: 'Approved', color: 'text-green-600' },
          { value: statCounts.completed, label: 'Completed', color: 'text-blue-600' },
          { value: statCounts.rejected, label: 'Rejected', color: 'text-red-600' },
        ].map(({ value, label, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs sm:text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative max-w-lg">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by adopter or animal..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-sm text-gray-900 bg-white" />
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Approved', 'Rejected', 'Completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === f ? 'bg-teal-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((req) => (
          <div key={req.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold shrink-0">
                {req.adopter?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-gray-900 text-sm">{req.adopter?.full_name || 'Adopter'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>{req.status}</span>
                </div>
                <p className="text-xs text-gray-500">Wants to adopt: {req.animal?.name} ({req.animal?.species})</p>
                <p className="text-xs text-gray-400">{formatDate(req.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {req.status === 'pending' && (
                <>
                  <button onClick={() => handleAction(req.id, 'approved')}
                    className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                    <Check size={12} /> Approve
                  </button>
                  <button onClick={() => handleAction(req.id, 'rejected')}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                    <X size={12} /> Reject
                  </button>
                </>
              )}
              <button onClick={() => setViewReq(req)} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                <Eye size={12} /> Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16"><div className="text-6xl mb-4">❤️</div><h3 className="text-xl font-bold text-gray-900 mb-2">No adoption requests</h3><p className="text-gray-600">Requests will appear here when people apply to adopt.</p></div>
      )}

      {viewReq && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setViewReq(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Adoption Details</h2>
                <button onClick={() => setViewReq(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} className="text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-teal-600 mb-0.5">Adopter</p><p className="font-semibold text-gray-900 text-sm">{viewReq.adopter?.full_name || '—'}</p></div>
                  <div><p className="text-xs text-teal-600 mb-0.5">Status</p><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[viewReq.status]}`}>{viewReq.status}</span></div>
                </div>
                <div><p className="text-xs text-teal-600 mb-0.5">Email</p><p className="font-semibold text-gray-900 text-sm">{viewReq.adopter?.email || '—'}</p></div>
                <div><p className="text-xs text-teal-600 mb-0.5">Phone</p><p className="font-semibold text-gray-900 text-sm">{viewReq.adopter?.phone || '—'}</p></div>
                <div><p className="text-xs text-teal-600 mb-0.5">Animal</p><p className="font-semibold text-gray-900 text-sm">{viewReq.animal?.name} · {viewReq.animal?.species}{viewReq.animal?.breed ? ` · ${viewReq.animal.breed}` : ''}</p></div>
                {viewReq.notes && <div><p className="text-xs text-teal-600 mb-0.5">Notes</p><p className="text-sm text-gray-700">{viewReq.notes}</p></div>}
                <div><p className="text-xs text-teal-600 mb-0.5">Date</p><p className="font-semibold text-gray-900 text-sm">{formatDate(viewReq.created_at)}</p></div>
                {viewReq.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleAction(viewReq.id, 'approved')} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Approve</button>
                    <button onClick={() => handleAction(viewReq.id, 'rejected')} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Reject</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
