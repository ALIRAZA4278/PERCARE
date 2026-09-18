'use client';

import { Edit, Mail, Phone, MapPin, Award, Star, CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function VetProfilePage() {
  const { user, profile, fetchProfile } = useAuth();
  const [vetProfile, setVetProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '', phone: '', city: '', country: '', bio: '',
    qualification: '', specialization: '', license_number: '',
    experience_years: '', consultation_fee: '', contact_phone: '', contact_email: '',
    languages_spoken: '', services_offered: '',
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: vp } = await supabase.from('vet_profiles').select('*').eq('user_id', user.id).single();
    setVetProfile(vp);
    setLoading(false);
  };

  const openEdit = () => {
    setEditData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      city: profile?.city || '',
      country: profile?.country || '',
      bio: profile?.bio || '',
      qualification: vetProfile?.qualification || '',
      specialization: vetProfile?.specialization || '',
      license_number: vetProfile?.license_number || '',
      experience_years: vetProfile?.experience_years || '',
      consultation_fee: vetProfile?.consultation_fee || '',
      contact_phone: vetProfile?.contact_phone || '',
      contact_email: vetProfile?.contact_email || '',
      languages_spoken: vetProfile?.languages_spoken?.join(', ') || '',
      services_offered: vetProfile?.services_offered?.join(', ') || '',
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    // Update profile
    await supabase.from('profiles').update({
      full_name: editData.full_name,
      phone: editData.phone || null,
      city: editData.city || null,
      country: editData.country || null,
      bio: editData.bio || null,
    }).eq('id', user.id);

    // Update or create vet profile
    const vetData = {
      qualification: editData.qualification || null,
      specialization: editData.specialization || null,
      license_number: editData.license_number || null,
      experience_years: editData.experience_years ? parseInt(editData.experience_years) : null,
      consultation_fee: editData.consultation_fee ? parseFloat(editData.consultation_fee) : null,
      contact_phone: editData.contact_phone || null,
      contact_email: editData.contact_email || null,
      languages_spoken: editData.languages_spoken ? editData.languages_spoken.split(',').map(s => s.trim()).filter(Boolean) : [],
      services_offered: editData.services_offered ? editData.services_offered.split(',').map(s => s.trim()).filter(Boolean) : [],
    };

    if (vetProfile) {
      await supabase.from('vet_profiles').update(vetData).eq('id', vetProfile.id);
    } else {
      await supabase.from('vet_profiles').insert({ ...vetData, user_id: user.id });
    }

    await fetchProfile(user.id);
    fetchData();
    setShowEditModal(false);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={16} className={i < Math.floor(rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
    ));
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  const qualifications = vetProfile?.qualification ? vetProfile.qualification.split(',').map(s => s.trim()) : [];
  const specializations = vetProfile?.services_offered || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
        <button onClick={openEdit}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
          <Edit size={14} /> Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-4 sm:mb-5">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span className="text-2xl sm:text-3xl font-bold text-green-600">{profile?.full_name?.charAt(0) || 'D'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile?.full_name || 'Doctor'}</h2>
              {profile?.is_verified && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 flex items-center gap-1">
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1.5">{vetProfile?.qualification || 'Doctor of Veterinary Medicine'}</p>
            <div className="flex items-center gap-1.5 mb-2">
              {renderStars(vetProfile?.rating)}
              <span className="text-sm text-gray-600 ml-1">{vetProfile?.rating || 0} ({vetProfile?.total_reviews || 0} reviews)</span>
            </div>
            {profile?.bio && <p className="text-sm text-gray-500">{profile.bio}</p>}
          </div>
        </div>
      </div>

      {/* Contact + Qualifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900">{vetProfile?.contact_email || profile?.email}</span>
            </div>
            {(vetProfile?.contact_phone || profile?.phone) && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900">{vetProfile?.contact_phone || profile?.phone}</span>
              </div>
            )}
            {profile?.city && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900">{profile.city}{profile.country ? `, ${profile.country}` : ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Qualifications</h3>
          <div className="space-y-3">
            {qualifications.length > 0 ? qualifications.map((q, i) => (
              <div key={i} className="flex items-start gap-3">
                <Award size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-900">{q}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No qualifications added</p>
            )}
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Specializations</h3>
        {specializations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {specializations.map((s, i) => (
              <span key={i} className="text-sm font-medium px-4 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">{s}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No specializations added. Click Edit Profile to add.</p>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" value={editData.full_name} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                  <textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Experienced veterinarian specializing in..." rows={2}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input type="text" value={editData.contact_phone} onChange={(e) => setEditData({ ...editData, contact_phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="text" value={editData.contact_email} onChange={(e) => setEditData({ ...editData, contact_email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <input type="text" value={editData.city} onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                    <input type="text" value={editData.country} onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Qualifications (comma separated)</label>
                  <input type="text" value={editData.qualification} onChange={(e) => setEditData({ ...editData, qualification: e.target.value })}
                    placeholder="DVM — University, MVSC — Surgery"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">License Number</label>
                    <input type="text" value={editData.license_number} onChange={(e) => setEditData({ ...editData, license_number: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience (years)</label>
                    <input type="number" value={editData.experience_years} onChange={(e) => setEditData({ ...editData, experience_years: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Specializations / Services (comma separated)</label>
                  <input type="text" value={editData.services_offered} onChange={(e) => setEditData({ ...editData, services_offered: e.target.value })}
                    placeholder="Small Animals, Surgery, Dentistry, Emergency Care"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Consultation Fee (Rs.)</label>
                  <input type="number" value={editData.consultation_fee} onChange={(e) => setEditData({ ...editData, consultation_fee: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">Save Changes</button>
                  <button onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200 text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
