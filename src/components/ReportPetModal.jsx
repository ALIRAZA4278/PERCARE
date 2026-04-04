'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export default function ReportPetModal({ isOpen, onClose }) {
  const [reportType, setReportType] = useState('lost'); // 'lost' or 'found'
  const [formData, setFormData] = useState({
    petName: '',
    species: '',
    breed: '',
    location: '',
    contactNumber: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Report submitted:', { ...formData, type: reportType });
    // Handle form submission
    onClose();
    // Reset form
    setFormData({
      petName: '',
      species: '',
      breed: '',
      location: '',
      contactNumber: '',
      description: '',
    });
    setReportType('lost');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
            <h2 className="text-xl font-bold text-gray-900">Report a Pet</h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {/* Lost/Found Toggle */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setReportType('lost')}
                className={`py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  reportType === 'lost'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Lost
              </button>
              <button
                type="button"
                onClick={() => setReportType('found')}
                className={`py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  reportType === 'found'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Found
              </button>
            </div>

            {/* Pet Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="petName"
                value={formData.petName}
                onChange={handleChange}
                placeholder={reportType === 'lost' ? 'Enter pet name' : 'Unknown or name if known'}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm"
              />
            </div>

            {/* Species and Breed */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  placeholder="Dog, Cat, Bird..."
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm"
                />
              </div>
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {reportType === 'lost' ? 'Last Seen Location' : 'Found Location'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Area, city"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm"
              />
            </div>

            {/* Contact Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="+92 3XX XXXXXXX"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Color, distinguishing features, collar details..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-sm"
            >
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
