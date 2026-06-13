'use client';

import { useState, useEffect } from 'react';
import { Ban, CheckCircle, Search, ChevronLeft, ChevronRight, X, UserCog, Shield, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ADMIN_ROLES, ROLE_LABELS, ROLE_COLORS, ROLE_DESCRIPTIONS } from '@/lib/adminRoles';

const ALL_ROLES = ['All', 'admin', 'veterinarian', 'seller', 'shelter', 'pet_owner'];
const ASSIGNABLE_ROLES = ['pet_owner', 'veterinarian', 'seller', 'shelter', 'admin'];
const PAGE_SIZE = 20;

const EMPTY_FORM = { full_name: '', email: '', password: '', role: 'pet_owner', admin_role: 'operations' };

const roleBadge = {
  admin: 'bg-red-900 text-red-400',
  veterinarian: 'bg-blue-900 text-blue-400',
  seller: 'bg-orange-900 text-orange-400',
  shelter: 'bg-green-900 text-green-400',
  pet_owner: 'bg-gray-800 text-gray-400',
};

export default function UsersPage() {
  const { user, profile } = useAuth();
  const isSuperAdmin = profile?.admin_role === 'super_admin' || !profile?.admin_role;

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  // Modals
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [roleModal, setRoleModal] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newRoleAdminRole, setNewRoleAdminRole] = useState('operations');
  const [adminRoleModal, setAdminRoleModal] = useState(null);
  const [newAdminRole, setNewAdminRole] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

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

  // --- Add User ---
  const openAdd = () => { setAddForm(EMPTY_FORM); setAddError(''); setShowPass(false); setAddModal(true); };

  const handleAddUser = async () => {
    const { full_name, email, password, role, admin_role } = addForm;
    if (!full_name.trim() || !email.trim() || !password.trim()) {
      setAddError('Name, email aur password required hain.'); return;
    }
    if (password.length < 6) { setAddError('Password kam az kam 6 characters ka hona chahiye.'); return; }
    setAddLoading(true); setAddError('');
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, role, admin_role: role === 'admin' ? admin_role : undefined }),
    });
    const json = await res.json();
    if (!res.ok) { setAddError(json.error || 'Error creating user'); setAddLoading(false); return; }
    await logAudit('create_user', json.id, `Created: ${email} as ${role}`);
    await fetchUsers();
    setAddModal(false); setAddLoading(false);
  };

  // --- Ban / Unban ---
  const handleBan = async () => {
    if (!banModal) return;
    setProcessing(banModal.id);
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 10);
    await supabase.from('user_bans').insert({
      user_id: banModal.id, banned_by: user.id,
      reason: banReason || 'Banned by admin',
      expires_at: expiresAt.toISOString(), is_active: true,
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

  // --- Role change ---
  const openRoleModal = (u) => { setRoleModal(u); setNewRole(u.role); setNewRoleAdminRole(u.admin_role || 'operations'); };

  const handleRoleChange = async () => {
    if (!roleModal || newRole === roleModal.role) return;
    setProcessing(roleModal.id);
    const update = { role: newRole };
    if (newRole === 'admin') update.admin_role = newRoleAdminRole;
    else update.admin_role = null;
    await supabase.from('profiles').update(update).eq('id', roleModal.id);
    await logAudit('change_role', roleModal.id, `Role: ${roleModal.role} → ${newRole}${newRole === 'admin' ? ` (${newRoleAdminRole})` : ''}`);
    setUsers(prev => prev.map(u => u.id === roleModal.id ? { ...u, ...update } : u));
    setRoleModal(null); setProcessing(null);
  };

  // --- Admin sub-role ---
  const openAdminRoleModal = (u) => { setAdminRoleModal(u); setNewAdminRole(u.admin_role || 'super_admin'); };

  const handleAdminRoleChange = async () => {
    if (!adminRoleModal) return;
    setProcessing(adminRoleModal.id);
    await supabase.from('profiles').update({ admin_role: newAdminRole }).eq('id', adminRoleModal.id);
    await logAudit('change_admin_role', adminRoleModal.id, `Admin role: ${adminRoleModal.admin_role || 'none'} → ${newAdminRole}`);
    setUsers(prev => prev.map(u => u.id === adminRoleModal.id ? { ...u, admin_role: newAdminRole } : u));
    setAdminRoleModal(null); setProcessing(null);
  };

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} users</p>
        </div>
        {isSuperAdmin && (
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <UserPlus size={16} /> Add User
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-gray-600" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {ALL_ROLES.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${roleFilter === r ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'}`}>
              {r}
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
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
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
                      <div className="min-w-0">
                        <span className="text-white font-medium truncate max-w-[120px] block text-xs">{u.full_name || 'Unknown'}</span>
                        {u.role === 'admin' && u.admin_role && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${ROLE_COLORS[u.admin_role] || ''}`}>
                            {ROLE_LABELS[u.admin_role]}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge[u.role] || 'bg-gray-800 text-gray-400'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {isSuperAdmin && u.role === 'admin' && u.id !== user?.id && (
                        <button onClick={() => openAdminRoleModal(u)} disabled={processing === u.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-800 hover:bg-red-950 text-red-300 text-xs font-semibold rounded-lg transition-colors border border-gray-700 disabled:opacity-30">
                          <Shield size={12} /> Role
                        </button>
                      )}
                      {isSuperAdmin && (
                        <button onClick={() => openRoleModal(u)} disabled={processing === u.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 hover:bg-blue-950 text-blue-400 text-xs font-semibold rounded-lg transition-colors border border-gray-700 disabled:opacity-30">
                          <UserCog size={12} /> Type
                        </button>
                      )}
                      {u.is_banned ? (
                        <button onClick={() => handleUnban(u)} disabled={processing === u.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-900/40 hover:bg-green-800/40 text-green-400 text-xs font-semibold rounded-lg transition-colors border border-green-900 disabled:opacity-50">
                          <CheckCircle size={12} /> Unban
                        </button>
                      ) : (
                        <button onClick={() => setBanModal(u)} disabled={u.role === 'admin' || processing === u.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 hover:bg-red-950 text-red-400 text-xs font-semibold rounded-lg transition-colors border border-gray-700 disabled:opacity-30">
                          <Ban size={12} /> Ban
                        </button>
                      )}
                    </div>
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
              className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 disabled:opacity-30 hover:border-gray-600 transition-colors"><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 disabled:opacity-30 hover:border-gray-600 transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ── Add User Modal ── */}
      {addModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setAddModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-800 p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Add New User</h3>
                <button onClick={() => setAddModal(false)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400"><X size={18} /></button>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Name</label>
                  <input value={addForm.full_name} onChange={e => setAddForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Ali Raza" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
                  <input type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="ali@example.com" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={addForm.password}
                      onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Min 6 characters" className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-gray-500" />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">User Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ASSIGNABLE_ROLES.map(r => (
                      <button key={r} onClick={() => setAddForm(f => ({ ...f, role: r }))}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors border ${addForm.role === r ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                        {r.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Sub-Role — sirf jab admin select ho */}
                {addForm.role === 'admin' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Admin Sub-Role</label>
                    <div className="space-y-1.5">
                      {ADMIN_ROLES.map(r => (
                        <button key={r} onClick={() => setAddForm(f => ({ ...f, admin_role: r }))}
                          className={`w-full flex items-start justify-between px-3 py-2.5 rounded-xl text-sm transition-colors border ${addForm.admin_role === r ? 'bg-red-600/20 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'}`}>
                          <div className="text-left">
                            <p className="font-semibold text-xs">{ROLE_LABELS[r]}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{ROLE_DESCRIPTIONS[r]}</p>
                          </div>
                          {addForm.admin_role === r && <span className="text-[10px] text-red-400 font-bold shrink-0 ml-2 mt-0.5">Selected</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {addError && <p className="text-xs text-red-400 mb-3 bg-red-900/20 px-3 py-2 rounded-lg">{addError}</p>}

              <div className="flex gap-2">
                <button onClick={handleAddUser} disabled={addLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  {addLoading ? 'Creating...' : 'Create User'}
                </button>
                <button onClick={() => setAddModal(false)} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Admin Sub-Role Modal ── */}
      {adminRoleModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setAdminRoleModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Admin Sub-Role</h3>
                <button onClick={() => setAdminRoleModal(null)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400"><X size={18} /></button>
              </div>
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800 rounded-xl">
                <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center text-red-300 font-bold text-sm shrink-0">
                  {adminRoleModal.full_name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{adminRoleModal.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{adminRoleModal.email}</p>
                </div>
              </div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Select Admin Role</label>
              <div className="space-y-2 mb-4">
                {ADMIN_ROLES.map(r => (
                  <button key={r} onClick={() => setNewAdminRole(r)}
                    className={`w-full flex items-start justify-between px-3 py-2.5 rounded-xl text-sm transition-colors border ${newAdminRole === r ? 'bg-red-600/20 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'}`}>
                    <div className="text-left">
                      <p className="font-semibold text-xs">{ROLE_LABELS[r]}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{ROLE_DESCRIPTIONS[r]}</p>
                    </div>
                    {newAdminRole === r && <span className="text-[10px] text-red-400 font-bold shrink-0 ml-2 mt-0.5">Selected</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdminRoleChange} disabled={processing === adminRoleModal.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  {processing === adminRoleModal.id ? 'Saving...' : 'Assign Role'}
                </button>
                <button onClick={() => setAdminRoleModal(null)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Role Type Modal ── */}
      {roleModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setRoleModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Change User Type</h3>
                <button onClick={() => setRoleModal(null)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400"><X size={18} /></button>
              </div>
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800 rounded-xl">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 font-bold text-sm shrink-0">
                  {roleModal.full_name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{roleModal.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{roleModal.email}</p>
                </div>
              </div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Select User Type</label>
              <div className="grid grid-cols-1 gap-2 mb-3">
                {ASSIGNABLE_ROLES.map(r => (
                  <button key={r} onClick={() => setNewRole(r)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border ${newRole === r ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'}`}>
                    <span className="capitalize">{r.replace(/_/g, ' ')}</span>
                    {newRole === r && <span className="text-xs text-blue-200">Selected</span>}
                  </button>
                ))}
              </div>
              {newRole === 'admin' && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Admin Sub-Role</label>
                  <div className="space-y-1.5">
                    {ADMIN_ROLES.map(r => (
                      <button key={r} onClick={() => setNewRoleAdminRole(r)}
                        className={`w-full flex items-start justify-between px-3 py-2.5 rounded-xl text-sm transition-colors border ${newRoleAdminRole === r ? 'bg-red-600/20 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'}`}>
                        <div className="text-left">
                          <p className="font-semibold text-xs">{ROLE_LABELS[r]}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{ROLE_DESCRIPTIONS[r]}</p>
                        </div>
                        {newRoleAdminRole === r && <span className="text-[10px] text-red-400 font-bold shrink-0 ml-2 mt-0.5">Selected</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={handleRoleChange} disabled={processing === roleModal.id || (newRole === roleModal.role && (newRole !== 'admin' || newRoleAdminRole === (roleModal.admin_role || 'operations')))}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  {processing === roleModal.id ? 'Saving...' : 'Save Type'}
                </button>
                <button onClick={() => setRoleModal(null)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Ban Modal ── */}
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
