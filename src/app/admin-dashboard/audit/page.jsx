'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => { fetchLogs(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(logs); return; }
    const q = search.toLowerCase();
    setFiltered(logs.filter(l =>
      l.action?.toLowerCase().includes(q) ||
      l.target_type?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q)
    ));
    setPage(0);
  }, [search, logs]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('admin_audit_log')
      .select('*, admin:profiles!admin_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(500);
    setLogs(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  const actionColor = (action) => {
    if (action?.includes('approve') || action?.includes('verify')) return 'bg-green-50 text-green-600';
    if (action?.includes('reject') || action?.includes('ban') || action?.includes('delete')) return 'bg-red-50 text-red-600';
    if (action?.includes('unban') || action?.includes('resolve')) return 'bg-blue-50 text-blue-600';
    return 'bg-gray-100 text-gray-600';
  };

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-600 mt-1">{logs.length} actions recorded</p>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search action or target type..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-red-400 text-sm" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Admin</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Target</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Details</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500 text-sm">No audit logs yet</td></tr>
              ) : paginated.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{log.admin?.full_name || 'Admin'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${actionColor(log.action)}`}>
                      {log.action?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-gray-500 capitalize">{log.target_type}</span>
                    <span className="text-xs text-gray-400 ml-1">#{log.target_id?.slice(0, 6)}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-gray-500 max-w-xs truncate">{log.details || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' '}{new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
