'use client';

import { Search, Ban, CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const ROLES = ['All', 'pet_owner', 'veterinarian', 'seller', 'company', 'shelter', 'admin'];

const roleColor = {
  admin: 'bg-red-50 text-red-600',
  veterinarian: 'bg-blue-50 text-blue-600',
  seller: 'bg-orange-50 text-orange-600',
  shelter: 'bg-green-50 text-green-600',
  company: 'bg-purple-50 text-purple-600',
  pet_owner: 'bg-gray-100 text-gray-600',
};

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState('permanent');
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let data = users;
    if (roleFilter !== 'All') data = data.filter(u => u.role === roleFilter);
    if (search.trim()) data = data.filter(u =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
    setPage(0);
  }, [search, roleFilter, users]);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  const logAudit = async (action, targetId, details) => {
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id, action, target_type: 'user', target_id: targetId, details,
    });
  };

  const handleBan = async () => {
    if (!banModal || !banReason.trim()) return;
    setProcessing(true);
    await supabase.from('profiles').update({ is_banned: true }).eq('id', banModal.id);
    await supabase.from('user_bans').insert({
      user_id: banModal.id, banned_by: user.id,
      ban_type: banType, reason: banReason, is_active: true,
      expires_at: banType === 'temporary' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
    });
    await logAudit('ban_user', banModal.id, `Banned (${banType}): ${banReason}`);
    setUsers(prev => prev.map(u => u.id === banModal.id ? { ...u, is_banned: true } : u));
    setBanModal(null); setBanReason(''); setProcessing(false);
  };

  const handleUnban = async (u) => {
    setProcessing(true);
    await supabase.from('profiles').update({ is_banned: false }).eq('id', u.id);
    await supabase.from('user_bans').update({ is_active: false }).eq('user_id', u.id).eq('is_active', true);
    await logAudit('unban_user', u.id, `Unbanned user`);
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_banned: false } : x));
    setProcessing(false);
  };

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-600 mt-1">{users.length} total users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-red-400 text-sm" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-red-400 text-sm bg-white text-gray-700">
          {ROLES.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">City</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                        {u.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{u.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColor[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{u.city || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.is_banned ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {u.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== 'admin' && (
                      u.is_banned ? (
                        <button onClick={() => handleUnban(u)} disabled={processing}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg transition-colors border border-green-200 ml-auto">
                          <CheckCircle size={12} /> Unban
                        </button>
                      ) : (
                        <button onClick={() => setBanModal(u)} disabled={processing}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors border border-red-200 ml-auto">
                          <Ban size={12} /> Ban
                        </button>
                      )
                    )}
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

      {/* Ban Modal */}
      {banModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setBanModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Ban User</h3>
                <button onClick={() => setBanModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Banning <strong>{banModal.full_name}</strong></p>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ban Type</label>
                <div className="flex gap-2">
                  {['permanent', 'temporary'].map(t => (
                    <button key={t} onClick={() => setBanType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${banType === t ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reason *</label>
                <textarea value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Reason for ban..."
                  rows={3} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-red-400 text-sm resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleBan} disabled={processing || !banReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {processing ? 'Processing...' : 'Confirm Ban'}
                </button>
                <button onClick={() => setBanModal(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
