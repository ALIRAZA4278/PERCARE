'use client';

import { ArrowLeft, Edit, Weight, Droplets, Heart, Syringe, Calendar, FileText, Plus, Trash2, Stethoscope, Download, Camera, PawPrint, X, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/upload';
import BookVetModal from '@/components/BookVetModal';

export default function PetDetailPage({ params }) {
  const { id } = use(params);
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isBookVetOpen, setIsBookVetOpen] = useState(false);
  const [pet, setPet] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [newVaccine, setNewVaccine] = useState({ vaccine_name: '', date_given: '', next_due_date: '' });
  const [tagInputs, setTagInputs] = useState({ talents: '', favourite_foods: '', likes: '', dislikes: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedVax, setSelectedVax] = useState(null);
  const [hiddenNotes, setHiddenNotes] = useState([]);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user && id) fetchPetData();
  }, [user, authLoading, isLoggedIn, id]);

  const fetchPetData = async () => {
    const [petRes, vacRes, aptRes] = await Promise.all([
      supabase.from('pets').select('*').eq('id', id).eq('owner_id', user.id).single(),
      supabase.from('pet_vaccinations').select('*').eq('pet_id', id).order('date_given', { ascending: false }),
      supabase.from('appointments').select('*, vet:vet_profiles(*, user:profiles(full_name)), clinic:clinics(name)')
        .eq('pet_id', id).order('appointment_date', { ascending: false }).limit(10),
    ]);
    setPet(petRes.data);
    setVaccinations(vacRes.data || []);
    setAppointments(aptRes.data || []);
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadImage('pet-images', file, user.id);
      await supabase.from('pets').update({ image_url: url }).eq('id', id);
      setPet({ ...pet, image_url: url });
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const currentNotes = pet.medical_notes || '';
    const dateStr = new Date().toISOString().split('T')[0];
    const updatedNotes = `[${dateStr}] ${newNote.trim()}\n${currentNotes}`;
    await supabase.from('pets').update({ medical_notes: updatedNotes }).eq('id', id);
    setPet({ ...pet, medical_notes: updatedNotes });
    setNewNote('');
    setShowAddNote(false);
  };

  const handleDeleteNote = async (noteIndex) => {
    const allNotes = (pet.medical_notes || '').split('\n').filter(Boolean);
    allNotes.splice(noteIndex, 1);
    const updatedNotes = allNotes.join('\n');
    await supabase.from('pets').update({ medical_notes: updatedNotes || null }).eq('id', id);
    setPet({ ...pet, medical_notes: updatedNotes || null });
  };

  const toggleNoteVisibility = (noteId) => {
    setHiddenNotes(prev => prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]);
  };

  const handleAddVaccine = async () => {
    if (!newVaccine.vaccine_name || !newVaccine.date_given) return;
    const { data } = await supabase.from('pet_vaccinations').insert({
      pet_id: id,
      vaccine_name: newVaccine.vaccine_name,
      date_given: newVaccine.date_given,
      next_due_date: newVaccine.next_due_date || null,
    }).select().single();
    if (data) setVaccinations([data, ...vaccinations]);
    setNewVaccine({ vaccine_name: '', date_given: '', next_due_date: '' });
    setShowAddVaccine(false);
  };

  const handleDeleteVaccine = async (vacId) => {
    await supabase.from('pet_vaccinations').delete().eq('id', vacId);
    setVaccinations(vaccinations.filter(v => v.id !== vacId));
  };

  const startEditing = () => {
    setEditData({
      name: pet.name || '',
      breed: pet.breed || '',
      species: pet.species || '',
      age_years: pet.age_years || '',
      age_months: pet.age_months || '',
      gender: pet.gender || '',
      weight_kg: pet.weight_kg || '',
      color: pet.color || '',
      microchip_id: pet.microchip_id || '',
      is_neutered: pet.is_neutered || false,
    });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    const updates = {
      name: editData.name,
      breed: editData.breed || null,
      species: editData.species,
      age_years: editData.age_years ? parseInt(editData.age_years) : null,
      age_months: editData.age_months ? parseInt(editData.age_months) : null,
      gender: editData.gender || null,
      weight_kg: editData.weight_kg ? parseFloat(editData.weight_kg) : null,
      color: editData.color || null,
      microchip_id: editData.microchip_id || null,
      is_neutered: editData.is_neutered,
    };
    await supabase.from('pets').update(updates).eq('id', id);
    setPet({ ...pet, ...updates });
    setIsEditing(false);
  };

  const addTag = async (field) => {
    const value = tagInputs[field].trim();
    if (!value) return;
    const current = pet[field] || [];
    if (current.includes(value)) return;
    const updated = [...current, value];
    await supabase.from('pets').update({ [field]: updated }).eq('id', id);
    setPet({ ...pet, [field]: updated });
    setTagInputs({ ...tagInputs, [field]: '' });
  };

  const removeTag = async (field, value) => {
    const updated = (pet[field] || []).filter(t => t !== value);
    await supabase.from('pets').update({ [field]: updated }).eq('id', id);
    setPet({ ...pet, [field]: updated });
  };

  const handleTagKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(field);
    }
  };

  const emojiMap = { dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰', fish: '🐟', other: '🐾' };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🐾</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pet not found</h2>
          <Link href="/my-pets" className="text-blue-600 font-medium">Back to My Pets</Link>
        </div>
      </div>
    );
  }

  const parseNotes = (notesStr) => {
    if (!notesStr) return [];
    return notesStr.split('\n').filter(Boolean).map((line, i) => {
      const match = line.match(/^\[(\d{4}-\d{2}-\d{2})\]\s*(.*)/);
      if (match) return { id: i, date: match[1], text: match[2] };
      return { id: i, date: '', text: line };
    });
  };

  const notes = parseNotes(pet.medical_notes);
  const upcomingApt = appointments.find(a => a.status === 'pending' || a.status === 'confirmed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Link href="/my-pets" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <ArrowLeft size={18} className="text-gray-700" />
              </Link>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{pet.name}</h1>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button onClick={saveEdit} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Save</button>
              </div>
            ) : (
              <button onClick={startEditing} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <Edit size={18} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Pet Profile Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden relative">
                {pet.image_url ? (
                  <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl sm:text-5xl">{emojiMap[pet.species] || '🐾'}</span>
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-colors">
                  <Camera size={16} className="text-white opacity-0 hover:opacity-100" />
                </div>
                {uploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><span className="text-xs text-gray-500">...</span></div>}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="text-xl font-bold text-gray-900 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500 w-full" />
                  <div className="flex gap-2">
                    <select value={editData.species} onChange={(e) => setEditData({ ...editData, species: e.target.value })}
                      className="text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500">
                      <option value="dog">Dog</option><option value="cat">Cat</option><option value="bird">Bird</option>
                      <option value="rabbit">Rabbit</option><option value="fish">Fish</option><option value="other">Other</option>
                    </select>
                    <input type="text" value={editData.breed} onChange={(e) => setEditData({ ...editData, breed: e.target.value })}
                      placeholder="Breed" className="text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500 flex-1" />
                  </div>
                  <div className="flex gap-2">
                    <input type="number" value={editData.age_years} onChange={(e) => setEditData({ ...editData, age_years: e.target.value })}
                      placeholder="Years" min="0" className="w-16 text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500" />
                    <input type="number" value={editData.age_months} onChange={(e) => setEditData({ ...editData, age_months: e.target.value })}
                      placeholder="Months" min="0" max="11" className="w-20 text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500" />
                    <select value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                      className="text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500">
                      <option value="">Gender</option><option value="male">Male</option><option value="female">Female</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editData.is_neutered} onChange={(e) => setEditData({ ...editData, is_neutered: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                    <span className="text-xs text-gray-700">Neutered / Spayed</span>
                  </label>
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{pet.name}</h2>
                  <p className="text-sm text-gray-600 capitalize">{pet.breed || pet.species}</p>
                  <p className="text-xs text-gray-500">
                    {pet.age_years ? `${pet.age_years}y` : ''}{pet.age_months ? ` ${pet.age_months}m` : ''} · {pet.gender || 'Unknown'}{pet.is_neutered ? ' · Neutered' : ''}
                  </p>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                <div className="flex justify-center mb-1.5"><Weight size={18} className="text-blue-600" /></div>
                <input type="number" value={editData.weight_kg} onChange={(e) => setEditData({ ...editData, weight_kg: e.target.value })}
                  placeholder="0" step="0.1" className="w-full text-center text-sm font-bold text-gray-900 border border-gray-200 rounded-lg px-1 py-1 outline-none focus:border-blue-500" />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Weight (kg)</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                <div className="flex justify-center mb-1.5"><Droplets size={18} className="text-blue-600" /></div>
                <input type="text" value={editData.color} onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                  placeholder="Color" className="w-full text-center text-sm font-bold text-gray-900 border border-gray-200 rounded-lg px-1 py-1 outline-none focus:border-blue-500" />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Color</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                <div className="flex justify-center mb-1.5"><Heart size={18} className="text-blue-600" /></div>
                <input type="text" value={editData.microchip_id} onChange={(e) => setEditData({ ...editData, microchip_id: e.target.value })}
                  placeholder="Microchip ID" className="w-full text-center text-sm font-bold text-gray-900 border border-gray-200 rounded-lg px-1 py-1 outline-none focus:border-blue-500" />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Microchip</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Weight, value: pet.weight_kg ? `${pet.weight_kg} kg` : '—', label: 'Weight' },
                { icon: Droplets, value: pet.color || '—', label: 'Color' },
                { icon: Heart, value: pet.microchip_id || '—', label: 'Microchip' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                  <div className="flex justify-center mb-1.5"><Icon size={18} className="text-blue-600" /></div>
                  <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personality & Fun Facts */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 mb-4">
            <PawPrint size={18} className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Personality & Fun Facts</h3>
          </div>

          {/* Talents */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">⭐ Talents</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {(pet.talents || []).map((item) => (
                <span key={item} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                  {item}
                  <button onClick={() => removeTag('talents', item)} className="hover:opacity-70"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Add talent..."
                value={tagInputs.talents}
                onChange={(e) => setTagInputs({ ...tagInputs, talents: e.target.value })}
                onKeyDown={(e) => handleTagKeyDown(e, 'talents')}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500" />
              <button onClick={() => addTag('talents')}
                className="text-xs text-blue-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">Add</button>
            </div>
          </div>

          {/* Favourite Foods */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">🍖 Favourite Foods</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {(pet.favourite_foods || []).map((item) => (
                <span key={item} className="bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full border border-orange-100 flex items-center gap-1">
                  {item}
                  <button onClick={() => removeTag('favourite_foods', item)} className="hover:opacity-70"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Add favourite food..."
                value={tagInputs.favourite_foods}
                onChange={(e) => setTagInputs({ ...tagInputs, favourite_foods: e.target.value })}
                onKeyDown={(e) => handleTagKeyDown(e, 'favourite_foods')}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500" />
              <button onClick={() => addTag('favourite_foods')}
                className="text-xs text-blue-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">Add</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { field: 'likes', label: 'Likes', emoji: '👍', dotColor: 'text-blue-500' },
              { field: 'dislikes', label: 'Dislikes', emoji: '👎', dotColor: 'text-red-500' },
            ].map(({ field, label, emoji, dotColor }) => (
              <div key={field}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{emoji} {label}</p>
                <ul className="space-y-1 mb-2">
                  {(pet[field] || []).map((item) => (
                    <li key={item} className="text-sm text-gray-700 flex items-center justify-between group">
                      <span className="flex items-center gap-1.5"><span className={`${dotColor} text-xs`}>•</span>{item}</span>
                      <button onClick={() => removeTag(field, item)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                        <X size={12} className="text-gray-400" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-1">
                  <input type="text" placeholder={`Add...`}
                    value={tagInputs[field]}
                    onChange={(e) => setTagInputs({ ...tagInputs, [field]: e.target.value })}
                    onKeyDown={(e) => handleTagKeyDown(e, field)}
                    className="flex-1 px-2 py-1 rounded border border-gray-200 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500" />
                  <button onClick={() => addTag(field)}
                    className="text-[10px] text-blue-600 font-semibold px-2 py-1 rounded hover:bg-blue-50">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Appointment Banner */}
        {upcomingApt && (
          <div className="bg-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium">Next Appointment</p>
              <p className="text-white font-bold text-sm">{upcomingApt.appointment_date} – {upcomingApt.reason || 'Appointment'}</p>
            </div>
          </div>
        )}

        {/* Appointments */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Appointments</h3>
          </div>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{apt.reason || 'Appointment'}</p>
                    <p className="text-xs text-gray-600">{apt.vet?.user?.full_name || 'Vet'}{apt.clinic ? ` · ${apt.clinic.name}` : ''} · {apt.appointment_date}</p>
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                    ['pending', 'confirmed'].includes(apt.status) ? 'bg-blue-50 text-blue-700' : apt.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>{apt.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No appointments yet</p>
          )}
        </div>

        {/* Vaccination History */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Syringe size={18} className="text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Vaccination History</h3>
            </div>
            <button onClick={() => setShowAddVaccine(!showAddVaccine)}
              className="text-blue-600 font-medium text-xs sm:text-sm flex items-center gap-1 hover:text-blue-700 transition-colors">
              <Plus size={14} /> Add
            </button>
          </div>

          {showAddVaccine && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
              <input type="text" placeholder="Vaccine name" value={newVaccine.vaccine_name}
                onChange={(e) => setNewVaccine({ ...newVaccine, vaccine_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 mb-2 outline-none focus:border-blue-500" />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block">Date Given</label>
                  <input type="date" value={newVaccine.date_given}
                    onChange={(e) => setNewVaccine({ ...newVaccine, date_given: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block">Next Due</label>
                  <input type="date" value={newVaccine.next_due_date}
                    onChange={(e) => setNewVaccine({ ...newVaccine, next_due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500" />
                </div>
              </div>
              <button onClick={handleAddVaccine}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                Save Vaccine
              </button>
            </div>
          )}

          {vaccinations.length > 0 ? (
            <div className="space-y-3">
              {vaccinations.map((vax) => {
                const isDue = vax.next_due_date && new Date(vax.next_due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                return (
                  <div key={vax.id} onClick={() => setSelectedVax(vax)}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{vax.vaccine_name}</p>
                      <p className="text-xs text-gray-600">Given: {vax.date_given}{vax.next_due_date ? ` · Next: ${vax.next_due_date}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                        isDue ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                      }`}>{isDue ? 'DUE SOON' : 'DONE'}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteVaccine(vax.id); }} className="p-1 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No vaccinations recorded</p>
          )}
        </div>

        {/* Medical Notes */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Medical Notes</h3>
            </div>
            <button onClick={() => setShowAddNote(!showAddNote)}
              className="text-blue-600 font-medium text-xs sm:text-sm flex items-center gap-1 hover:text-blue-700 transition-colors">
              <Plus size={14} /> Add Note
            </button>
          </div>

          {showAddNote && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter medical note..." rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 mb-3 outline-none focus:border-blue-500 resize-none" />
              <div className="flex items-center gap-2">
                <button onClick={handleAddNote}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors">
                  Save
                </button>
                <button onClick={() => { setShowAddNote(false); setNewNote(''); }}
                  className="text-gray-600 hover:text-gray-800 text-xs font-medium px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => {
                const isHidden = hiddenNotes.includes(note.id);
                return (
                  <div key={note.id} className="p-3 sm:p-4 rounded-xl border border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {note.date && <span className="text-xs font-semibold text-blue-600 block mb-1.5">{note.date}</span>}
                        {isHidden ? (
                          <p className="text-sm text-gray-400 italic">Note hidden</p>
                        ) : (
                          <p className="text-sm text-gray-700 leading-relaxed">{note.text}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => toggleNoteVisibility(note.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title={isHidden ? 'Show note' : 'Hide note'}>
                          {isHidden ? <EyeOff size={15} className="text-gray-400" /> : <Eye size={15} className="text-gray-400" />}
                        </button>
                        <button onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete note">
                          <Trash2 size={15} className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No medical notes</p>
          )}
        </div>

        {/* Bottom Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => setIsBookVetOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm">
            <Stethoscope size={16} /> Book Vet
          </button>
          <button className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors border border-gray-200 flex items-center justify-center gap-2 text-sm">
            <Download size={16} /> Download Records
          </button>
        </div>
      </div>

      {/* Vaccination Detail Modal */}
      {selectedVax && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedVax(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="font-bold text-gray-900 text-lg">{selectedVax.vaccine_name}</h2>
                <button onClick={() => setSelectedVax(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={20} className="text-gray-700" />
                </button>
              </div>
              <div className="p-5">
                <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 font-medium">Date Given</span>
                    <span className="font-semibold text-gray-900">{selectedVax.date_given}</span>
                  </div>
                  {selectedVax.next_due_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600 font-medium">Next Due</span>
                      <span className="font-semibold text-gray-900">{selectedVax.next_due_date}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 font-medium">Status</span>
                    <span className="font-semibold text-gray-900">
                      {selectedVax.next_due_date && new Date(selectedVax.next_due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'Due Soon' : 'Done'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 font-medium">Pet</span>
                    <span className="font-semibold text-gray-900">{pet.name}</span>
                  </div>
                  {selectedVax.administered_by && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600 font-medium">Administered By</span>
                      <span className="font-semibold text-gray-900">{selectedVax.administered_by}</span>
                    </div>
                  )}
                  {selectedVax.notes && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600 font-medium">Notes</span>
                      <span className="font-semibold text-gray-900">{selectedVax.notes}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedVax(null)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <BookVetModal
        isOpen={isBookVetOpen}
        onClose={() => setIsBookVetOpen(false)}
        petName={pet.name}
        petEmoji={emojiMap[pet.species] || '🐾'}
      />
    </div>
  );
}
