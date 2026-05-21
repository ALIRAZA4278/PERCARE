'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['All', 'open', 'in_progress', 'resolved', 'closed'];

const statusBadge = {
  open: 'bg-orange-950 text-orange-400',
  in_progress: 'bg-blue-900 text-blue-400',
  resolved: 'bg-green-950 text-green-400',
  closed: 'bg-gray-800 text-gray-400',
};

const priorityBadge = {
  urgent: 'bg-red-900 text-red-400',
  high: 'bg-orange-900 text-orange-400',
  medium: 'bg-blue-900 text-blue-400',
  low: 'bg-gray-800 text-gray-400',
};

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    setFiltered(tab === 'All' ? tickets : tickets.filter(t => t.status === tab));
  }, [tickets, tab]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('support_tickets')
      .select('*, creator:profiles!created_by(full_name, email)')
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const logAudit = (targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action: 'update_ticket', target_type: 'support_ticket', target_id: targetId, details });

  const getEdit = (ticket) => edits[ticket.id] || { status: ticket.status, admin_notes: ticket.admin_notes || '' };

  const setEdit = (ticketId, field, value) =>
    setEdits(prev => ({ ...prev, [ticketId]: { ...getEdit({ id: ticketId, ...tickets.find(t => t.id === ticketId) }), [field]: value } }));

  const handleSave = async (ticket) => {
    const edit = getEdit(ticket);
    setSaving(ticket.id);
    await supabase.from('support_tickets').update({
      status: edit.status,
      admin_notes: edit.admin_notes,
    }).eq('id', ticket.id);
    await logAudit(ticket.id, `Status: ${edit.status}, Notes: ${edit.admin_notes}`);
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: edit.status, admin_notes: edit.admin_notes } : t));
    setEdits(prev => { const n = { ...prev }; delete n[ticket.id]; return n; });
    setSaving(null);
  };

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'All' ? tickets.length : tickets.filter(t => t.status === s).length;
    return acc;
  }, {});

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Support Tickets</h1>
        <p className="text-sm text-gray-500 mt-1">{tickets.length} total tickets</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${tab === s ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'}`}>
            {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            {counts[s] > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === s ? 'bg-white/20' : 'bg-gray-800 text-gray-400'}`}>{counts[s]}</span>}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="w-8 px-4 py-3" />
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Subject</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Creator</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Priority</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-600 py-12">No tickets found</td></tr>
              ) : filtered.map(ticket => {
                const edit = getEdit(ticket);
                const isDirty = edits[ticket.id] !== undefined;
                return (
                  <>
                    <tr key={ticket.id}
                      className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}>
                      <td className="px-4 py-3 text-gray-500">
                        {expanded === ticket.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>
                      <td className="px-4 py-3 text-white font-medium max-w-[180px] truncate">{ticket.subject || '—'}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-white text-xs font-medium">{ticket.creator?.full_name || '—'}</p>
                        <p className="text-gray-500 text-[10px]">{ticket.creator?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityBadge[ticket.priority] || 'bg-gray-800 text-gray-400'}`}>
                          {ticket.priority || 'none'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[ticket.status] || 'bg-gray-800 text-gray-400'}`}>
                          {ticket.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                    {expanded === ticket.id && (
                      <tr key={`${ticket.id}-detail`} className="border-b border-gray-800 bg-gray-950/50">
                        <td colSpan={6} className="px-6 py-5" onClick={e => e.stopPropagation()}>
                          {ticket.description && (
                            <div className="mb-4">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
                              <p className="text-sm text-gray-300 bg-gray-800/50 px-3 py-2.5 rounded-lg">{ticket.description}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Admin Notes</label>
                              <textarea
                                value={edit.admin_notes}
                                onChange={e => setEdit(ticket.id, 'admin_notes', e.target.value)}
                                placeholder="Add notes..."
                                rows={3}
                                className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 text-white text-sm resize-none placeholder-gray-600"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Status</label>
                              <select
                                value={edit.status}
                                onChange={e => setEdit(ticket.id, 'status', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 text-white text-sm mb-3">
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                              <button
                                onClick={() => handleSave(ticket)}
                                disabled={saving === ticket.id || !isDirty}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs font-semibold rounded-lg transition-colors">
                                <Save size={13} />
                                {saving === ticket.id ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
