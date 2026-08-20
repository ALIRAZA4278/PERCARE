'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ExternalLink, CheckCircle, XCircle, Pencil, Plus, X, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;
const EMPTY_FORM = { user_id: '', license_number: '', specialization: '', qualification: '', experience_years: '', contact_phone: '', contact_email: '', consultation_fee: '', is_approved: false };

export default function VetsPage() {
  const { user } = useAuth();
  const [vets, setVets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'edit'|'add', data }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);

  useEffect(() => { fetchVets(); }, []);

  useEffect(() => {
    let r = vets;
    if (filter === 'approved') r = r.filter(v => v.is_approved);
    if (filter === 'pending') r = r.filter(v => !v.is_approved);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(v =>
        v.user?.full_name?.toLowerCase().includes(q) ||
        v.user?.email?.toLowerCase().includes(q) ||
        v.specialization?.toLowerCase().includes(q) ||
        v.license_number?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
    setPage(0);
  }, [vets, search, filter]);

  const fetchVets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('vet_profiles')
      .select('*, user:profiles(full_name, email, avatar_url)')
      .order('created_at', { ascending: false });
    setVets(data || []);
    setLoading(false);
  };

  const logAudit = (action, targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target_type: 'vet', target_id: targetId, details });

  const handleApprove = async (vet) => {
    setProcessing(vet.id);
    await supabase.from('vet_profiles').update({ is_approved: true }).eq('id', vet.id);
    await logAudit('approve_vet', vet.id, `Approved: ${vet.user?.full_name}`);
    if (vet.user_id) await supabase.from('notifications').insert({ user_id: vet.user_id, message: 'Your vet profile has been approved!', type: 'system', is_read: false });
    setVets(prev => prev.map(v => v.id === vet.id ? { ...v, is_approved: true } : v));
    setProcessing(null);
  };

  const handleReject = async (vet) => {
    setProcessing(vet.id);
    await supabase.from('vet_profiles').update({ is_approved: false }).eq('id', vet.id);
    await logAudit('reject_vet', vet.id, `Rejected: ${vet.user?.full_name}`);
    setVets(prev => prev.map(v => v.id === vet.id ? { ...v, is_approved: false } : v));
    setProcessing(null);
  };

  const openEdit = (vet) => {
    setForm({
      user_id: vet.user_id || '',
      license_number: vet.license_number || '',
      specialization: vet.specialization || '',
      qualification: vet.qualification || '',
      experience_years: vet.experience_years || '',
      contact_phone: vet.contact_phone || '',
      contact_email: vet.contact_email || '',
      consultation_fee: vet.consultation_fee || '',
      is_approved: vet.is_approved || false,
    });
    setModal({ mode: 'edit', id: vet.id });
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
      license_number: form.license_number,
      specialization: form.specialization,
      qualification: form.qualification,
      experience_years: form.experience_years ? Number(form.experience_years) : null,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email,
      consultation_fee: form.consultation_fee ? Number(form.consultation_fee) : null,
      is_approved: form.is_approved,
    };

    if (modal.mode === 'edit') {
      await supabase.from('vet_profiles').update(payload).eq('id', modal.id);
      await logAudit('edit_vet', modal.id, `Updated vet profile`);
      setVets(prev => prev.map(v => v.id === modal.id ? { ...v, ...payload } : v));
    } else {
      const { data } = await supabase.from('vet_profiles').insert({ ...payload, user_id: form.user_id }).select('*, user:profiles(full_name, email)').single();
      if (data) {
        await logAudit('add_vet', data.id, `Manually added vet profile`);
        setVets(prev => [data, ...prev]);
      }
    }
    setSaving(false);
    setModal(null);
  };

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const counts = { all: vets.length, approved: vets.filter(v => v.is_approved).length, pending: vets.filter(v => !v.is_approved).length };

  if (loading) return <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center"><p className="text-gray-500 text-sm">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Veterinarians</h1>
          <p className="text-sm text-gray-500 mt-1">{vets.length} total · {counts.approved} approved · {counts.pending} pending</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus size={16} /> Add Vet
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, specialization..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400" />
        </div>
        <div className="flex gap-2">
          {['all', 'approved', 'pending'].map(f => (
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
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Vet</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">License</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Specialization</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Experience</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Cert</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-600 py-12 text-sm">No vets found</td></tr>
              ) : paged.map(vet => (
                <tr key={vet.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs shrink-0 overflow-hidden">
                        {vet.user?.avatar_url ? <img src={vet.user.avatar_url} alt="" className="w-full h-full object-cover" /> : vet.user?.full_name?.charAt(0) || 'V'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-900 font-medium text-xs truncate max-w-[120px]">{vet.user?.full_name || '—'}</p>
                        <p className="text-gray-500 text-[10px] truncate max-w-[120px]">{vet.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{vet.license_number || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{vet.specialization || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{vet.experience_years ? `${vet.experience_years} yrs` : '—'}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {vet.certificate_url
                      ? <a href={vet.certificate_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-xs"><ExternalLink size={12} /> View</a>
                      : <span className="text-gray-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${vet.is_approved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {vet.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(vet)} disabled={processing === vet.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-200">
                        <Pencil size={12} /> Edit
                      </button>
                      {vet.is_approved ? (
                        <button onClick={() => handleReject(vet)} disabled={processing === vet.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-colors border border-gray-200 disabled:opacity-40">
                          <XCircle size={12} /> Reject
                        </button>
                      ) : (
                        <button onClick={() => handleApprove(vet)} disabled={processing === vet.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg transition-colors border border-green-200 disabled:opacity-40">
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
                <h3 className="text-lg font-bold text-gray-900">{modal.mode === 'edit' ? 'Edit Vet Profile' : 'Add Vet Profile'}</h3>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
              </div>

              <div className="space-y-3">
                {modal.mode === 'add' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Search User</label>
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

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'license_number', label: 'License Number' },
                    { key: 'specialization', label: 'Specialization' },
                    { key: 'qualification', label: 'Qualification' },
                    { key: 'experience_years', label: 'Experience (years)', type: 'number' },
                    { key: 'contact_phone', label: 'Contact Phone' },
                    { key: 'contact_email', label: 'Contact Email' },
                    { key: 'consultation_fee', label: 'Consultation Fee (Rs)', type: 'number' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                      <input type={type || 'text'} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <input type="checkbox" id="is_approved" checked={form.is_approved} onChange={e => setForm(f => ({ ...f, is_approved: e.target.checked }))}
                    className="w-4 h-4 accent-green-500" />
                  <label htmlFor="is_approved" className="text-sm font-medium text-gray-900 cursor-pointer">Mark as Approved</label>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={handleSave} disabled={saving || (modal.mode === 'add' && !form.user_id)}
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
