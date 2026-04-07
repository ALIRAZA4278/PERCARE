'use client';

import { X, Camera } from 'lucide-react';
import { useState } from 'react';

export default function AddPetModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({ name: '', species: '', breed: '', age: '', gender: '', weight: '', color: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Add pet:', formData);
    if (onAdd) onAdd(formData);
    onClose();
    setFormData({ name: '', species: '', breed: '', age: '', gender: '', weight: '', color: '' });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm bg-gray-50";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
            <h2 className="text-lg font-bold text-gray-900">Add New Pet</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-700" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {/* Photo Placeholder */}
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
                <Camera size={24} className="text-gray-400" />
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
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Breed</label>
                <input type="text" name="breed" value={formData.breed} onChange={handleChange} placeholder="e.g. Labrador" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Age</label>
                <input type="text" name="age" value={formData.age} onChange={handleChange} placeholder="2 years" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Weight</label>
                <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="5 kg" className={inputClass} />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="e.g. Golden" className={inputClass} />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-sm">Add Pet</button>
          </form>
        </div>
      </div>
    </>
  );
}
