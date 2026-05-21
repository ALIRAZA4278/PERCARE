'use client';

import { CheckCircle, XCircle, X, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const TABS = ['Vets', 'Stores', 'Shelters', 'Products'];

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Vets');
  const [vets, setVets] = useState([]);
  const [stores, setStores] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [products, setProducts] = useState([]);
  const [counts, setCounts] = useState({ Vets: 0, Stores: 0, Shelters: 0, Products: 0 });
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [vetsRes, storesRes, sheltersRes, productsRes] = await Promise.all([
      supabase.from('vet_profiles').select('*, user:profiles(full_name, email)').eq('is_approved', false),
      supabase.from('stores').select('*, owner:profiles(full_name, email)').eq('is_approved', false),
      supabase.from('shelters').select('*').eq('is_verified', false),
      supabase.from('products').select('*, store:stores(name)').eq('is_approved', false).eq('is_active', true),
    ]);
    setVets(vetsRes.data || []);
    setStores(storesRes.data || []);
    setShelters(sheltersRes.data || []);
    setProducts(productsRes.data || []);
    setCounts({ Vets: (vetsRes.data||[]).length, Stores: (storesRes.data||[]).length, Shelters: (sheltersRes.data||[]).length, Products: (productsRes.data||[]).length });
    setLoading(false);
  };

  const logAudit = (action, targetType, targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target_type: targetType, target_id: targetId, details });

  const notify = (userId, message) =>
    supabase.from('notifications').insert({ user_id: userId, message, type: 'system', is_read: false });

  const approveVet = async (vet) => {
    setProcessing(true);
    await supabase.from('vet_profiles').update({ is_approved: true }).eq('id', vet.id);
    await logAudit('approve_vet', 'vet', vet.id, `Approved: ${vet.user?.full_name}`);
    if (vet.user_id) await notify(vet.user_id, 'Your vet profile has been approved!');
    setVets(p => p.filter(v => v.id !== vet.id));
    setCounts(c => ({ ...c, Vets: c.Vets - 1 }));
    setProcessing(false);
  };

  const approveStore = async (store) => {
    setProcessing(true);
    await supabase.from('stores').update({ is_approved: true }).eq('id', store.id);
    await logAudit('approve_store', 'store', store.id, `Approved: ${store.name}`);
    if (store.owner_id) await notify(store.owner_id, `Your store "${store.name}" is now live!`);
    setStores(p => p.filter(s => s.id !== store.id));
    setCounts(c => ({ ...c, Stores: c.Stores - 1 }));
    setProcessing(false);
  };

  const verifyShelter = async (shelter) => {
    setProcessing(true);
    await supabase.from('shelters').update({ is_verified: true }).eq('id', shelter.id);
    await logAudit('verify_shelter', 'shelter', shelter.id, `Verified: ${shelter.name}`);
    setShelters(p => p.filter(s => s.id !== shelter.id));
    setCounts(c => ({ ...c, Shelters: c.Shelters - 1 }));
    setProcessing(false);
  };

  const approveProduct = async (product) => {
    setProcessing(true);
    await supabase.from('products').update({ is_approved: true }).eq('id', product.id);
    await logAudit('approve_product', 'product', product.id, `Approved: ${product.name}`);
    setProducts(p => p.filter(x => x.id !== product.id));
    setCounts(c => ({ ...c, Products: c.Products - 1 }));
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessing(true);
    const { id, type } = rejectModal;
    if (type === 'vet') {
      const vet = vets.find(v => v.id === id);
      await supabase.from('vet_profiles').update({ rejection_reason: rejectReason }).eq('id', id);
      if (vet?.user_id) await notify(vet.user_id, `Vet profile rejected. Reason: ${rejectReason}`);
      await logAudit('reject_vet', 'vet', id, rejectReason);
      setVets(p => p.filter(v => v.id !== id));
      setCounts(c => ({ ...c, Vets: c.Vets - 1 }));
    } else if (type === 'store') {
      const store = stores.find(s => s.id === id);
      if (store?.owner_id) await notify(store.owner_id, `Store rejected. Reason: ${rejectReason}`);
      await logAudit('reject_store', 'store', id, rejectReason);
      setStores(p => p.filter(s => s.id !== id));
      setCounts(c => ({ ...c, Stores: c.Stores - 1 }));
    } else if (type === 'shelter') {
      await logAudit('reject_shelter', 'shelter', id, rejectReason);
      setShelters(p => p.filter(s => s.id !== id));
      setCounts(c => ({ ...c, Shelters: c.Shelters - 1 }));
    } else if (type === 'product') {
      await supabase.from('products').update({ is_active: false }).eq('id', id);
      await logAudit('reject_product', 'product', id, rejectReason || 'Rejected');
      setProducts(p => p.filter(x => x.id !== id));
      setCounts(c => ({ ...c, Products: c.Products - 1 }));
    }
    setRejectModal(null); setRejectReason(''); setProcessing(false);
  };

  const btnA = "flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors";
  const btnR = "flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-red-950 text-red-400 text-xs font-semibold rounded-lg transition-colors border border-gray-700";

  const Card = ({ children, actions }) => (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-5 border border-gray-800 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">{children}</div>
      <div className="flex gap-2 shrink-0">{actions}</div>
    </div>
  );

  const Tag = ({ label }) => <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">{label}</span>;

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve pending applications</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === tab ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'}`}>
            {tab}
            {counts[tab] > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20' : 'bg-red-900 text-red-400'}`}>{counts[tab]}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {activeTab === 'Vets' && (vets.length === 0 ? <Empty /> : vets.map(vet => (
          <Card key={vet.id} actions={[
            <button key="a" onClick={() => approveVet(vet)} disabled={processing} className={btnA}><CheckCircle size={14} /> Approve</button>,
            <button key="r" onClick={() => setRejectModal({ id: vet.id, type: 'vet' })} disabled={processing} className={btnR}><XCircle size={14} /> Reject</button>,
          ]}>
            <p className="font-bold text-white">{vet.user?.full_name || 'Unknown'}</p>
            <p className="text-xs text-gray-500 mb-2">{vet.user?.email}</p>
            <div className="flex flex-wrap gap-1.5">
              {vet.license_number && <Tag label={`License: ${vet.license_number}`} />}
              {vet.specialization && <Tag label={vet.specialization} />}
              {vet.qualification && <Tag label={vet.qualification} />}
            </div>
            {vet.certificate_url && <a href={vet.certificate_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-2"><ExternalLink size={12} /> View Certificate</a>}
          </Card>
        )))}

        {activeTab === 'Stores' && (stores.length === 0 ? <Empty /> : stores.map(store => (
          <Card key={store.id} actions={[
            <button key="a" onClick={() => approveStore(store)} disabled={processing} className={btnA}><CheckCircle size={14} /> Approve</button>,
            <button key="r" onClick={() => setRejectModal({ id: store.id, type: 'store' })} disabled={processing} className={btnR}><XCircle size={14} /> Reject</button>,
          ]}>
            <p className="font-bold text-white">{store.name}</p>
            <p className="text-xs text-gray-500 mb-2">Owner: {store.owner?.full_name} · {store.owner?.email}</p>
            <div className="flex flex-wrap gap-1.5">
              {store.category && <Tag label={store.category} />}
              {store.city && <Tag label={store.city} />}
            </div>
          </Card>
        )))}

        {activeTab === 'Shelters' && (shelters.length === 0 ? <Empty /> : shelters.map(shelter => (
          <Card key={shelter.id} actions={[
            <button key="a" onClick={() => verifyShelter(shelter)} disabled={processing} className={btnA}><CheckCircle size={14} /> Verify</button>,
            <button key="r" onClick={() => setRejectModal({ id: shelter.id, type: 'shelter' })} disabled={processing} className={btnR}><XCircle size={14} /> Reject</button>,
          ]}>
            <p className="font-bold text-white">{shelter.name}</p>
            <p className="text-xs text-gray-500 mb-2">{shelter.city}{shelter.address ? ` · ${shelter.address}` : ''}</p>
            <div className="flex flex-wrap gap-1.5">
              {shelter.contact_phone && <Tag label={shelter.contact_phone} />}
              {shelter.capacity && <Tag label={`Cap: ${shelter.capacity}`} />}
            </div>
          </Card>
        )))}

        {activeTab === 'Products' && (products.length === 0 ? <Empty /> : products.map(product => (
          <Card key={product.id} actions={[
            <button key="a" onClick={() => approveProduct(product)} disabled={processing} className={btnA}><CheckCircle size={14} /> Approve</button>,
            <button key="r" onClick={() => setRejectModal({ id: product.id, type: 'product' })} disabled={processing} className={btnR}><XCircle size={14} /> Reject</button>,
          ]}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-lg" /> : <span>📦</span>}
              </div>
              <div>
                <p className="font-bold text-white">{product.name}</p>
                <p className="text-xs text-gray-500">Store: {product.store?.name} · Rs. {Number(product.price).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        )))}
      </div>

      {rejectModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => { setRejectModal(null); setRejectReason(''); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Reject — Add Reason</h3>
                <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400"><X size={18} /></button>
              </div>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Explain why..." rows={4}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-red-500 text-white text-sm resize-none mb-4 placeholder-gray-600" />
              <div className="flex gap-2">
                <button onClick={handleReject} disabled={processing}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {processing ? 'Processing...' : 'Confirm Reject'}
                </button>
                <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
      <div className="text-4xl mb-3">✅</div>
      <p className="text-gray-500 text-sm">All clear — nothing pending</p>
    </div>
  );
}
