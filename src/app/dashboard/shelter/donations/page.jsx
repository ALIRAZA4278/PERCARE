'use client';

import { DollarSign, Heart, TrendingUp, Plus, X, Pencil, CreditCard, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ShelterDonationsPage() {
  const { user } = useAuth();
  const [shelter, setShelter] = useState(null);
  const [packages, setPackages] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreatePkg, setShowCreatePkg] = useState(false);
  const [editPkg, setEditPkg] = useState(null);
  const [showBankEdit, setShowBankEdit] = useState(false);

  // Package form
  const [pkgForm, setPkgForm] = useState({ name: '', amount: '', frequency: 'One-time' });
  const [pkgSaving, setPkgSaving] = useState(false);

  // Bank form
  const [bankForm, setBankForm] = useState({ bank_name: '', account_number: '' });
  const [bankSaving, setBankSaving] = useState(false);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: s } = await supabase.from('shelters').select('*').eq('owner_id', user.id).single();
    setShelter(s);
    if (!s) { setLoading(false); return; }

    setBankForm({ bank_name: s.bank_name || '', account_number: s.account_number || '' });

    const [{ data: pkgs }, { data: dons }] = await Promise.all([
      supabase.from('donation_packages').select('*').eq('shelter_id', s.id).order('created_at', { ascending: true }),
      supabase.from('donations')
        .select('*, donor:profiles(full_name), package:donation_packages(name)')
        .eq('shelter_id', s.id).order('created_at', { ascending: false }).limit(20),
    ]);

    setPackages(pkgs || []);
    setDonations(dons || []);
    setLoading(false);
  };

  // Stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthDons = donations.filter(d => new Date(d.created_at) >= startOfMonth);
  const thisMonth = monthDons.reduce((s, d) => s + (d.amount || 0), 0);
  const allTime = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const uniqueDonors = new Set(donations.map(d => d.donor_id || d.id)).size;
  const monthlyGoal = shelter?.monthly_donation_goal || 0;
  const progressPct = monthlyGoal > 0 ? Math.min((thisMonth / monthlyGoal) * 100, 100) : 0;

  // Package helpers
  const openCreate = () => { setPkgForm({ name: '', amount: '', frequency: 'One-time' }); setShowCreatePkg(true); };
  const openEdit = (pkg) => { setEditPkg(pkg); setPkgForm({ name: pkg.name, amount: pkg.amount === null ? 'Custom' : String(pkg.amount), frequency: pkg.is_recurring ? 'Monthly' : 'One-time' }); };

  const getDonorCount = (pkgId) => donations.filter(d => d.package_id === pkgId).length;

  const handleCreatePkg = async () => {
    if (!pkgForm.name.trim()) return;
    setPkgSaving(true);
    const amount = pkgForm.amount === 'Custom' || pkgForm.amount === '' ? null : parseFloat(pkgForm.amount);
    const { data } = await supabase.from('donation_packages').insert({
      shelter_id: shelter.id,
      name: pkgForm.name,
      amount,
      is_recurring: pkgForm.frequency === 'Monthly',
      is_active: false, // pending approval
    }).select().single();
    if (data) setPackages([...packages, data]);
    setPkgSaving(false);
    setShowCreatePkg(false);
  };

  const handleEditPkg = async () => {
    if (!pkgForm.name.trim() || !editPkg) return;
    setPkgSaving(true);
    const amount = pkgForm.amount === 'Custom' || pkgForm.amount === '' ? null : parseFloat(pkgForm.amount);
    const { data } = await supabase.from('donation_packages').update({
      name: pkgForm.name,
      amount,
      is_recurring: pkgForm.frequency === 'Monthly',
    }).eq('id', editPkg.id).select().single();
    if (data) setPackages(packages.map(p => p.id === editPkg.id ? data : p));
    setPkgSaving(false);
    setEditPkg(null);
  };

  const handleBankSave = async () => {
    setBankSaving(true);
    await supabase.from('shelters').update({ bank_name: bankForm.bank_name, account_number: bankForm.account_number }).eq('id', shelter.id);
    setShelter(s => ({ ...s, ...bankForm }));
    setBankSaving(false);
    setShowBankEdit(false);
  };

  const formatK = (n) => n >= 1000 ? `Rs. ${(n / 1000).toFixed(0)}K` : `Rs. ${n}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Donations</h1>
          <p className="text-sm text-teal-600 mt-0.5">Manage donation packages and track contributions</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
          <Plus size={16} /> Create Package
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <DollarSign size={22} className="text-teal-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{formatK(thisMonth)}</p>
          <p className="text-sm text-teal-500 mt-0.5">This Month</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <Heart size={22} className="text-pink-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{uniqueDonors}</p>
          <p className="text-sm text-teal-500 mt-0.5">Total Donors</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <TrendingUp size={22} className="text-teal-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{formatK(allTime)}</p>
          <p className="text-sm text-teal-500 mt-0.5">All Time</p>
        </div>
      </div>

      {/* Monthly Goal Progress */}
      {monthlyGoal > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900">Monthly Goal Progress</span>
            <span className="text-sm font-medium text-gray-600">{formatK(thisMonth)} / {formatK(monthlyGoal)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(to right, #3b82f6, #22c55e)' }} />
          </div>
        </div>
      )}

      {/* Donation Packages */}
      <div className="bg-white rounded-2xl border border-gray-200 mb-5">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Donation Packages</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{pkg.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{pkg.is_recurring ? 'Monthly' : 'One-time'} · {getDonorCount(pkg.id)} donors</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900 text-sm">{pkg.amount ? `Rs. ${Number(pkg.amount).toLocaleString()}` : 'Custom'}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pkg.is_active ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {pkg.is_active ? 'Active' : 'Pending'}
                </span>
                <button onClick={() => openEdit(pkg)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <Pencil size={15} className="text-gray-500" />
                </button>
              </div>
            </div>
          ))}
          {packages.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-10">No donation packages yet. Create one to get started.</p>
          )}
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-2xl border border-gray-200 mb-5">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Bank Details</h3>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <CreditCard size={20} className="text-gray-400" />
            <div>
              {shelter?.bank_name ? (
                <>
                  <p className="font-semibold text-gray-900 text-sm">{shelter.bank_name}</p>
                  <p className="text-xs text-gray-500">Account: {shelter.account_number || '—'}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No bank details added</p>
              )}
            </div>
          </div>
          <button onClick={() => setShowBankEdit(true)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Pencil size={15} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Recent Donations</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {donations.map((don) => {
            const name = don.donor?.full_name || 'Anonymous';
            const initial = name.charAt(0).toUpperCase();
            return (
              <div key={don.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                    {initial}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-teal-600">{don.package?.name || don.donation_type || 'Donation'}{don.description ? ` · ${don.description}` : ''}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-teal-600 text-sm">Rs. {(don.amount || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{formatDate(don.created_at)}</p>
                </div>
              </div>
            );
          })}
          {donations.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-10">No donations received yet.</p>
          )}
        </div>
      </div>

      {/* Create Package Modal */}
      {showCreatePkg && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCreatePkg(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-base font-bold text-gray-900">Create Donation Package</h2>
                <button onClick={() => setShowCreatePkg(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} className="text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                  <input type="text" value={pkgForm.name} onChange={e => setPkgForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Feed a Pet (Daily)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input type="text" value={pkgForm.amount} onChange={e => setPkgForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g., Rs. 500 or Custom"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select value={pkgForm.frequency} onChange={e => setPkgForm(f => ({ ...f, frequency: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 text-sm text-gray-900 bg-white">
                    <option>One-time</option><option>Monthly</option>
                  </select>
                </div>
                <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <AlertCircle size={15} className="text-yellow-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-700">This package will be submitted for approval before going live.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreatePkg} disabled={pkgSaving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    {pkgSaving ? 'Submitting...' : 'Submit for Approval'}
                  </button>
                  <button onClick={() => setShowCreatePkg(false)} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Package Modal */}
      {editPkg && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditPkg(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-base font-bold text-gray-900">Edit Package</h2>
                <button onClick={() => setEditPkg(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} className="text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                  <input type="text" value={pkgForm.name} onChange={e => setPkgForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-blue-400 outline-none ring-2 ring-blue-100 text-sm text-gray-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rs.</span>
                    <input type="text" value={pkgForm.amount} onChange={e => setPkgForm(f => ({ ...f, amount: e.target.value }))}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select value={pkgForm.frequency} onChange={e => setPkgForm(f => ({ ...f, frequency: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 text-sm text-gray-900 bg-white">
                    <option>One-time</option><option>Monthly</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleEditPkg} disabled={pkgSaving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    {pkgSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditPkg(null)} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bank Details Edit Modal */}
      {showBankEdit && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowBankEdit(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-base font-bold text-gray-900">Edit Bank Details</h2>
                <button onClick={() => setShowBankEdit(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} className="text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input type="text" value={bankForm.bank_name} onChange={e => setBankForm(f => ({ ...f, bank_name: e.target.value }))} placeholder="e.g., Meezan Bank — Safe Paws Trust"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input type="text" value={bankForm.account_number} onChange={e => setBankForm(f => ({ ...f, account_number: e.target.value }))} placeholder="e.g., 0123-4567890-01"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleBankSave} disabled={bankSaving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    {bankSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setShowBankEdit(false)} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
