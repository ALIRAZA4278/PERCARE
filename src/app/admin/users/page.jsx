'use client';

import { useState, useEffect } from 'react';
import { Ban, CheckCircle, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const ROLES = ['All', 'admin', 'veterinarian', 'seller', 'shelter', 'pet_owner'];
const PAGE_SIZE = 20;

const roleBadge = {
  admin: 'bg-red-900 text-red-400',
  veterinarian: 'bg-blue-900 text-blue-400',
  seller: 'bg-orange-900 text-orange-400',
  shelter: 'bg-green-900 text-green-400',
  pet_owner: 'bg-gray-800 text-gray-400',
};

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let result = users;
    if (roleFilter !== 'All') result = result.filter(u => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
    setPage(0);
  }, [users, search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const logAudit = (action, targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target_type: 'user', target_id: targetId, details });

  const handleBan = async () => {
    if (!banModal) return;
    setProcessing(banModal.id);
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 10);
    await supabase.from('user_bans').insert({
      user_id: banModal.id,
      banned_by: user.id,
      reason: banReason || 'Banned by admin',
      expires_at: expiresAt.toISOString(),
      is_active: true,
    });
    await supabase.from('profiles').update({ is_banned: true }).eq('id', banModal.id);
    await logAudit('ban_user', banModal.id, banReason || 'Banned by admin');
    setUsers(prev => prev.map(u => u.id === banModal.id ? { ...u, is_banned: true } : u));
    setBanModal(null); setBanReason(''); setProcessing(null);
  };

  const handleUnban = async (u) => {
    setProcessing(u.id);
    await supabase.from('user_bans').update({ is_active: false }).eq('user_id', u.id).eq('is_active', true);
    await supabase.from('profiles').update({ is_banned: false }).eq('id', u.id);
    await logAudit('unban_user', u.id, `Unbanned: ${u.full_name}`);
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_banned: false } : x));
    setProcessing(null);
  };

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Users</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} total users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-gray-600" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {ROLES.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${roleFilter === r ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'}`}>
              {r === 'All' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Joined</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-600 py-12">No users found</td></tr>
              ) : paged.map(u => (
                <tr key={u.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 font-bold text-xs shrink-0">
                        {u.full_name?.charAt(0) || '?'}
                      </div>
                      <span className="text-white font-medium truncate max-w-[120px]">{u.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge[u.role] || 'bg-gray-800 text-gray-400'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.is_banned ? (
                      <button onClick={() => handleUnban(u)} disabled={processing === u.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/40 hover:bg-green-800/40 text-green-400 text-xs font-semibold rounded-lg transition-colors border border-green-900 ml-auto disabled:opacity-50">
                        <CheckCircle size={13} /> Unban
                      </button>
                    ) : (
                      <button onClick={() => setBanModal(u)} disabled={u.role === 'admin' || processing === u.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-red-950 text-red-400 text-xs font-semibold rounded-lg transition-colors border border-gray-700 ml-auto disabled:opacity-30">
                        <Ban size={13} /> Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
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

      {banModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => { setBanModal(null); setBanReason(''); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Ban {banModal.full_name}</h3>
                <button onClick={() => { setBanModal(null); setBanReason(''); }} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400"><X size={18} /></button>
              </div>
              <p className="text-xs text-gray-500 mb-3">This will prevent the user from logging in.</p>
              <textarea value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Reason for ban (optional)..." rows={3}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-red-500 text-white text-sm resize-none mb-4 placeholder-gray-600" />
              <div className="flex gap-2">
                <button onClick={handleBan} disabled={processing === banModal.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {processing === banModal.id ? 'Processing...' : 'Confirm Ban'}
                </button>
                <button onClick={() => { setBanModal(null); setBanReason(''); }}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
