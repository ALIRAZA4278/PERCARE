'use client';

import { ArrowLeft, Camera, User } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    fullName: 'Rabah Bin Muhammad',
    email: 'rabah@example.com',
    phone: '+92 300 1234567',
    city: 'Lahore',
    bio: 'Pet lover and proud owner of 3 amazing pets.',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm bg-gray-50";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft size={18} className="text-gray-700" />
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-gray-900">Edit Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                <User size={40} className="text-blue-600" />
              </div>
              <button type="button" className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <Camera size={14} className="text-white" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-sm mt-6 text-sm">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
