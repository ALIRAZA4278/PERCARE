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
  const [rejectModal, setRejectModal] = useState(null); // { id, type }
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
    setCounts({
      Vets: (vetsRes.data || []).length,
      Stores: (storesRes.data || []).length,
      Shelters: (sheltersRes.data || []).length,
      Products: (productsRes.data || []).length,
    });
    setLoading(false);
  };

  const logAudit = async (action, targetType, targetId, details) => {
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id, action, target_type: targetType, target_id: targetId, details,
    });
  };

  const notify = async (userId, message) => {
    await supabase.from('notifications').insert({
      user_id: userId, message, type: 'system', is_read: false,
    });
  };

  const approveVet = async (vet) => {
    setProcessing(true);
    await supabase.from('vet_profiles').update({ is_approved: true }).eq('id', vet.id);
    await logAudit('approve_vet', 'vet', vet.id, `Approved vet: ${vet.user?.full_name}`);
    if (vet.user_id) await notify(vet.user_id, 'Your vet profile has been approved! You can now receive appointments.');
    setVets(vets.filter(v => v.id !== vet.id));
    setCounts(c => ({ ...c, Vets: c.Vets - 1 }));
    setProcessing(false);
  };

  const rejectVet = async () => {
    if (!rejectReason.trim() || !rejectModal) return;
    setProcessing(true);
    const vet = vets.find(v => v.id === rejectModal.id);
    await supabase.from('vet_profiles').update({ rejection_reason: rejectReason }).eq('id', rejectModal.id);
    await logAudit('reject_vet', 'vet', rejectModal.id, `Rejected: ${rejectReason}`);
    if (vet?.user_id) await notify(vet.user_id, `Your vet profile was not approved. Reason: ${rejectReason}`);
    setVets(vets.filter(v => v.id !== rejectModal.id));
    setCounts(c => ({ ...c, Vets: c.Vets - 1 }));
    setRejectModal(null); setRejectReason(''); setProcessing(false);
  };

  const approveStore = async (store) => {
    setProcessing(true);
    await supabase.from('stores').update({ is_approved: true }).eq('id', store.id);
    await logAudit('approve_store', 'store', store.id, `Approved store: ${store.name}`);
    if (store.owner_id) await notify(store.owner_id, `Your store "${store.name}" has been approved and is now live!`);
    setStores(stores.filter(s => s.id !== store.id));
    setCounts(c => ({ ...c, Stores: c.Stores - 1 }));
    setProcessing(false);
  };

  const rejectStore = async () => {
    if (!rejectReason.trim() || !rejectModal) return;
    setProcessing(true);
    const store = stores.find(s => s.id === rejectModal.id);
    await logAudit('reject_store', 'store', rejectModal.id, `Rejected: ${rejectReason}`);
    if (store?.owner_id) await notify(store.owner_id, `Your store application was rejected. Reason: ${rejectReason}`);
    setStores(stores.filter(s => s.id !== rejectModal.id));
    setCounts(c => ({ ...c, Stores: c.Stores - 1 }));
    setRejectModal(null); setRejectReason(''); setProcessing(false);
  };

  const verifyShelter = async (shelter) => {
    setProcessing(true);
    await supabase.from('shelters').update({ is_verified: true }).eq('id', shelter.id);
    await logAudit('verify_shelter', 'shelter', shelter.id, `Verified shelter: ${shelter.name}`);
    setShelters(shelters.filter(s => s.id !== shelter.id));
    setCounts(c => ({ ...c, Shelters: c.Shelters - 1 }));
    setProcessing(false);
  };

  const rejectShelter = async () => {
    if (!rejectReason.trim() || !rejectModal) return;
    setProcessing(true);
    await logAudit('reject_shelter', 'shelter', rejectModal.id, `Rejected: ${rejectReason}`);
    setShelters(shelters.filter(s => s.id !== rejectModal.id));
    setCounts(c => ({ ...c, Shelters: c.Shelters - 1 }));
    setRejectModal(null); setRejectReason(''); setProcessing(false);
  };

  const approveProduct = async (product) => {
    setProcessing(true);
    await supabase.from('products').update({ is_approved: true }).eq('id', product.id);
    await logAudit('approve_product', 'product', product.id, `Approved product: ${product.name}`);
    setProducts(products.filter(p => p.id !== product.id));
    setCounts(c => ({ ...c, Products: c.Products - 1 }));
    setProcessing(false);
  };

  const rejectProduct = async () => {
    if (!rejectModal) return;
    setProcessing(true);
    await supabase.from('products').update({ is_approved: false, is_active: false }).eq('id', rejectModal.id);
    await logAudit('reject_product', 'product', rejectModal.id, `Rejected: ${rejectReason || 'No reason'}`);
    setProducts(products.filter(p => p.id !== rejectModal.id));
    setCounts(c => ({ ...c, Products: c.Products - 1 }));
    setRejectModal(null); setRejectReason(''); setProcessing(false);
  };

  const handleReject = () => {
    if (!rejectModal) return;
    if (rejectModal.type === 'vet') rejectVet();
    else if (rejectModal.type === 'store') rejectStore();
    else if (rejectModal.type === 'shelter') rejectShelter();
    else if (rejectModal.type === 'product') rejectProduct();
  };

  const btnApprove = "flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors";
  const btnReject = "flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors border border-red-200";

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Approvals</h1>
        <p className="text-sm text-gray-600 mt-1">Review and approve pending applications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}>
            {tab}
            {counts[tab] > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'}`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Vets Tab */}
      {activeTab === 'Vets' && (
        <div className="space-y-3">
          {vets.length === 0 ? (
            <EmptyState label="No pending vet approvals" />
          ) : vets.map((vet) => (
            <div key={vet.id} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{vet.user?.full_name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{vet.user?.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vet.license_number && <Badge label={`License: ${vet.license_number}`} />}
                  {vet.specialization && <Badge label={vet.specialization} />}
                  {vet.qualification && <Badge label={vet.qualification} />}
                </div>
                {vet.certificate_url && (
                  <a href={vet.certificate_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2">
                    <ExternalLink size={12} /> View Certificate
                  </a>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => approveVet(vet)} disabled={processing} className={btnApprove}>
                  <CheckCircle size={14} /> Approve
                </button>
                <button onClick={() => setRejectModal({ id: vet.id, type: 'vet' })} disabled={processing} className={btnReject}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stores Tab */}
      {activeTab === 'Stores' && (
        <div className="space-y-3">
          {stores.length === 0 ? (
            <EmptyState label="No pending store approvals" />
          ) : stores.map((store) => (
            <div key={store.id} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{store.name}</p>
                <p className="text-xs text-gray-500">Owner: {store.owner?.full_name} · {store.owner?.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {store.category && <Badge label={store.category} />}
                  {store.city && <Badge label={store.city} />}
                </div>
                {store.description && <p className="text-xs text-gray-600 mt-2 line-clamp-2">{store.description}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => approveStore(store)} disabled={processing} className={btnApprove}>
                  <CheckCircle size={14} /> Approve
                </button>
                <button onClick={() => setRejectModal({ id: store.id, type: 'store' })} disabled={processing} className={btnReject}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shelters Tab */}
      {activeTab === 'Shelters' && (
        <div className="space-y-3">
          {shelters.length === 0 ? (
            <EmptyState label="No pending shelter verifications" />
          ) : shelters.map((shelter) => (
            <div key={shelter.id} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{shelter.name}</p>
                <p className="text-xs text-gray-500">{shelter.city}{shelter.address ? ` · ${shelter.address}` : ''}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {shelter.contact_phone && <Badge label={shelter.contact_phone} />}
                  {shelter.capacity && <Badge label={`Capacity: ${shelter.capacity}`} />}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => verifyShelter(shelter)} disabled={processing} className={btnApprove}>
                  <CheckCircle size={14} /> Verify
                </button>
                <button onClick={() => setRejectModal({ id: shelter.id, type: 'shelter' })} disabled={processing} className={btnReject}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'Products' && (
        <div className="space-y-3">
          {products.length === 0 ? (
            <EmptyState label="No pending product approvals" />
          ) : products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-xl" /> : <span className="text-2xl">📦</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">Store: {product.store?.name} · Rs. {Number(product.price).toLocaleString()}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.brand && <Badge label={product.brand} />}
                  {product.stock_quantity != null && <Badge label={`Stock: ${product.stock_quantity}`} />}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => approveProduct(product)} disabled={processing} className={btnApprove}>
                  <CheckCircle size={14} /> Approve
                </button>
                <button onClick={() => setRejectModal({ id: product.id, type: 'product' })} disabled={processing} className={btnReject}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setRejectModal(null); setRejectReason(''); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Reject — Add Reason</h3>
                <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this is being rejected..."
                rows={4} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 text-sm resize-none mb-4" />
              <div className="flex gap-2">
                <button onClick={handleReject} disabled={processing || (!rejectReason.trim() && rejectModal.type !== 'product')}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {processing ? 'Processing...' : 'Confirm Reject'}
                </button>
                <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Badge({ label }) {
  return <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{label}</span>;
}

function EmptyState({ label }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
      <div className="text-5xl mb-3">✅</div>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
}
