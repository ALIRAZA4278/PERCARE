'use client';

import { Plus, ArrowRight, PawPrint, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const healthBadgeColor = (h) => {
  const v = (h || '').toLowerCase();
  if (v.includes('healthy')) return 'border-green-400 text-green-600';
  if (v.includes('injur')) return 'border-orange-400 text-orange-600';
  if (v.includes('malnour')) return 'border-orange-400 text-orange-600';
  if (v.includes('sick')) return 'border-red-400 text-red-600';
  return 'border-gray-400 text-gray-600';
};

const emptyForm = { name: '', species: '', breed: '', age: '', source: '', health_condition: '', notes: '' };

export default function ShelterIntakePage() {
  const { user } = useAuth();
  const [shelter, setShelter] = useState(null);
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState(null);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: s } = await supabase.from('shelters').select('*').eq('owner_id', user.id).single();
    setShelter(s);
    if (!s) { setLoading(false); return; }
    const { data } = await supabase.from('intake_records')
      .select('*').eq('shelter_id', s.id).order('created_at', { ascending: false });
    setIntakes(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.species.trim()) return;
    setSaving(true);
    const { data } = await supabase.from('intake_records').insert({
      shelter_id: shelter.id,
      name: form.name.trim() || null,
      species: form.species.trim(),
      breed: form.breed.trim() || null,
      estimated_age: form.age.trim() || null,
      source: form.source.trim() || null,
      health_condition: form.health_condition.trim() || null,
      notes: form.notes.trim() || null,
    }).select().single();
    if (data) setIntakes([data, ...intakes]);
    setSaving(false);
    setShowForm(false);
    setForm(emptyForm);
  };

  const handleMoveToAnimals = async (intake) => {
    setMovingId(intake.id);
    const speciesMap = { dog: 'dog', cat: 'cat', bird: 'bird', rabbit: 'rabbit', fish: 'fish' };
    const speciesLower = (intake.species || '').toLowerCase();
    const species = speciesMap[speciesLower] || 'other';

    await supabase.from('shelter_animals').insert({
      shelter_id: shelter.id,
      name: intake.name || intake.species,
      species,
      breed: intake.breed || null,
      health_status: intake.health_condition || null,
      description: intake.notes || null,
      adoption_status: 'available',
    });

    await supabase.from('intake_records').update({ moved: true }).eq('id', intake.id);
    setIntakes(intakes.filter(i => i.id !== intake.id));
    setMovingId(null);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pet Intake</h1>
          <p className="text-sm text-teal-600 mt-0.5">Register new animals arriving at the shelter</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
            <Plus size={16} /> New Intake
          </button>
        )}
      </div>

      {/* Inline Register Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-bold text-gray-900 mb-5">Register New Animal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Animal Name (if known)</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Buddy"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
              <input type="text" value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
                placeholder="e.g., Dog, Cat, Bird"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed (if known)</label>
              <input type="text" value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                placeholder="e.g., Labrador"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Age</label>
              <input type="text" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                placeholder="e.g., 2 years"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input type="text" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                placeholder="e.g., Surrendered, Rescue, Found"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Health Condition</label>
              <input type="text" value={form.health_condition} onChange={e => setForm(f => ({ ...f, health_condition: e.target.value }))}
                placeholder="e.g., Healthy, Injured, Malnourished"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3} placeholder="Add any additional details about the animal..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400 resize-y" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving || !form.species.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              {saving ? 'Registering...' : 'Register Animal'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Recent Intakes */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Recent Intakes</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {intakes.map((intake) => (
            <div key={intake.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <PawPrint size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{intake.name || `Unnamed ${intake.species}`}</p>
                    <p className="text-xs text-gray-500">
                      {intake.species}{intake.source ? ` · ${intake.source}` : ''} · {formatDate(intake.created_at)}
                    </p>
                  </div>
                </div>
                {intake.health_condition && (
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border bg-white shrink-0 ${healthBadgeColor(intake.health_condition)}`}>
                    {intake.health_condition}
                  </span>
                )}
              </div>
              {intake.notes && (
                <p className="text-sm text-teal-600 mb-3 ml-13 pl-13">{intake.notes}</p>
              )}
              <div className="pl-13">
                <button onClick={() => handleMoveToAnimals(intake)} disabled={movingId === intake.id}
                  className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                  <ArrowRight size={13} /> {movingId === intake.id ? 'Moving...' : 'Move to Animals'}
                </button>
              </div>
            </div>
          ))}
          {intakes.length === 0 && !showForm && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No intake records</h3>
              <p className="text-gray-600">Click "+ New Intake" to register an animal arriving at the shelter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
