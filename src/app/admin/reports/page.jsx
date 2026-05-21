'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['All', 'pending', 'investigating', 'resolved', 'dismissed'];

const statusBadge = {
  pending: 'bg-orange-950 text-orange-400',
  investigating: 'bg-blue-900 text-blue-400',
  resolved: 'bg-green-950 text-green-400',
  dismissed: 'bg-gray-800 text-gray-400',
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [resolveModal, setResolveModal] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => { fetchReports(); }, []);

  useEffect(() => {
    setFiltered(tab === 'All' ? reports : reports.filter(r => r.status === tab));
  }, [reports, tab]);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*, reporter:profiles!reporter_id(full_name)')
      .order('created_at', { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  const logAudit = (action, targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target_type: 'report', target_id: targetId, details });

  const handleResolve = async () => {
    if (!resolveModal) return;
    setProcessing(resolveModal.id);
    await supabase.from('reports').update({
      status: 'resolved',
      admin_notes: adminNotes,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    }).eq('id', resolveModal.id);
    await logAudit('resolve_report', resolveModal.id, adminNotes || 'Resolved');
    setReports(prev => prev.map(r => r.id === resolveModal.id ? { ...r, status: 'resolved', admin_notes: adminNotes } : r));
    setResolveModal(null); setAdminNotes(''); setProcessing(null);
  };

  const handleDismiss = async (report) => {
    setProcessing(report.id);
    await supabase.from('reports').update({ status: 'dismissed' }).eq('id', report.id);
    await logAudit('dismiss_report', report.id, `Dismissed report: ${report.reason}`);
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'dismissed' } : r));
    setProcessing(null);
  };

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'All' ? reports.length : reports.filter(r => r.status === s).length;
    return acc;
  }, {});

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">{reports.length} total reports</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${tab === s ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {counts[s] > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === s ? 'bg-white/20' : 'bg-gray-800 text-gray-400'}`}>{counts[s]}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-500 text-sm">No reports in this category</p>
          </div>
        ) : filtered.map(report => (
          <div key={report.id} className="bg-gray-900 rounded-xl p-4 sm:p-5 border border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[report.status] || 'bg-gray-800 text-gray-400'}`}>{report.status}</span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full capitalize">{report.target_type}</span>
                </div>
                <p className="text-white font-semibold capitalize">{report.reason?.replace(/_/g, ' ')}</p>
                {report.description && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{report.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>By: {report.reporter?.full_name || 'Anonymous'}</span>
                  <span>{report.created_at ? new Date(report.created_at).toLocaleDateString() : '—'}</span>
                </div>
                {report.admin_notes && (
                  <p className="text-xs text-green-400 mt-2 bg-green-950/30 px-3 py-1.5 rounded-lg border border-green-900/40">Notes: {report.admin_notes}</p>
                )}
              </div>
              {(report.status === 'pending' || report.status === 'investigating') && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setResolveModal(report)} disabled={processing === report.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/40 hover:bg-green-800/40 text-green-400 text-xs font-semibold rounded-lg transition-colors border border-green-900 disabled:opacity-50">
                    <CheckCircle size={13} /> Resolve
                  </button>
                  <button onClick={() => handleDismiss(report)} disabled={processing === report.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-semibold rounded-lg transition-colors border border-gray-700 disabled:opacity-50">
                    <XCircle size={13} /> Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {resolveModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => { setResolveModal(null); setAdminNotes(''); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Resolve Report</h3>
                <button onClick={() => { setResolveModal(null); setAdminNotes(''); }} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400"><X size={18} /></button>
              </div>
              <p className="text-sm text-gray-500 mb-3 capitalize">{resolveModal.reason?.replace(/_/g, ' ')}</p>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add admin notes (optional)..." rows={4}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-green-500 text-white text-sm resize-none mb-4 placeholder-gray-600" />
              <div className="flex gap-2">
                <button onClick={handleResolve} disabled={processing === resolveModal.id}
                  className="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-green-900 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {processing === resolveModal.id ? 'Processing...' : 'Mark Resolved'}
                </button>
                <button onClick={() => { setResolveModal(null); setAdminNotes(''); }}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
