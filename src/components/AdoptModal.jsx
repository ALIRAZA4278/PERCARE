'use client';

import { X, Heart } from 'lucide-react';
import { useState } from 'react';

export default function AdoptModal({ isOpen, onClose, animal, shelterName }) {
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', address: '', experience: '', reason: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Adoption application:', { ...formData, animal, shelterName });
    onClose();
    setFormData({ fullName: '', phone: '', email: '', address: '', experience: '', reason: '' });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (!isOpen || !animal) return null;

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm bg-gray-50";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
            <h2 className="text-lg font-bold text-gray-900">Adopt {animal.name}</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-700" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            <div className="bg-blue-600 rounded-xl p-4 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{animal.name} — {animal.breed}</p>
                <p className="text-white/70 text-xs">from {shelterName}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your full name" required className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+92 300 ..." required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" className={inputClass} />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Address *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Your home address" required className={inputClass} />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pet Experience</label>
              <select name="experience" value={formData.experience} onChange={handleChange} className={inputClass}>
                <option value="">Select</option>
                <option value="first-time">First-time owner</option>
                <option value="some">Some experience</option>
                <option value="experienced">Experienced owner</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Why Adopt?</label>
              <textarea name="reason" value={formData.reason} onChange={handleChange} placeholder="Tell us why you'd like to adopt..." rows={3} className={`${inputClass} resize-none`} />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
              <Heart size={16} /> Submit Application
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
