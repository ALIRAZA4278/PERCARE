'use client';

import { X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function RescueRequestModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ animalType: '', breed: '', location: '', situation: '', contact: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Rescue request submitted:', formData);
    onClose();
    setFormData({ animalType: '', breed: '', location: '', situation: '', contact: '' });
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
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-red-500" />
              <h2 className="text-lg font-bold text-gray-900">Report Rescue Request</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-700" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Animal Type *</label>
              <select name="animalType" value={formData.animalType} onChange={handleChange} required className={inputClass}>
                <option value="">Select type</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Breed (if known)</label>
              <input type="text" name="breed" value={formData.breed} onChange={handleChange} placeholder="e.g. German Shepherd, Tabby" className={inputClass} />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Where is the animal?" required className={inputClass} />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Situation *</label>
              <textarea name="situation" value={formData.situation} onChange={handleChange} placeholder="Describe the animal's condition and situation..." rows={4} required className={`${inputClass} resize-none`} />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Contact</label>
              <input type="text" name="contact" value={formData.contact} onChange={handleChange} placeholder="Phone number or email" className={inputClass} />
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-sm">Submit Rescue Request</button>
          </form>
        </div>
      </div>
    </>
  );
}
