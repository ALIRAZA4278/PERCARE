'use client';

import { Users, CheckCircle, Star, MapPin, Phone, Clock, Edit, Plus, X, Building2, Search, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function VetClinicPage() {
  const { user, profile } = useAuth();
  const [vetProfile, setVetProfile] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ vets: 0, patients: 0, rating: 0 });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', address: '', city: '', phone: '', working_hours: '', closed_days: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ name: '', address: '', city: '', phone: '' });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [inviting, setInviting] = useState(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: vp } = await supabase.from('vet_profiles').select('*').eq('user_id', user.id).single();
    setVetProfile(vp);
    if (!vp) { setLoading(false); return; }

    // Check if vet owns a clinic
    const { data: ownedClinic } = await supabase.from('clinics').select('*').eq('owner_id', user.id).single();

    // Or check if vet is part of a clinic
    let clinicData = ownedClinic;
    if (!clinicData) {
      const { data: membership } = await supabase.from('clinic_vets')
        .select('clinic:clinics(*)').eq('vet_id', vp.id).eq('status', 'approved').limit(1).single();
      if (membership?.clinic) clinicData = membership.clinic;
    }

    if (clinicData) {
      setClinic(clinicData);
      // Fetch team members
      const { data: members } = await supabase.from('clinic_vets')
        .select('*, vet:vet_profiles(specialization, user:profiles(full_name))')
        .eq('clinic_id', clinicData.id).eq('status', 'approved');

      const team = [
        { name: profile?.full_name, specialization: vp.specialization || 'General Practice', role: clinicData.owner_id === user.id ? 'Owner' : 'Associate', initial: profile?.full_name?.charAt(0) },
        ...(members || []).filter(m => m.vet?.user?.full_name !== profile?.full_name).map(m => ({
          name: m.vet?.user?.full_name || 'Doctor', specialization: m.vet?.specialization || 'General', role: 'Associate', initial: m.vet?.user?.full_name?.charAt(0) || 'D',
        })),
      ];
      setTeamMembers(team);

      // Fetch services
      const { data: svc } = await supabase.from('clinic_services').select('*').eq('clinic_id', clinicData.id).eq('is_active', true);
      setServices(svc || []);

      // Stats
      const { count: patientCount } = await supabase.from('appointments')
        .select('pet_owner_id', { count: 'exact', head: true }).eq('clinic_id', clinicData.id);
      setStats({ vets: team.length, patients: patientCount || 0, rating: clinicData.rating || 0 });
    }

    setLoading(false);
  };

  const searchVets = async (query) => {
    setInviteSearch(query);
    if (query.trim().length < 2) { setSearchResults([]); return; }
    // Get existing team vet IDs
    const existingVetIds = teamMembers.map(m => m.vetProfileId).filter(Boolean);
    const { data } = await supabase
      .from('vet_profiles')
      .select('id, specialization, user:profiles(full_name, email)')
      .neq('user_id', user.id);
    const filtered = (data || []).filter(v =>
      !existingVetIds.includes(v.id) &&
      (v.user?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
       v.user?.email?.toLowerCase().includes(query.toLowerCase()) ||
       v.specialization?.toLowerCase().includes(query.toLowerCase()))
    );
    setSearchResults(filtered);
  };

  const handleInviteVet = async (vetId, vetUserId) => {
    if (!clinic) return;
    setInviting(vetId);
    // Add to clinic_vets as pending
    await supabase.from('clinic_vets').insert({
      clinic_id: clinic.id, vet_id: vetId, status: 'pending',
    });
    // Send notification to the vet
    await supabase.from('notifications').insert({
      user_id: vetUserId,
      title: 'Clinic Invitation',
      message: `You have been invited to join ${clinic.name}. Check your clinic page to accept.`,
      type: 'approval',
    });
    setInviting(null);
    setSearchResults(searchResults.filter(v => v.id !== vetId));
  };

  const openEditModal = () => {
    if (!clinic) return;
    const hours = clinic.opening_time && clinic.closing_time
      ? `${clinic.working_days?.join(', ') || 'Mon-Sat'}: ${clinic.opening_time} — ${clinic.closing_time}` : '';
    setEditData({
      name: clinic.name, address: clinic.address, city: `${clinic.city || ''}${clinic.country ? `, ${clinic.country}` : ''}`,
      phone: clinic.phone || '', working_hours: hours, closed_days: '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!clinic) return;
    const cityParts = editData.city.split(',').map(s => s.trim());
    await supabase.from('clinics').update({
      name: editData.name, address: editData.address,
      city: cityParts[0] || '', country: cityParts.slice(1).join(', ') || null,
      phone: editData.phone || null,
    }).eq('id', clinic.id);
    setClinic({ ...clinic, name: editData.name, address: editData.address, city: cityParts[0], phone: editData.phone });
    setShowEditModal(false);
  };

  const handleCreateClinic = async () => {
    if (!createData.name || !createData.address || !createData.city) return;
    const { data } = await supabase.from('clinics').insert({
      owner_id: user.id, name: createData.name, address: createData.address,
      city: createData.city, phone: createData.phone || null,
    }).select().single();
    if (data) {
      setClinic(data);
      setShowCreateModal(false);
      fetchData();
    }
  };

  const avatarColors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-orange-100 text-orange-600'];

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  // No clinic — show create option
  if (!clinic) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏥</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Clinic Yet</h2>
          <p className="text-gray-600 mb-6">Create your own clinic or join an existing one.</p>
          <button onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm inline-flex items-center gap-2">
            <Plus size={16} /> Create Clinic
          </button>

          {/* Create Clinic Modal */}
          {showCreateModal && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCreateModal(false)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl text-left">
                  <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Create Clinic</h2>
                    <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-700" /></button>
                  </div>
                  <div className="p-5 space-y-4">
                    {[
                      { label: 'Clinic Name', key: 'name', placeholder: 'PawCare Veterinary Clinic' },
                      { label: 'Address', key: 'address', placeholder: '123 Pet Street, Gulberg III' },
                      { label: 'City', key: 'city', placeholder: 'Lahore' },
                      { label: 'Phone', key: 'phone', placeholder: '+92 42 1234567' },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                        <input type="text" value={createData[key]} onChange={(e) => setCreateData({ ...createData, [key]: e.target.value })}
                          placeholder={placeholder} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <button onClick={handleCreateClinic} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">Create Clinic</button>
                      <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200 text-sm">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{clinic.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {clinic.is_approved && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 flex items-center gap-1">
                <CheckCircle size={10} /> Verified
              </span>
            )}
            <span className="text-xs text-gray-500">Clinic ID: {clinic.id.slice(0, 12).toUpperCase()}</span>
          </div>
        </div>
        {clinic.owner_id === user.id && (
          <button onClick={openEditModal}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 self-start">
            <Edit size={14} /> Edit Clinic Details
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { icon: Users, value: stats.vets, label: 'Veterinarians', color: 'text-blue-600' },
          { icon: CheckCircle, value: stats.patients, label: 'Patients Served', color: 'text-green-600' },
          { icon: Star, value: `${stats.rating}★`, label: 'Average Rating', color: 'text-yellow-600' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={18} className={color} />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs sm:text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Clinic Details + Team Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Clinic Details</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{clinic.address}</p>
                <p className="text-xs text-gray-500">{clinic.city}{clinic.country ? `, ${clinic.country}` : ''}</p>
              </div>
            </div>
            {clinic.phone && (
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-gray-400 flex-shrink-0" />
                <p className="text-sm font-semibold text-gray-900">{clinic.phone}</p>
              </div>
            )}
            {clinic.opening_time && (
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {clinic.working_days?.join(', ') || 'Mon — Sat'} : {clinic.opening_time} — {clinic.closing_time}
                  </p>
                  <p className="text-xs text-gray-500">Sunday: Closed</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Team Members</h3>
            {clinic.owner_id === user.id && (
              <button onClick={() => setShowInviteModal(true)} className="text-sm font-medium text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                <Plus size={14} /> Invite
              </button>
            )}
          </div>
          <div className="space-y-3">
            {teamMembers.map((member, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                  {member.initial || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.specialization}</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Offered */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Services Offered</h3>
        {services.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {services.map((svc) => (
              <span key={svc.id} className="text-sm font-medium px-4 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                {svc.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No services listed yet.</p>
        )}
      </div>

      {/* Edit Clinic Modal */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-lg font-bold text-gray-900">Edit Clinic Details</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: 'Clinic Name', key: 'name' },
                  { label: 'Address', key: 'address' },
                  { label: 'City', key: 'city' },
                  { label: 'Phone', key: 'phone' },
                  { label: 'Working Hours', key: 'working_hours' },
                  { label: 'Closed Days', key: 'closed_days' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input type="text" value={editData[key]} onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveEdit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">Save Changes</button>
                  <button onClick={() => setShowEditModal(false)} className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200 text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Invite Vet Modal */}
      {showInviteModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setShowInviteModal(false); setSearchResults([]); setInviteSearch(''); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="text-lg font-bold text-gray-900">Invite Veterinarian</h2>
                <button onClick={() => { setShowInviteModal(false); setSearchResults([]); setInviteSearch(''); }} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-700" /></button>
              </div>
              <div className="p-5">
                <div className="relative mb-4">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search by name, email, or specialization..." value={inviteSearch}
                    onChange={(e) => searchVets(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((vet, i) => (
                      <div key={vet.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600'][i % 3]}`}>
                          {vet.user?.full_name?.charAt(0) || 'D'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{vet.user?.full_name || 'Veterinarian'}</p>
                          <p className="text-xs text-gray-500">{vet.specialization || 'General Practice'} · {vet.user?.email}</p>
                        </div>
                        <button onClick={() => handleInviteVet(vet.id, vet.user_id)}
                          disabled={inviting === vet.id}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white flex items-center gap-1 transition-colors flex-shrink-0">
                          <UserPlus size={12} />
                          {inviting === vet.id ? '...' : 'Invite'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : inviteSearch.length >= 2 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No veterinarians found</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Search for veterinarians to invite</p>
                    <p className="text-xs text-gray-400 mt-1">Type at least 2 characters to search</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
