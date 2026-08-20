'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, X, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;
const SPECIES_LIST = ['dog', 'cat', 'bird', 'rabbit', 'fish', 'other'];
const VAX_STATUS = ['up_to_date', 'partial', 'none', 'unknown'];

const speciesBadge = {
  dog: 'bg-yellow-100 text-yellow-700',
  cat: 'bg-orange-100 text-orange-700',
  bird: 'bg-blue-100 text-blue-700',
  rabbit: 'bg-pink-100 text-pink-700',
  fish: 'bg-cyan-100 text-cyan-700',
  other: 'bg-gray-100 text-gray-600',
};

const EMPTY_FORM = {
  name: '', species: 'dog', breed: '', gender: '', age_years: '', age_months: '',
  weight_kg: '', color: '', vaccination_status: 'unknown', is_neutered: false,
  medical_notes: '', microchip_id: '', description: '',
};

export default function PetsPage() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => { fetchPets(); }, []);

  useEffect(() => {
    let r = pets;
    if (filter !== 'all') r = r.filter(p => p.species?.toLowerCase() === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.breed?.toLowerCase().includes(q) ||
        p.owner?.full_name?.toLowerCase().includes(q) ||
        p.owner?.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
    setPage(0);
  }, [pets, search, filter]);

  const fetchPets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pets')
      .select('*, owner:profiles!owner_id(full_name, email)')
      .order('created_at', { ascending: false });
    setPets(data || []);
    setLoading(false);
  };

  const logAudit = (action, targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target_type: 'pet', target_id: targetId, details });

  const openEdit = (pet) => {
    setForm({
      name: pet.name || '',
      species: pet.species || 'dog',
      breed: pet.breed || '',
      gender: pet.gender || '',
      age_years: pet.age_years ?? '',
      age_months: pet.age_months ?? '',
      weight_kg: pet.weight_kg ?? '',
      color: pet.color || '',
      vaccination_status: pet.vaccination_status || 'unknown',
      is_neutered: pet.is_neutered || false,
      medical_notes: pet.medical_notes || '',
      microchip_id: pet.microchip_id || '',
      description: pet.description || '',
    });
    setModal({ id: pet.id, ownerName: pet.owner?.full_name });
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      species: form.species,
      breed: form.breed,
      gender: form.gender || null,
      age_years: form.age_years !== '' ? Number(form.age_years) : null,
      age_months: form.age_months !== '' ? Number(form.age_months) : null,
      weight_kg: form.weight_kg !== '' ? Number(form.weight_kg) : null,
      color: form.color,
      vaccination_status: form.vaccination_status,
      is_neutered: form.is_neutered,
      medical_notes: form.medical_notes,
      microchip_id: form.microchip_id,
      description: form.description,
    };
    await supabase.from('pets').update(payload).eq('id', modal.id);
    await logAudit('edit_pet', modal.id, `Updated pet: ${form.name}`);
    setPets(prev => prev.map(p => p.id === modal.id ? { ...p, ...payload } : p));
    setSaving(false);
    setModal(null);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setProcessing(deleteModal.id);
    await supabase.from('pets').delete().eq('id', deleteModal.id);
    await logAudit('delete_pet', deleteModal.id, `Deleted pet: ${deleteModal.name}`);
    setPets(prev => prev.filter(p => p.id !== deleteModal.id));
    setDeleteModal(null);
    setProcessing(null);
  };

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const species = ['all', ...SPECIES_LIST];
  const counts = species.reduce((acc, s) => {
    acc[s] = s === 'all' ? pets.length : pets.filter(p => p.species?.toLowerCase() === s).length;
    return acc;
  }, {});

  if (loading) return <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center"><p className="text-gray-500 text-sm">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pets</h1>
        <p className="text-sm text-gray-500 mt-1">{pets.length} pets listed across all owners</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pet name, breed, owner..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {species.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors flex items-center gap-1.5 ${filter === s ? 'bg-red-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
              {s} <span className="text-[10px] opacity-70">({counts[s]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Pet</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Owner</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Species</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Breed</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Age</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Gender</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-600 py-12 text-sm">No pets found</td></tr>
              ) : paged.map(pet => (
                <tr key={pet.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                        {pet.image_url
                          ? <img src={pet.image_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-sm">🐾</span>}
                      </div>
                      <p className="text-gray-900 font-medium text-xs">{pet.name || '—'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-xs text-gray-900">{pet.owner?.full_name || '—'}</p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[140px]">{pet.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${speciesBadge[pet.species?.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                      {pet.species || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{pet.breed || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                    {pet.age_years != null ? `${pet.age_years}y` : ''}{pet.age_months != null ? ` ${pet.age_months}m` : ''}{pet.age_years == null && pet.age_months == null ? '—' : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell capitalize">{pet.gender || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(pet)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-200">
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => setDeleteModal(pet)} disabled={processing === pet.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-colors border border-gray-200 disabled:opacity-40">
                        <Trash2 size={12} />
                      </button>
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

      {/* Edit Modal */}
      {modal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Edit Pet</h3>
                  {modal.ownerName && <p className="text-xs text-gray-500 mt-0.5">Owner: {modal.ownerName}</p>}
                </div>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Species</label>
                    <select value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm">
                      {SPECIES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Breed</label>
                    <input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Gender</label>
                    <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm">
                      <option value="">—</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Age (years)</label>
                    <input type="number" value={form.age_years} onChange={e => setForm(f => ({ ...f, age_years: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Age (months)</label>
                    <input type="number" value={form.age_months} onChange={e => setForm(f => ({ ...f, age_months: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Weight (kg)</label>
                    <input type="number" step="0.1" value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Color</label>
                    <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Vaccination Status</label>
                    <select value={form.vaccination_status} onChange={e => setForm(f => ({ ...f, vaccination_status: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm">
                      {VAX_STATUS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Microchip ID</label>
                    <input value={form.microchip_id} onChange={e => setForm(f => ({ ...f, microchip_id: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Medical Notes</label>
                  <textarea value={form.medical_notes} onChange={e => setForm(f => ({ ...f, medical_notes: e.target.value }))} rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm resize-none" />
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <input type="checkbox" id="is_neutered" checked={form.is_neutered} onChange={e => setForm(f => ({ ...f, is_neutered: e.target.checked }))}
                    className="w-4 h-4 accent-blue-500" />
                  <label htmlFor="is_neutered" className="text-sm font-medium text-gray-900 cursor-pointer">Neutered / Spayed</label>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 disabled:text-gray-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setModal(null)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm */}
      {deleteModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setDeleteModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Pet</h3>
              <p className="text-sm text-gray-500 mb-1">Delete <span className="text-gray-900 font-semibold">{deleteModal.name}</span>?</p>
              <p className="text-xs text-red-600 mb-5">This will permanently delete this pet and all its data.</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={processing === deleteModal.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg text-sm">
                  {processing === deleteModal.id ? 'Deleting...' : 'Delete'}
                </button>
                <button onClick={() => setDeleteModal(null)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
