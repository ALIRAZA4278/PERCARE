'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['All', 'pending', 'investigating', 'resolved', 'dismissed'];

const statusBadge = {
  pending: 'bg-amber/10 text-amber',
  investigating: 'bg-primary/10 text-primary',
  resolved: 'bg-vitality/10 text-vitality',
  dismissed: 'bg-muted text-muted-foreground',
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

  if (loading) return <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">{reports.length} total reports</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${tab === s ? 'bg-primary text-white' : 'bg-card text-muted-foreground border border-border hover:border-border'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {counts[s] > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === s ? 'bg-card/20' : 'bg-muted text-muted-foreground'}`}>{counts[s]}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-muted-foreground text-sm">No reports in this category</p>
          </div>
        ) : filtered.map(report => (
          <div key={report.id} className="bg-card rounded-xl p-4 sm:p-5 border border-border">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[report.status] || 'bg-muted text-muted-foreground'}`}>{report.status}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full capitalize">{report.target_type}</span>
                </div>
                <p className="text-foreground font-semibold capitalize">{report.reason?.replace(/_/g, ' ')}</p>
                {report.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>By: {report.reporter?.full_name || 'Anonymous'}</span>
                  <span>{report.created_at ? new Date(report.created_at).toLocaleDateString() : '—'}</span>
                </div>
                {report.admin_notes && (
                  <p className="text-xs text-vitality mt-2 bg-vitality/10 px-3 py-1.5 rounded-lg border border-vitality/20">Notes: {report.admin_notes}</p>
                )}
              </div>
              {(report.status === 'pending' || report.status === 'investigating') && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setResolveModal(report)} disabled={processing === report.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-vitality/10 hover:bg-vitality/10 text-vitality text-xs font-semibold rounded-lg transition-colors border border-vitality/20 disabled:opacity-50">
                    <CheckCircle size={13} /> Resolve
                  </button>
                  <button onClick={() => handleDismiss(report)} disabled={processing === report.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted text-muted-foreground text-xs font-semibold rounded-lg transition-colors border border-border disabled:opacity-50">
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
            <div className="bg-card rounded-2xl w-full max-w-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Resolve Report</h3>
                <button onClick={() => { setResolveModal(null); setAdminNotes(''); }} className="p-1 hover:bg-muted rounded-lg text-muted-foreground"><X size={18} /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-3 capitalize">{resolveModal.reason?.replace(/_/g, ' ')}</p>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add admin notes (optional)..." rows={4}
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border outline-none focus:border-primary text-foreground text-sm resize-none mb-4 placeholder:text-muted-foreground" />
              <div className="flex gap-2">
                <button onClick={handleResolve} disabled={processing === resolveModal.id}
                  className="flex-1 bg-vitality hover:bg-vitality/90 disabled:bg-vitality/60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {processing === resolveModal.id ? 'Processing...' : 'Mark Resolved'}
                </button>
                <button onClick={() => { setResolveModal(null); setAdminNotes(''); }}
                  className="px-4 py-2.5 bg-muted hover:bg-muted text-foreground rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
