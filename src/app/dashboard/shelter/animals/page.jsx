'use client';

import { Search, Plus, X, PawPrint } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/upload';

const statusColors = {
  available: 'bg-green-50 text-green-700',
  adopted: 'bg-blue-50 text-blue-700',
  foster: 'bg-yellow-50 text-yellow-700',
  medical: 'bg-red-50 text-red-700',
  quarantine: 'bg-orange-50 text-orange-700',
};

const SPECIES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];

export default function ShelterAnimalsPage() {
  const { user } = useAuth();
  const [shelter, setShelter] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAnimal, setEditAnimal] = useState(null);
  const [form, setForm] = useState({ name: '', species: 'dog', breed: '', age_years: '', gender: 'male', adoption_status: 'available', description: '', image_url: '', health_status: '' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: s } = await supabase.from('shelters').select('*').eq('owner_id', user.id).single();
    setShelter(s);
    if (!s) { setLoading(false); return; }
    const { data } = await supabase.from('shelter_animals').select('*').eq('shelter_id', s.id).order('created_at', { ascending: false });
    setAnimals(data || []);
    setLoading(false);
  };

  const openAdd = () => { setEditAnimal(null); setForm({ name: '', species: 'Dog', breed: '', age: '', gender: 'Male', status: 'available', description: '', image_url: '' }); setShowModal(true); };
  const openEdit = (a) => { setEditAnimal(a); setForm({ name: a.name, species: a.species, breed: a.breed || '', age_years: a.age_years || '', gender: a.gender || 'male', adoption_status: a.adoption_status || 'available', description: a.description || '', image_url: a.image_url || '', health_status: a.health_status || '' }); setShowModal(true); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage('shelter-images', file, user.id);
    if (url) setForm(f => ({ ...f, image_url: url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { ...form, shelter_id: shelter.id, age_years: form.age_years ? parseInt(form.age_years) : null };
    if (editAnimal) {
      const { data } = await supabase.from('shelter_animals').update(payload).eq('id', editAnimal.id).select().single();
      setAnimals(animals.map(a => a.id === editAnimal.id ? data : a));
    } else {
      const { data } = await supabase.from('shelter_animals').insert(payload).select().single();
      setAnimals([data, ...animals]);
    }
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    await supabase.from('shelter_animals').delete().eq('id', id);
    setAnimals(animals.filter(a => a.id !== id));
  };

  const filtered = animals.filter(a => {
    const matchSearch = !search.trim() || a.name.toLowerCase().includes(search.toLowerCase()) || (a.species || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || a.adoption_status === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Animals</h1>
          <p className="text-sm text-gray-600 mt-1">Manage animals in your shelter</p>
        </div>
        <button onClick={openAdd} className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
          <Plus size={16} /> Add Animal
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative max-w-lg">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or species..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-sm text-gray-900 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Available', 'Adopted', 'Foster', 'Medical'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === f ? 'bg-teal-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((animal) => (
          <div key={animal.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
              {animal.image_url ? <img src={animal.image_url} alt={animal.name} className="w-full h-full object-cover" /> : <PawPrint size={40} className="text-gray-300" />}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900">{animal.name}</p>
                  <p className="text-xs text-gray-500">{animal.species}{animal.breed ? ` · ${animal.breed}` : ''}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[animal.adoption_status] || 'bg-gray-100 text-gray-600'}`}>{animal.adoption_status}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                {animal.age_years && <span>{animal.age_years} yrs</span>}
                {animal.gender && <span>· {animal.gender}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(animal)} className="flex-1 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 py-1.5 rounded-lg transition-colors">Edit</button>
                <button onClick={() => handleDelete(animal.id)} className="flex-1 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg transition-colors">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16"><div className="text-6xl mb-4">🐾</div><h3 className="text-xl font-bold text-gray-900 mb-2">No animals found</h3><p className="text-gray-600">Add animals to your shelter to manage them here.</p></div>
      )}

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">{editAnimal ? 'Edit Animal' : 'Add Animal'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} className="text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Animal name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                    <select value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 text-sm text-gray-900 bg-white">
                      {SPECIES.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 text-sm text-gray-900 bg-white">
                      <option value="male">Male</option><option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                    <input type="text" value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder="e.g. Labrador"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 text-sm text-gray-900 bg-white placeholder-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
                    <input type="number" value={form.age_years} onChange={e => setForm(f => ({ ...f, age_years: e.target.value }))} placeholder="e.g. 2"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 text-sm text-gray-900 bg-white placeholder-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.adoption_status} onChange={e => setForm(f => ({ ...f, adoption_status: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 text-sm text-gray-900 bg-white">
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="adopted">Adopted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="About this animal..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 text-sm text-gray-900 bg-white placeholder-gray-400 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  {form.image_url && <img src={form.image_url} alt="Preview" className="w-full h-32 object-cover rounded-xl mb-2" />}
                  <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-teal-400 transition-colors text-sm text-gray-500">
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
                <button onClick={handleSave} disabled={saving || uploading}
                  className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                  {saving ? 'Saving...' : editAnimal ? 'Save Changes' : 'Add Animal'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
