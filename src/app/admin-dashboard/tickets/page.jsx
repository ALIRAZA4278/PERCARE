'use client';

import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['All', 'open', 'in_progress', 'resolved', 'closed'];
const priorityColor = {
  urgent: 'bg-red-50 text-red-600',
  high: 'bg-orange-50 text-orange-600',
  medium: 'bg-blue-50 text-blue-600',
  low: 'bg-gray-100 text-gray-500',
};
const statusColor = {
  open: 'bg-orange-50 text-orange-600',
  in_progress: 'bg-blue-50 text-blue-600',
  resolved: 'bg-green-50 text-green-600',
  closed: 'bg-gray-100 text-gray-500',
};

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [activeStatus, setActiveStatus] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editState, setEditState] = useState({});

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select('*, creator:profiles!created_by(full_name, email)')
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const handleSave = async (ticket) => {
    const changes = editState[ticket.id] || {};
    if (!changes.status && !changes.admin_notes) return;
    setSaving(true);
    const updates = {};
    if (changes.status) updates.status = changes.status;
    if (changes.admin_notes !== undefined) updates.admin_notes = changes.admin_notes;
    if (changes.status === 'resolved') updates.resolved_at = new Date().toISOString();
    await supabase.from('support_tickets').update(updates).eq('id', ticket.id);
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id, action: 'update_ticket', target_type: 'ticket',
      target_id: ticket.id, details: `Status: ${changes.status || ticket.status}`,
    });
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, ...updates } : t));
    setEditState(prev => { const next = { ...prev }; delete next[ticket.id]; return next; });
    setSaving(false);
  };

  const setEdit = (ticketId, field, value) => {
    setEditState(prev => ({ ...prev, [ticketId]: { ...prev[ticketId], [field]: value } }));
  };

  const filtered = activeStatus === 'All' ? tickets : tickets.filter(t => t.status === activeStatus);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-sm text-gray-600 mt-1">{tickets.filter(t => t.status === 'open').length} open tickets</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_TABS.map(s => {
          const count = s === 'All' ? tickets.length : tickets.filter(t => t.status === s).length;
          return (
            <button key={s} onClick={() => setActiveStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap capitalize transition-colors flex items-center gap-1.5 ${
                activeStatus === s ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {s.replace('_', ' ')}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeStatus === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">No tickets in this category</p>
          </div>
        ) : filtered.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-bold text-gray-900 text-sm truncate">{ticket.subject}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${priorityColor[ticket.priority]}`}>{ticket.priority}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${statusColor[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-gray-500">{ticket.creator?.full_name} · {ticket.category} · {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
              {expandedId === ticket.id ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
            </div>

            {expandedId === ticket.id && (
              <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-gray-700">{ticket.description}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Update Status</label>
                  <select
                    value={editState[ticket.id]?.status || ticket.status}
                    onChange={e => setEdit(ticket.id, 'status', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-red-400 text-sm bg-white">
                    {['open', 'in_progress', 'resolved', 'closed'].map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Internal Notes</label>
                  <textarea
                    value={editState[ticket.id]?.admin_notes ?? (ticket.admin_notes || '')}
                    onChange={e => setEdit(ticket.id, 'admin_notes', e.target.value)}
                    rows={3} placeholder="Add internal notes..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-red-400 text-sm resize-none" />
                </div>
                {editState[ticket.id] && (
                  <button onClick={() => handleSave(ticket)} disabled={saving}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
