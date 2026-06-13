'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Pencil, Plus, X, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;
const STORE_TYPES = ['individual', 'company', 'vet', 'clinic'];
const LOCATION_TYPES = ['online', 'physical', 'both'];
const EMPTY_FORM = {
  owner_id: '', name: '', description: '', store_type: 'individual',
  store_category: '', location_type: 'online', address: '', city: '',
  country: '', phone: '', is_approved: false, is_active: true,
};

export default function StoresPage() {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);

  useEffect(() => { fetchStores(); }, []);

  useEffect(() => {
    let r = stores;
    if (filter === 'approved') r = r.filter(s => s.is_approved);
    if (filter === 'pending') r = r.filter(s => !s.is_approved);
    if (filter === 'inactive') r = r.filter(s => !s.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.owner?.full_name?.toLowerCase().includes(q) ||
        s.owner?.email?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.store_category?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
    setPage(0);
  }, [stores, search, filter]);

  const fetchStores = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('stores')
      .select('*, owner:profiles!owner_id(full_name, email)')
      .order('created_at', { ascending: false });
    setStores(data || []);
    setLoading(false);
  };

  const logAudit = (action, targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target_type: 'store', target_id: targetId, details });

  const handleApprove = async (store) => {
    setProcessing(store.id);
    await supabase.from('stores').update({ is_approved: true }).eq('id', store.id);
    await logAudit('approve_store', store.id, `Approved: ${store.name}`);
    if (store.owner_id) await supabase.from('notifications').insert({ user_id: store.owner_id, title: 'Store Approved', message: `Your store "${store.name}" has been approved!`, type: 'approval', is_read: false });
    setStores(prev => prev.map(s => s.id === store.id ? { ...s, is_approved: true } : s));
    setProcessing(null);
  };

  const handleReject = async (store) => {
    setProcessing(store.id);
    await supabase.from('stores').update({ is_approved: false }).eq('id', store.id);
    await logAudit('reject_store', store.id, `Rejected: ${store.name}`);
    setStores(prev => prev.map(s => s.id === store.id ? { ...s, is_approved: false } : s));
    setProcessing(null);
  };

  const openEdit = (store) => {
    setForm({
      owner_id: store.owner_id || '',
      name: store.name || '',
      description: store.description || '',
      store_type: store.store_type || 'individual',
      store_category: store.store_category || '',
      location_type: store.location_type || 'online',
      address: store.address || '',
      city: store.city || '',
      country: store.country || '',
      phone: store.phone || '',
      is_approved: store.is_approved || false,
      is_active: store.is_active !== false,
    });
    setModal({ mode: 'edit', id: store.id });
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setUserSearch('');
    setUserResults([]);
    setModal({ mode: 'add' });
  };

  const searchUsers = async (q) => {
    setUserSearch(q);
    if (!q.trim()) { setUserResults([]); return; }
    const { data } = await supabase.from('profiles').select('id, full_name, email').ilike('full_name', `%${q}%`).limit(5);
    setUserResults(data || []);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      store_type: form.store_type,
      store_category: form.store_category,
      location_type: form.location_type,
      address: form.address,
      city: form.city,
      country: form.country,
      phone: form.phone,
      is_approved: form.is_approved,
      is_active: form.is_active,
    };

    if (modal.mode === 'edit') {
      await supabase.from('stores').update(payload).eq('id', modal.id);
      await logAudit('edit_store', modal.id, `Updated store: ${form.name}`);
      setStores(prev => prev.map(s => s.id === modal.id ? { ...s, ...payload } : s));
    } else {
      const { data } = await supabase.from('stores')
        .insert({ ...payload, owner_id: form.owner_id })
        .select('*, owner:profiles!owner_id(full_name, email)').single();
      if (data) {
        await logAudit('add_store', data.id, `Manually added store: ${form.name}`);
        setStores(prev => [data, ...prev]);
      }
    }
    setSaving(false);
    setModal(null);
  };

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const counts = {
    all: stores.length,
    approved: stores.filter(s => s.is_approved).length,
    pending: stores.filter(s => !s.is_approved).length,
    inactive: stores.filter(s => !s.is_active).length,
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500 text-sm">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Stores</h1>
          <p className="text-sm text-gray-500 mt-1">{stores.length} total · {counts.approved} approved · {counts.pending} pending</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus size={16} /> Add Store
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, owner, city, category..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-gray-600" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'approved', 'pending', 'inactive'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors flex items-center gap-1.5 ${filter === f ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'}`}>
              {f} <span className="opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Store</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Owner</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Type</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">City</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Phone</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-600 py-12 text-sm">No stores found</td></tr>
              ) : paged.map(store => (
                <tr key={store.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {store.logo_url
                          ? <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-sm">🛒</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-xs truncate max-w-[120px]">{store.name}</p>
                        {store.store_category && <p className="text-gray-500 text-[10px] truncate max-w-[120px]">{store.store_category}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-xs text-white truncate max-w-[110px]">{store.owner?.full_name || '—'}</p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[110px]">{store.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 capitalize">{store.store_type || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{store.city || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{store.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${store.is_approved ? 'bg-green-950 text-green-400' : 'bg-orange-950 text-orange-400'}`}>
                        {store.is_approved ? 'Approved' : 'Pending'}
                      </span>
                      {!store.is_active && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full w-fit bg-gray-800 text-gray-500">Inactive</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(store)} disabled={processing === store.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors border border-gray-700">
                        <Pencil size={12} /> Edit
                      </button>
                      {store.is_approved ? (
                        <button onClick={() => handleReject(store)} disabled={processing === store.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-800 hover:bg-red-950 text-red-400 text-xs font-semibold rounded-lg transition-colors border border-gray-700 disabled:opacity-40">
                          <XCircle size={12} /> Reject
                        </button>
                      ) : (
                        <button onClick={() => handleApprove(store)} disabled={processing === store.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-900/40 hover:bg-green-800/40 text-green-400 text-xs font-semibold rounded-lg transition-colors border border-green-900 disabled:opacity-40">
                          <CheckCircle size={12} /> Approve
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
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 disabled:opacity-30 hover:border-gray-600"><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 disabled:opacity-30 hover:border-gray-600"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {modal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-800 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">{modal.mode === 'edit' ? 'Edit Store' : 'Add Store'}</h3>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400"><X size={18} /></button>
              </div>

              <div className="space-y-3">
                {modal.mode === 'add' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Search Owner (User)</label>
                    <input value={userSearch} onChange={e => searchUsers(e.target.value)} placeholder="Type user name..."
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 outline-none focus:border-red-500 text-white text-sm placeholder-gray-600" />
                    {userResults.length > 0 && (
                      <div className="mt-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                        {userResults.map(u => (
                          <button key={u.id} onClick={() => { setForm(f => ({ ...f, owner_id: u.id })); setUserSearch(u.full_name); setUserResults([]); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-700 transition-colors text-left">
                            <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">{u.full_name?.charAt(0)}</div>
                            <div>
                              <p className="text-sm text-white font-medium">{u.full_name}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Store Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 outline-none focus:border-red-500 text-white text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 outline-none focus:border-red-500 text-white text-sm resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Store Type</label>
                    <select value={form.store_type} onChange={e => setForm(f => ({ ...f, store_type: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 outline-none focus:border-red-500 text-white text-sm">
                      {STORE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Location Type</label>
                    <select value={form.location_type} onChange={e => setForm(f => ({ ...f, location_type: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 outline-none focus:border-red-500 text-white text-sm">
                      {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'store_category', label: 'Category' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'city', label: 'City' },
                    { key: 'country', label: 'Country' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>
                      <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 outline-none focus:border-red-500 text-white text-sm" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Address</label>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 outline-none focus:border-red-500 text-white text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'is_approved', label: 'Approved', accent: 'accent-green-500' },
                    { key: 'is_active', label: 'Active', accent: 'accent-blue-500' },
                  ].map(({ key, label, accent }) => (
                    <div key={key} className="flex items-center gap-2 p-3 bg-gray-800 rounded-xl">
                      <input type="checkbox" id={key} checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                        className={`w-4 h-4 ${accent}`} />
                      <label htmlFor={key} className="text-sm font-medium text-white cursor-pointer">{label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={handleSave} disabled={saving || (modal.mode === 'add' && (!form.owner_id || !form.name))}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  <Save size={15} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setModal(null)} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
