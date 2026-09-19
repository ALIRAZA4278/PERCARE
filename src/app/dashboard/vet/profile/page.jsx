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
      <Star key={i} size={16} className={i < Math.floor(rating || 0) ? 'text-amber fill-amber' : 'text-muted-foreground/40'} />
    ));
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  const qualifications = vetProfile?.qualification ? vetProfile.qualification.split(',').map(s => s.trim()) : [];
  const specializations = vetProfile?.services_offered || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
        <button onClick={openEdit}
          className="bg-card border border-border hover:bg-muted text-foreground font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
          <Edit size={14} /> Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl sm:rounded-2xl bg-card shadow-card p-5 sm:p-6 mb-4 sm:mb-5">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-vitality/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span className="text-2xl sm:text-3xl font-bold text-vitality">{profile?.full_name?.charAt(0) || 'D'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{profile?.full_name || 'Doctor'}</h2>
              {profile?.is_verified && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-vitality/10 text-vitality flex items-center gap-1">
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1.5">{vetProfile?.qualification || 'Doctor of Veterinary Medicine'}</p>
            <div className="flex items-center gap-1.5 mb-2">
              {renderStars(vetProfile?.rating)}
              <span className="text-sm text-muted-foreground ml-1">{vetProfile?.rating || 0} ({vetProfile?.total_reviews || 0} reviews)</span>
            </div>
            {profile?.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
          </div>
        </div>
      </div>

      {/* Contact + Qualifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">
        <div className="rounded-xl sm:rounded-2xl bg-card shadow-card p-5 sm:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground">{vetProfile?.contact_email || profile?.email}</span>
            </div>
            {(vetProfile?.contact_phone || profile?.phone) && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground">{vetProfile?.contact_phone || profile?.phone}</span>
              </div>
            )}
            {profile?.city && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground">{profile.city}{profile.country ? `, ${profile.country}` : ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl bg-card shadow-card p-5 sm:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Qualifications</h3>
          <div className="space-y-3">
            {qualifications.length > 0 ? qualifications.map((q, i) => (
              <div key={i} className="flex items-start gap-3">
                <Award size={16} className="text-amber mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{q}</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No qualifications added</p>
            )}
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="rounded-xl sm:rounded-2xl bg-card shadow-card p-5 sm:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Specializations</h3>
        {specializations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {specializations.map((s, i) => (
              <span key={i} className="text-sm font-medium px-4 py-1.5 rounded-full bg-vitality/10 text-vitality border border-vitality/20">{s}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No specializations added. Click Edit Profile to add.</p>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-lg shadow-elevated max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
                <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-muted rounded-lg"><X size={20} className="text-foreground" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input type="text" value={editData.full_name} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                  <textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Experienced veterinarian specializing in..." rows={2}
                    className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                    <input type="text" value={editData.contact_phone} onChange={(e) => setEditData({ ...editData, contact_phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <input type="text" value={editData.contact_email} onChange={(e) => setEditData({ ...editData, contact_email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                    <input type="text" value={editData.city} onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
                    <input type="text" value={editData.country} onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Qualifications (comma separated)</label>
                  <input type="text" value={editData.qualification} onChange={(e) => setEditData({ ...editData, qualification: e.target.value })}
                    placeholder="DVM — University, MVSC — Surgery"
                    className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">License Number</label>
                    <input type="text" value={editData.license_number} onChange={(e) => setEditData({ ...editData, license_number: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Experience (years)</label>
                    <input type="number" value={editData.experience_years} onChange={(e) => setEditData({ ...editData, experience_years: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Specializations / Services (comma separated)</label>
                  <input type="text" value={editData.services_offered} onChange={(e) => setEditData({ ...editData, services_offered: e.target.value })}
                    placeholder="Small Animals, Surgery, Dentistry, Emergency Care"
                    className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Consultation Fee (Rs.)</label>
                  <input type="number" value={editData.consultation_fee} onChange={(e) => setEditData({ ...editData, consultation_fee: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={handleSave}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg btn-press transition-expo text-sm">Save Changes</button>
                  <button onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 bg-card hover:bg-muted text-foreground font-medium rounded-lg transition-colors border border-border text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
