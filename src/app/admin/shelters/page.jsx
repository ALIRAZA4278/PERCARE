'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ExternalLink, CheckCircle, XCircle, Pencil, Plus, X, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;
const EMPTY_FORM = {
  user_id: '', name: '', description: '', address: '', city: '', country: '',
  phone: '', email: '', website: '', is_verified: false,
  accepts_donations: true, accepts_surrender: true,
};

export default function SheltersPage() {
  const { user } = useAuth();
  const [shelters, setShelters] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'edit'|'add', id? }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);

  useEffect(() => { fetchShelters(); }, []);

  useEffect(() => {
    let r = shelters;
    if (filter === 'verified') r = r.filter(s => s.is_verified);
    if (filter === 'unverified') r = r.filter(s => !s.is_verified);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.owner?.full_name?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
    setPage(0);
  }, [shelters, search, filter]);

  const fetchShelters = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('shelters')
      .select('*, owner:profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setShelters(data || []);
    setLoading(false);
  };

  const logAudit = (action, targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target_type: 'shelter', target_id: targetId, details });

  const handleVerify = async (shelter) => {
    setProcessing(shelter.id);
    await supabase.from('shelters').update({ is_verified: true }).eq('id', shelter.id);
    await logAudit('verify_shelter', shelter.id, `Verified: ${shelter.name}`);
    setShelters(prev => prev.map(s => s.id === shelter.id ? { ...s, is_verified: true } : s));
    setProcessing(null);
  };

  const handleUnverify = async (shelter) => {
    setProcessing(shelter.id);
    await supabase.from('shelters').update({ is_verified: false }).eq('id', shelter.id);
    await logAudit('unverify_shelter', shelter.id, `Unverified: ${shelter.name}`);
    setShelters(prev => prev.map(s => s.id === shelter.id ? { ...s, is_verified: false } : s));
    setProcessing(null);
  };

  const openEdit = (shelter) => {
    setForm({
      user_id: shelter.owner_id || '',
      name: shelter.name || '',
      description: shelter.description || '',
      address: shelter.address || '',
      city: shelter.city || '',
      country: shelter.country || '',
      phone: shelter.phone || '',
      email: shelter.email || '',
      website: shelter.website || '',
      is_verified: shelter.is_verified || false,
      accepts_donations: shelter.accepts_donations !== false,
      accepts_surrender: shelter.accepts_surrender !== false,
    });
    setModal({ mode: 'edit', id: shelter.id });
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
      address: form.address,
      city: form.city,
      country: form.country,
      phone: form.phone,
      email: form.email,
      website: form.website,
      is_verified: form.is_verified,
      accepts_donations: form.accepts_donations,
      accepts_surrender: form.accepts_surrender,
    };

    if (modal.mode === 'edit') {
      await supabase.from('shelters').update(payload).eq('id', modal.id);
      await logAudit('edit_shelter', modal.id, `Updated shelter: ${form.name}`);
      setShelters(prev => prev.map(s => s.id === modal.id ? { ...s, ...payload } : s));
    } else {
      const { data } = await supabase.from('shelters')
        .insert({ ...payload, owner_id: form.user_id })
        .select('*, owner:profiles(full_name, email)').single();
      if (data) {
        await logAudit('add_shelter', data.id, `Manually added shelter: ${form.name}`);
        setShelters(prev => [data, ...prev]);
      }
    }
    setSaving(false);
    setModal(null);
  };

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const counts = { all: shelters.length, verified: shelters.filter(s => s.is_verified).length, unverified: shelters.filter(s => !s.is_verified).length };

  if (loading) return <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center"><p className="text-gray-500 text-sm">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shelters</h1>
          <p className="text-sm text-gray-500 mt-1">{shelters.length} total · {counts.verified} verified · {counts.unverified} unverified</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus size={16} /> Add Shelter
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shelter name, city, email, owner..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400" />
        </div>
        <div className="flex gap-2">
          {['all', 'verified', 'unverified'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors flex items-center gap-1.5 ${filter === f ? 'bg-red-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
              {f} <span className="opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Shelter</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Owner</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">City</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Contact</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Website</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-600 py-12 text-sm">No shelters found</td></tr>
              ) : paged.map(shelter => (
                <tr key={shelter.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {shelter.image_url
                          ? <img src={shelter.image_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-sm">🏠</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-900 font-medium text-xs truncate max-w-[130px]">{shelter.name}</p>
                        <p className="text-gray-600 text-[10px]">{shelter.created_at ? new Date(shelter.created_at).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-xs text-gray-900 truncate max-w-[110px]">{shelter.owner?.full_name || '—'}</p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[110px]">{shelter.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-gray-900">{shelter.city || '—'}</p>
                    {shelter.country && <p className="text-[10px] text-gray-500">{shelter.country}</p>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs text-gray-500">{shelter.phone || '—'}</p>
                    {shelter.email && <p className="text-[10px] text-gray-500 truncate max-w-[130px]">{shelter.email}</p>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {shelter.website
                      ? <a href={shelter.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-xs"><ExternalLink size={12} /> Visit</a>
                      : <span className="text-gray-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${shelter.is_verified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {shelter.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(shelter)} disabled={processing === shelter.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-200">
                        <Pencil size={12} /> Edit
                      </button>
                      {shelter.is_verified ? (
                        <button onClick={() => handleUnverify(shelter)} disabled={processing === shelter.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-colors border border-gray-200 disabled:opacity-40">
                          <XCircle size={12} /> Unverify
                        </button>
                      ) : (
                        <button onClick={() => handleVerify(shelter)} disabled={processing === shelter.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg transition-colors border border-green-200 disabled:opacity-40">
                          <CheckCircle size={12} /> Verify
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
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 disabled:opacity-30 hover:border-gray-300"><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 disabled:opacity-30 hover:border-gray-300"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {modal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">{modal.mode === 'edit' ? 'Edit Shelter' : 'Add Shelter'}</h3>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
              </div>

              <div className="space-y-3">
                {modal.mode === 'add' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Search Owner (User)</label>
                    <input value={userSearch} onChange={e => searchUsers(e.target.value)} placeholder="Type user name..."
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm placeholder-gray-400" />
                    {userResults.length > 0 && (
                      <div className="mt-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                        {userResults.map(u => (
                          <button key={u.id} onClick={() => { setForm(f => ({ ...f, user_id: u.id })); setUserSearch(u.full_name); setUserResults([]); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left">
                            <div className="w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">{u.full_name?.charAt(0)}</div>
                            <div>
                              <p className="text-sm text-gray-900 font-medium">{u.full_name}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Shelter Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'address', label: 'Address' },
                    { key: 'city', label: 'City' },
                    { key: 'country', label: 'Country' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'email', label: 'Email' },
                    { key: 'website', label: 'Website' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                      <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'is_verified', label: 'Verified', accent: 'accent-green-500' },
                    { key: 'accepts_donations', label: 'Accepts Donations', accent: 'accent-blue-500' },
                    { key: 'accepts_surrender', label: 'Accepts Surrender', accent: 'accent-orange-500' },
                  ].map(({ key, label, accent }) => (
                    <div key={key} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                      <input type="checkbox" id={key} checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                        className={`w-4 h-4 ${accent}`} />
                      <label htmlFor={key} className="text-xs font-medium text-gray-900 cursor-pointer leading-tight">{label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={handleSave} disabled={saving || (modal.mode === 'add' && (!form.user_id || !form.name))}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 disabled:text-gray-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  <Save size={15} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setModal(null)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
