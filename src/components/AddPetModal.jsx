'use client';

import { X, Camera, Plus, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uploadImage } from '@/lib/upload';

export default function AddPetModal({ isOpen, onClose, onAdd }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '', species: '', breed: '', age_years: '', age_months: '',
    gender: '', weight: '', color: '', medical_notes: '', is_neutered: false,
  });
  const [vaccines, setVaccines] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let image_url = null;
      if (imageFile && user) {
        image_url = await uploadImage('pet-images', imageFile, user.id);
      }
      if (onAdd) await onAdd({ ...formData, vaccines, image_url });
      onClose();
      setFormData({
        name: '', species: '', breed: '', age_years: '', age_months: '',
        gender: '', weight: '', color: '', medical_notes: '', is_neutered: false,
      });
      setVaccines([]);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error('Error adding pet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const addVaccine = () => {
    setVaccines([...vaccines, { vaccine_name: '', date_given: '', next_due_date: '' }]);
  };

  const updateVaccine = (index, field, value) => {
    const updated = [...vaccines];
    updated[index][field] = value;
    setVaccines(updated);
  };

  const removeVaccine = (index) => {
    setVaccines(vaccines.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm bg-gray-50";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
            <h2 className="text-lg font-bold text-gray-900">Add New Pet</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-700" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {/* Photo Upload */}
            <div className="flex justify-center mb-5">
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} className="hidden" />
              <div onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300 overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={24} className="text-gray-400" />
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pet Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Buddy" required className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Species *</label>
                <select name="species" value={formData.species} onChange={handleChange} required className={inputClass}>
                  <option value="">Select</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="fish">Fish</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Breed</label>
                <input type="text" name="breed" value={formData.breed} onChange={handleChange} placeholder="e.g. Labrador" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Age (Years)</label>
                <input type="number" name="age_years" value={formData.age_years} onChange={handleChange} placeholder="0" min="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Age (Months)</label>
                <input type="number" name="age_months" value={formData.age_months} onChange={handleChange} placeholder="0" min="0" max="11" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="5" step="0.1" min="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="Golden" className={inputClass} />
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_neutered" checked={formData.is_neutered} onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Neutered / Spayed</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Medical Notes</label>
              <textarea name="medical_notes" value={formData.medical_notes} onChange={handleChange}
                placeholder="Any allergies, conditions, or notes..." rows={3} className={inputClass} />
            </div>

            {/* Vaccination History */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Vaccination History</label>
                <button type="button" onClick={addVaccine}
                  className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700">
                  <Plus size={14} /> Add Vaccine
                </button>
              </div>
              {vaccines.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-lg">No vaccines added yet</p>
              )}
              {vaccines.map((v, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Vaccine #{i + 1}</span>
                    <button type="button" onClick={() => removeVaccine(i)} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input type="text" placeholder="Vaccine name (e.g. Rabies)" value={v.vaccine_name}
                    onChange={(e) => updateVaccine(i, 'vaccine_name', e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-200 text-sm mb-2 outline-none focus:border-blue-500" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 mb-1 block">Date Given</label>
                      <input type="date" value={v.date_given}
                        onChange={(e) => updateVaccine(i, 'date_given', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-200 text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 mb-1 block">Next Due</label>
                      <input type="date" value={v.next_due_date}
                        onChange={(e) => updateVaccine(i, 'next_due_date', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-200 text-sm outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-sm">
              {isLoading ? 'Adding Pet...' : 'Add Pet'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
