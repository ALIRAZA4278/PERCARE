'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Pencil, Plus, X, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;
const EMPTY_FORM = { owner_id: '', name: '', description: '', address: '', city: '', phone: '', email: '', is_emergency_available: false, is_approved: false };

export default function ClinicsPage() {
  const { user } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'edit'|'add', id }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);

  useEffect(() => { fetchClinics(); }, []);

  useEffect(() => {
    let r = clinics;
    if (filter === 'approved') r = r.filter(c => c.is_approved);
    if (filter === 'pending') r = r.filter(c => !c.is_approved);
    if (filter === 'hospital') r = r.filter(c => c.is_emergency_available);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c => c.name?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
    }
    setFiltered(r);
    setPage(0);
  }, [clinics, search, filter]);

  const fetchClinics = async () => {
    setLoading(true);
    const { data } = await supabase.from('clinics').select('*, owner:profiles(full_name, email)').order('created_at', { ascending: false });
    setClinics(data || []);
    setLoading(false);
  };

  const logAudit = (action, targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target_type: 'clinic', target_id: targetId, details });

  const handleApprove = async (clinic) => {
    setProcessing(clinic.id);
    await supabase.from('clinics').update({ is_approved: true }).eq('id', clinic.id);
    await logAudit('approve_clinic', clinic.id, `Approved: ${clinic.name}`);
    if (clinic.owner_id) await supabase.from('notifications').insert({ user_id: clinic.owner_id, message: `${clinic.name} has been approved!`, type: 'system', is_read: false });
    setClinics(prev => prev.map(c => c.id === clinic.id ? { ...c, is_approved: true } : c));
    setProcessing(null);
  };

  const handleReject = async (clinic) => {
    setProcessing(clinic.id);
    await supabase.from('clinics').update({ is_approved: false }).eq('id', clinic.id);
    await logAudit('reject_clinic', clinic.id, `Rejected: ${clinic.name}`);
    setClinics(prev => prev.map(c => c.id === clinic.id ? { ...c, is_approved: false } : c));
    setProcessing(null);
  };

  const openEdit = (clinic) => {
    setForm({
      owner_id: clinic.owner_id || '',
      name: clinic.name || '',
      description: clinic.description || '',
      address: clinic.address || '',
      city: clinic.city || '',
      phone: clinic.phone || '',
      email: clinic.email || '',
      is_emergency_available: clinic.is_emergency_available || false,
      is_approved: clinic.is_approved || false,
    });
    setModal({ mode: 'edit', id: clinic.id });
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
      phone: form.phone,
      email: form.email,
      is_emergency_available: form.is_emergency_available,
      is_approved: form.is_approved,
    };

    if (modal.mode === 'edit') {
      await supabase.from('clinics').update(payload).eq('id', modal.id);
      await logAudit('edit_clinic', modal.id, `Updated: ${form.name}`);
      setClinics(prev => prev.map(c => c.id === modal.id ? { ...c, ...payload } : c));
    } else {
      const { data } = await supabase.from('clinics').insert({ ...payload, owner_id: form.owner_id || null }).select('*, owner:profiles(full_name, email)').single();
      if (data) {
        await logAudit('add_clinic', data.id, `Manually added: ${form.name}`);
        setClinics(prev => [data, ...prev]);
      }
    }
    setSaving(false);
    setModal(null);
  };

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const counts = {
    all: clinics.length,
    approved: clinics.filter(c => c.is_approved).length,
    pending: clinics.filter(c => !c.is_approved).length,
    hospital: clinics.filter(c => c.is_emergency_available).length,
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500 text-sm">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Clinics & Hospitals</h1>
          <p className="text-sm text-gray-500 mt-1">{clinics.length} total · {counts.approved} approved · {counts.pending} pending · {counts.hospital} emergency-capable</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus size={16} /> Add Listing
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, city, email..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-gray-600" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'approved', 'pending', 'hospital'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors flex items-center gap-1.5 ${filter === f ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'}`}>
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
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">City</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Contact</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-600 py-12 text-sm">No listings found</td></tr>
              ) : paged.map(clinic => (
                <tr key={clinic.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium text-xs truncate max-w-[160px]">{clinic.name}</p>
                    <p className="text-gray-500 text-[10px] truncate max-w-[160px]">{clinic.owner?.full_name || 'No owner linked'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{clinic.city || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{clinic.phone || clinic.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${clinic.is_emergency_available ? 'bg-red-950 text-red-400' : 'bg-blue-950 text-blue-400'}`}>
                      {clinic.is_emergency_available ? 'Hospital' : 'Clinic'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${clinic.is_approved ? 'bg-green-950 text-green-400' : 'bg-orange-950 text-orange-400'}`}>
                      {clinic.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(clinic)} disabled={processing === clinic.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors border border-gray-700">
                        <Pencil size={12} /> Edit
                      </button>
                      {clinic.is_approved ? (
                        <button onClick={() => handleReject(clinic)} disabled={processing === clinic.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-800 hover:bg-red-950 text-red-400 text-xs font-semibold rounded-lg transition-colors border border-gray-700 disabled:opacity-40">
                          <XCircle size={12} /> Reject
                        </button>
                      ) : (
                        <button onClick={() => handleApprove(clinic)} disabled={processing === clinic.id}
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

      {modal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-800 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">{modal.mode === 'edit' ? 'Edit Listing' : 'Add Listing'}</h3>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400"><X size={18} /></button>
              </div>

              <div className="space-y-3">
                {modal.mode === 'add' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Owner (optional)</label>
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
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 outline-none focus:border-red-500 text-white text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'city', label: 'City' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'email', label: 'Email' },
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

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 outline-none focus:border-red-500 text-white text-sm resize-none" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                  <input type="checkbox" id="is_emergency_available" checked={form.is_emergency_available} onChange={e => setForm(f => ({ ...f, is_emergency_available: e.target.checked }))}
                    className="w-4 h-4 accent-red-500" />
                  <label htmlFor="is_emergency_available" className="text-sm font-medium text-white cursor-pointer">24/7 Emergency (list as Hospital)</label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                  <input type="checkbox" id="is_approved" checked={form.is_approved} onChange={e => setForm(f => ({ ...f, is_approved: e.target.checked }))}
                    className="w-4 h-4 accent-green-500" />
                  <label htmlFor="is_approved" className="text-sm font-medium text-white cursor-pointer">Mark as Approved</label>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={handleSave} disabled={saving || !form.name}
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
