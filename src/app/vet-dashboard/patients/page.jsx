'use client';

import { Search, ChevronDown, ChevronUp, Plus, FileText, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const statusColors = {
  Healthy: 'bg-green-50 text-green-700 border-green-200',
  'Follow-up': 'bg-white text-gray-700 border-gray-300',
  Recovering: 'bg-orange-50 text-orange-700 border-orange-200',
  'Under Treatment': 'bg-white text-gray-700 border-gray-300',
};

const avatarColors = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600', 'bg-orange-100 text-orange-600', 'bg-pink-100 text-pink-600'];

export default function VetPatientsPage() {
  const { user, profile } = useAuth();
  const [vetProfile, setVetProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  // Add Note Modal
  const [showAddNote, setShowAddNote] = useState(false);
  const [notePetId, setNotePetId] = useState(null);
  const [notePetName, setNotePetName] = useState('');
  const [noteData, setNoteData] = useState({ treatment: '', prescription: '', notes: '' });
  // History Modal
  const [showHistory, setShowHistory] = useState(false);
  const [historyPetName, setHistoryPetName] = useState('');
  const [historyNotes, setHistoryNotes] = useState([]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: vp } = await supabase.from('vet_profiles').select('*').eq('user_id', user.id).single();
    setVetProfile(vp);
    if (!vp) { setLoading(false); return; }

    // Get unique pets from appointments
    const { data: apts } = await supabase
      .from('appointments')
      .select('pet_id, appointment_date, pet:pets(id, name, species, breed, age_years, age_months, weight_kg, medical_notes, vaccination_status, owner_id, owner:profiles!owner_id(full_name, phone))')
      .eq('vet_id', vp.id)
      .not('pet_id', 'is', null)
      .order('appointment_date', { ascending: false });

    // Deduplicate by pet_id, keep latest appointment
    const petMap = new Map();
    (apts || []).forEach(apt => {
      if (apt.pet && !petMap.has(apt.pet_id)) {
        petMap.set(apt.pet_id, {
          ...apt.pet,
          last_visit: apt.appointment_date,
          condition: 'Healthy',
        });
      }
    });

    setPatients(Array.from(petMap.values()));
    setLoading(false);
  };

  const openAddNote = (petId, petName) => {
    setNotePetId(petId);
    setNotePetName(petName);
    setNoteData({ treatment: '', prescription: '', notes: '' });
    setShowAddNote(true);
  };

  const handleSaveNote = async () => {
    if (!noteData.treatment || !vetProfile) return;
    await supabase.from('treatment_notes').insert({
      pet_id: notePetId,
      vet_id: vetProfile.id,
      treatment: noteData.treatment,
      prescription: noteData.prescription || null,
      notes: noteData.notes || null,
    });
    setShowAddNote(false);
  };

  const openHistory = async (petId, petName) => {
    setHistoryPetName(petName);
    const { data } = await supabase
      .from('treatment_notes')
      .select('*, vet:vet_profiles(user:profiles(full_name))')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });
    setHistoryNotes(data || []);
    setShowHistory(true);
  };

  const formatAge = (years, months) => {
    if (years && months) return `${years} yrs ${months} mo`;
    if (years) return `${years} yrs`;
    if (months) return `${months} mo`;
    return '—';
  };

  const filtered = patients.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.breed?.toLowerCase().includes(q) || p.owner?.full_name?.toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patient Records</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage pet medical records</p>
      </div>

      <div className="relative mb-6 max-w-xl">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by pet, owner, or breed..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900" />
      </div>

      <div className="space-y-3">
        {filtered.map((patient, index) => {
          const isExpanded = expandedId === patient.id;
          const colorClass = avatarColors[index % avatarColors.length];
          const isVaccinated = patient.vaccination_status === 'up_to_date';

          return (
            <div key={patient.id} className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
              {/* Header Row */}
              <button onClick={() => setExpandedId(isExpanded ? null : patient.id)}
                className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-gray-50 transition-colors text-left">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 ${colorClass}`}>
                  {patient.name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{patient.name}</h3>
                    {isVaccinated && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">Vaccinated</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {patient.breed || patient.species} · {patient.species} · {formatAge(patient.age_years, patient.age_months)}
                  </p>
                  <p className="text-xs text-gray-400">Owner: {patient.owner?.full_name || '—'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusColors[patient.condition] || statusColors.Healthy}`}>
                    {patient.condition}
                  </span>
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Breed</p>
                      <p className="text-sm font-semibold text-gray-900">{patient.breed || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Age</p>
                      <p className="text-sm font-semibold text-gray-900">{formatAge(patient.age_years, patient.age_months)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Species</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{patient.species}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Weight</p>
                      <p className="text-sm font-semibold text-gray-900">{patient.weight_kg ? `${patient.weight_kg} kg` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Last Visit</p>
                      <p className="text-sm font-semibold text-gray-900">{patient.last_visit ? new Date(patient.last_visit + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Condition</p>
                      <p className="text-sm font-semibold text-gray-900">{patient.condition}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-0.5">Owner Contact</p>
                    <p className="text-sm font-semibold text-gray-900">{patient.owner?.full_name || '—'} {patient.owner?.phone ? `— ${patient.owner.phone}` : ''}</p>
                  </div>

                  {patient.medical_notes && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-0.5">Notes</p>
                      <p className="text-sm text-gray-700">{patient.medical_notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button onClick={() => openAddNote(patient.id, patient.name)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-1.5">
                      <Plus size={14} /> Add Note
                    </button>
                    <button onClick={() => openHistory(patient.id, patient.name)}
                      className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors border border-gray-200 text-sm flex items-center gap-1.5">
                      <FileText size={14} /> History
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600">Patients will appear here after appointments.</p>
        </div>
      )}

      {/* Add Treatment Note Modal */}
      {showAddNote && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddNote(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Add Treatment Note — {notePetName}</h2>
                <button onClick={() => setShowAddNote(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Treatment / Diagnosis</label>
                  <input type="text" value={noteData.treatment} onChange={(e) => setNoteData({ ...noteData, treatment: e.target.value })}
                    placeholder="e.g., Follow-up checkup, vaccination..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prescription</label>
                  <input type="text" value={noteData.prescription} onChange={(e) => setNoteData({ ...noteData, prescription: e.target.value })}
                    placeholder="e.g., Amoxicillin 50mg, 10 days"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea value={noteData.notes} onChange={(e) => setNoteData({ ...noteData, notes: e.target.value })}
                    placeholder="Additional observations..." rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400 resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveNote}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                    Save Note
                  </button>
                  <button onClick={() => setShowAddNote(false)}
                    className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Treatment History Modal */}
      {showHistory && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowHistory(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="text-lg font-bold text-gray-900">Treatment History — {historyPetName}</h2>
                <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-700" /></button>
              </div>
              <div className="p-5">
                {historyNotes.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />
                    <div className="space-y-4">
                      {historyNotes.map((note) => (
                        <div key={note.id} className="relative pl-10">
                          <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-gray-400" />
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{note.treatment}</p>
                              <p className="text-xs text-gray-500">Prescription: {note.prescription || 'N/A'}</p>
                              <p className="text-xs text-gray-400">By: {note.vet?.user?.full_name || 'Dr.'}</p>
                            </div>
                            <p className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                              {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No treatment history yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
