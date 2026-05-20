'use client';

import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function RescueRequestModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ animalType: '', breed: '', location: '', situation: '', contact: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from('lost_found_pets').insert({
        reporter_id: user?.id || null,
        type: 'found',
        species: formData.animalType.toLowerCase(),
        breed: formData.breed || null,
        last_seen_location: formData.location,
        description: formData.situation,
        contact_phone: formData.contact || null,
        city: formData.location,
        pet_name: 'Unknown',
      });
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setFormData({ animalType: '', breed: '', location: '', situation: '', contact: '' });
    setSubmitted(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm bg-gray-50";

  if (submitted) return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Rescue Request Submitted!</h2>
          <p className="text-gray-600 text-sm mb-6">Your rescue report has been submitted. Nearby shelters and volunteers will be notified.</p>
          <button onClick={handleClose} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">Close</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-red-500" />
              <h2 className="text-lg font-bold text-gray-900">Report Rescue Request</h2>
            </div>
            <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-700" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Animal Type *</label>
              <select name="animalType" value={formData.animalType} onChange={handleChange} required className={inputClass}>
                <option value="">Select type</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="other">Other</option>
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
            <button type="submit" disabled={submitting} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-sm">
              {submitting ? 'Submitting...' : 'Submit Rescue Request'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
