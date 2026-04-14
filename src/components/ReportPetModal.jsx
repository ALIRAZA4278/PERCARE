'use client';

import { X, Camera } from 'lucide-react';
import { useState } from 'react';

export default function ReportPetModal({ isOpen, onClose, onSubmit }) {
  const [reportType, setReportType] = useState('lost');
  const [formData, setFormData] = useState({
    pet_name: '', species: '', breed: '', color: '',
    last_seen_location: '', last_seen_date: '', city: '',
    contact_phone: '', contact_email: '', description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (onSubmit) await onSubmit({ ...formData, type: reportType });
      onClose();
      setFormData({
        pet_name: '', species: '', breed: '', color: '',
        last_seen_location: '', last_seen_date: '', city: '',
        contact_phone: '', contact_email: '', description: '',
      });
      setReportType('lost');
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
            <h2 className="text-xl font-bold text-gray-900">Report a Pet</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-700" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {/* Report Type */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button type="button" onClick={() => setReportType('lost')} className={`py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${reportType === 'lost' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Lost</button>
              <button type="button" onClick={() => setReportType('found')} className={`py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${reportType === 'found' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Found</button>
            </div>

            {/* Photo Upload Placeholder */}
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
                <Camera size={24} className="text-gray-400" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {reportType === 'lost' ? 'Pet Name' : 'Pet Name (if known)'} <span className="text-red-500">*</span>
              </label>
              <input type="text" name="pet_name" value={formData.pet_name} onChange={handleChange}
                placeholder={reportType === 'lost' ? 'Enter pet name' : 'Unknown or name if known'} required className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Species <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                <input type="text" name="breed" value={formData.breed} onChange={handleChange} placeholder="Optional" className={inputClass} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color / Markings</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="e.g. Brown with white spots" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {reportType === 'lost' ? 'Last Seen Location' : 'Found Location'} <span className="text-red-500">*</span>
                </label>
                <input type="text" name="last_seen_location" value={formData.last_seen_location} onChange={handleChange}
                  placeholder="Area / street" required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Lahore" required className={inputClass} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {reportType === 'lost' ? 'Last Seen Date' : 'Found Date'}
              </label>
              <input type="date" name="last_seen_date" value={formData.last_seen_date} onChange={handleChange} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone <span className="text-red-500">*</span></label>
                <input type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleChange}
                  placeholder="+92 3XX XXXXXXX" required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange}
                  placeholder="Optional" className={inputClass} />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} required
                placeholder="Distinguishing features, collar details, behavior..." rows={4} className={`${inputClass} resize-none py-3`} />
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-sm">
              {isLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
