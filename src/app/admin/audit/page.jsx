'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 50;

function actionBadge(action) {
  const a = action?.toLowerCase() || '';
  if (a.includes('approve') || a.includes('verify')) return 'bg-green-950 text-green-400';
  if (a.includes('reject') || a.includes('ban') || a.includes('delete')) return 'bg-red-900 text-red-400';
  if (a.includes('unban') || a.includes('resolve') || a.includes('update')) return 'bg-blue-900 text-blue-400';
  return 'bg-gray-800 text-gray-400';
}

export default function AuditPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(logs); setPage(0); return; }
    const q = search.toLowerCase();
    setFiltered(logs.filter(l =>
      l.action?.toLowerCase().includes(q) ||
      l.target_type?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q) ||
      l.admin?.full_name?.toLowerCase().includes(q)
    ));
    setPage(0);
  }, [logs, search]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_audit_log')
      .select('*, admin:profiles!admin_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(500);
    setLogs(data || []);
    setLoading(false);
  };

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">Last {logs.length} admin actions</p>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by action, target type, or details..."
          className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-gray-600" />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Admin</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Action</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Target</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Details</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-600 py-12">No audit logs found</td></tr>
              ) : paged.map(log => (
                <tr key={log.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 font-bold text-[10px] shrink-0">
                        {log.admin?.full_name?.charAt(0) || 'A'}
                      </div>
                      <span className="text-white text-xs font-medium truncate max-w-[80px]">{log.admin?.full_name || 'Admin'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${actionBadge(log.action)}`}>
                      {log.action?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {log.target_type && (
                      <div>
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">{log.target_type}</span>
                        {log.target_id && <p className="text-[10px] text-gray-600 mt-1 font-mono">{log.target_id.slice(0, 6)}...</p>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell max-w-[220px]">
                    <p className="truncate">{log.details || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 disabled:opacity-30 hover:border-gray-600 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 disabled:opacity-30 hover:border-gray-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
