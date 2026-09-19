'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, X, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;
const SPECIES_LIST = ['dog', 'cat', 'bird', 'rabbit', 'fish', 'other'];
const VAX_STATUS = ['up_to_date', 'partial', 'none', 'unknown'];

const speciesBadge = {
  dog: 'bg-amber/10 text-amber',
  cat: 'bg-amber/10 text-amber',
  bird: 'bg-primary/10 text-primary',
  rabbit: 'bg-emergency/10 text-emergency',
  fish: 'bg-primary/10 text-primary',
  other: 'bg-muted text-muted-foreground',
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

  if (loading) return <div className="flex items-center justify-center"><p className="text-muted-foreground text-sm">Loading...</p></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pets</h1>
        <p className="text-sm text-muted-foreground mt-1">{pets.length} pets listed across all owners</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pet name, breed, owner..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {species.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors flex items-center gap-1.5 ${filter === s ? 'bg-primary text-white' : 'bg-card text-muted-foreground border border-border hover:border-border'}`}>
              {s} <span className="text-[10px] opacity-70">({counts[s]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Pet</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Owner</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Species</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Breed</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Age</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Gender</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted-foreground py-12 text-sm">No pets found</td></tr>
              ) : paged.map(pet => (
                <tr key={pet.id} className="border-b border-border last:border-0 hover:bg-muted transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                        {pet.image_url
                          ? <img src={pet.image_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-sm">🐾</span>}
                      </div>
                      <p className="text-foreground font-medium text-xs">{pet.name || '—'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-xs text-foreground">{pet.owner?.full_name || '—'}</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{pet.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${speciesBadge[pet.species?.toLowerCase()] || 'bg-muted text-muted-foreground'}`}>
                      {pet.species || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{pet.breed || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                    {pet.age_years != null ? `${pet.age_years}y` : ''}{pet.age_months != null ? ` ${pet.age_months}m` : ''}{pet.age_years == null && pet.age_months == null ? '—' : ''}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell capitalize">{pet.gender || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(pet)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-muted hover:bg-muted text-foreground text-xs font-semibold rounded-lg transition-colors border border-border">
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => setDeleteModal(pet)} disabled={processing === pet.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-muted hover:bg-emergency/10 text-emergency text-xs font-semibold rounded-lg transition-colors border border-border disabled:opacity-40">
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
          <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 bg-card border border-border rounded-lg text-muted-foreground disabled:opacity-30 hover:border-border"><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 bg-card border border-border rounded-lg text-muted-foreground disabled:opacity-30 hover:border-border"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-lg border border-border p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Edit Pet</h3>
                  {modal.ownerName && <p className="text-xs text-muted-foreground mt-0.5">Owner: {modal.ownerName}</p>}
                </div>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-muted rounded-lg text-muted-foreground"><X size={18} /></button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Species</label>
                    <select value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm">
                      {SPECIES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Breed</label>
                    <input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Gender</label>
                    <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm">
                      <option value="">—</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Age (years)</label>
                    <input type="number" value={form.age_years} onChange={e => setForm(f => ({ ...f, age_years: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Age (months)</label>
                    <input type="number" value={form.age_months} onChange={e => setForm(f => ({ ...f, age_months: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Weight (kg)</label>
                    <input type="number" step="0.1" value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Color</label>
                    <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Vaccination Status</label>
                    <select value={form.vaccination_status} onChange={e => setForm(f => ({ ...f, vaccination_status: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm">
                      {VAX_STATUS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Microchip ID</label>
                    <input value={form.microchip_id} onChange={e => setForm(f => ({ ...f, microchip_id: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Medical Notes</label>
                  <textarea value={form.medical_notes} onChange={e => setForm(f => ({ ...f, medical_notes: e.target.value }))} rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border outline-none focus:border-primary text-foreground text-sm resize-none" />
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
                  <input type="checkbox" id="is_neutered" checked={form.is_neutered} onChange={e => setForm(f => ({ ...f, is_neutered: e.target.checked }))}
                    className="w-4 h-4 accent-blue-500" />
                  <label htmlFor="is_neutered" className="text-sm font-medium text-foreground cursor-pointer">Neutered / Spayed</label>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setModal(null)} className="px-4 py-2.5 bg-muted hover:bg-muted text-foreground rounded-xl text-sm">Cancel</button>
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
            <div className="bg-card rounded-2xl w-full max-w-sm border border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Delete Pet</h3>
              <p className="text-sm text-muted-foreground mb-1">Delete <span className="text-foreground font-semibold">{deleteModal.name}</span>?</p>
              <p className="text-xs text-emergency mb-5">This will permanently delete this pet and all its data.</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={processing === deleteModal.id}
                  className="flex-1 bg-emergency hover:bg-emergency/90 disabled:bg-emergency/40 text-white font-semibold py-2.5 rounded-lg text-sm">
                  {processing === deleteModal.id ? 'Deleting...' : 'Delete'}
                </button>
                <button onClick={() => setDeleteModal(null)} className="px-4 py-2.5 bg-muted hover:bg-muted text-foreground rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
