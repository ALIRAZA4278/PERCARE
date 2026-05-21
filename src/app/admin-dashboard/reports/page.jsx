'use client';

import { CheckCircle, XCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['All', 'pending', 'investigating', 'resolved', 'dismissed'];

const statusColor = {
  pending: 'bg-orange-50 text-orange-600',
  investigating: 'bg-blue-50 text-blue-600',
  resolved: 'bg-green-50 text-green-600',
  dismissed: 'bg-gray-100 text-gray-500',
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [activeStatus, setActiveStatus] = useState('All');
  const [resolveModal, setResolveModal] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    const { data } = await supabase
      .from('reports')
      .select('*, reporter:profiles!reporter_id(full_name, email)')
      .order('created_at', { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  const logAudit = async (action, targetId, details) => {
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id, action, target_type: 'report', target_id: targetId, details,
    });
  };

  const handleResolve = async (status) => {
    if (!resolveModal) return;
    setProcessing(true);
    await supabase.from('reports').update({
      status, admin_notes: adminNotes || null,
      resolved_by: user.id, resolved_at: new Date().toISOString(),
    }).eq('id', resolveModal.id);
    await logAudit(`report_${status}`, resolveModal.id, adminNotes || `Marked as ${status}`);
    setReports(prev => prev.map(r => r.id === resolveModal.id ? { ...r, status } : r));
    setResolveModal(null); setAdminNotes(''); setProcessing(false);
  };

  const filtered = activeStatus === 'All' ? reports : reports.filter(r => r.status === activeStatus);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-600 mt-1">{reports.filter(r => r.status === 'pending').length} pending reports</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_TABS.map(s => {
          const count = s === 'All' ? reports.length : reports.filter(r => r.status === s).length;
          return (
            <button key={s} onClick={() => setActiveStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors capitalize flex items-center gap-1.5 ${
                activeStatus === s ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {s} <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeStatus === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-gray-500 text-sm">No reports in this category</p>
          </div>
        ) : filtered.map((report) => (
          <div key={report.id} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-gray-900 capitalize text-sm">{report.reason?.replace(/_/g, ' ')}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor[report.status] || 'bg-gray-100 text-gray-500'}`}>
                    {report.status}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full capitalize">
                    {report.target_type}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Reported by: {report.reporter?.full_name || 'Anonymous'} · {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                {report.description && <p className="text-sm text-gray-700 mt-2">{report.description}</p>}
                {report.admin_notes && <p className="text-xs text-gray-500 mt-2 italic">Admin note: {report.admin_notes}</p>}
              </div>
              {report.status === 'pending' || report.status === 'investigating' ? (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setResolveModal(report)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg border border-green-200 transition-colors">
                    <CheckCircle size={12} /> Resolve
                  </button>
                  <button onClick={async () => {
                    setProcessing(true);
                    await supabase.from('reports').update({ status: 'dismissed', resolved_by: user.id, resolved_at: new Date().toISOString() }).eq('id', report.id);
                    await logAudit('report_dismissed', report.id, 'Dismissed');
                    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'dismissed' } : r));
                    setProcessing(false);
                  }} disabled={processing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors">
                    <XCircle size={12} /> Dismiss
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setResolveModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Resolve Report</h3>
                <button onClick={() => setResolveModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add admin notes (optional)..." rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-red-400 text-sm resize-none mb-4" />
              <button onClick={() => handleResolve('resolved')} disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                {processing ? 'Resolving...' : 'Mark as Resolved'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
