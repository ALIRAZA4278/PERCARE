'use client';

import { Store, MapPin, Phone, Globe, Building2, Edit, X, Star, CheckCircle, Package, ClipboardList, TrendingUp, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const categoryOptions = ['General Pet Store', 'Pet Food', 'Accessories', 'Medicine', 'Grooming', 'Health & Wellness'];
const storeTypeOptions = ['Physical Store', 'Online Store', 'Physical + Online Store'];
const storeTypeMap = { physical: 'Physical Store', online: 'Online Store', both: 'Physical + Online Store' };
const reverseStoreTypeMap = { 'Physical Store': 'physical', 'Online Store': 'online', 'Physical + Online Store': 'both' };

export default function SellerStorePage() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState({ products: 0, orders: 0, fulfillment: 0, avgDelivery: '—' });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', store_category: '', store_type: 'Physical + Online Store',
    address: '', phone: '', website: '',
  });
  const [createForm, setCreateForm] = useState({ name: '', description: '', store_category: 'General Pet Store', address: '', city: '', phone: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: s } = await supabase.from('stores').select('*').eq('owner_id', user.id).single();
    setStore(s);
    if (s) {
      const [productsRes, ordersRes, deliveredRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', s.id),
        supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('store_id', s.id),
        supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('store_id', s.id).eq('item_status', 'delivered'),
      ]);
      const totalOrders = ordersRes.count || 0;
      const delivered = deliveredRes.count || 0;
      setStats({
        products: productsRes.count || 0,
        orders: totalOrders,
        fulfillment: totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0,
        avgDelivery: '2.1d',
      });
    }
    setLoading(false);
  };

  const openEdit = () => {
    if (!store) return;
    setFormData({
      name: store.name || '', description: store.description || '',
      store_category: store.store_category || 'General Pet Store',
      store_type: storeTypeMap[store.location_type] || 'Physical + Online Store',
      address: `${store.address || ''}${store.city ? ', ' + store.city : ''}`,
      phone: store.phone || '', website: store.website || '',
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!store || !formData.name) return;
    const addressParts = formData.address.split(',').map(s => s.trim());
    await supabase.from('stores').update({
      name: formData.name, description: formData.description || null,
      store_category: formData.store_category || null,
      location_type: reverseStoreTypeMap[formData.store_type] || 'both',
      address: addressParts[0] || null, city: addressParts[1] || store.city || null,
      phone: formData.phone || null,
    }).eq('id', store.id);
    fetchData();
    setShowEditModal(false);
  };

  const renderStars = (rating) => [...Array(5)].map((_, i) => (
    <Star key={i} size={16} className={i < Math.floor(rating || 0) ? 'text-amber fill-amber' : 'text-muted-foreground/40'} />
  ));

  // Store categories (from products brands/categories)
  const storeCategories = ['Dog Food', 'Cat Food', 'Bird Supplies', 'Fish Accessories', 'Grooming', 'Health & Wellness', 'Toys', 'Beds & Cages'];

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  const handleCreateStore = async () => {
    if (!createForm.name.trim()) return;
    setCreating(true);
    const { data } = await supabase.from('stores').insert({
      owner_id: user.id,
      name: createForm.name,
      description: createForm.description || null,
      store_category: createForm.store_category || null,
      address: createForm.address || null,
      city: createForm.city || null,
      phone: createForm.phone || null,
      location_type: 'both',
    }).select().single();
    if (data) setStore(data);
    setCreating(false);
  };

  if (!store) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">My Store</h1>
        <div className="bg-card rounded-2xl border border-border p-6 max-w-xl">
          <h2 className="text-lg font-bold text-foreground mb-1">Create Your Store</h2>
          <p className="text-sm text-muted-foreground mb-5">Set up your store to start selling products.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Store Name *</label>
              <input type="text" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., PetCare Supplies"
                className="w-full px-4 py-2.5 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe your store..."
                className="w-full px-4 py-2.5 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select value={createForm.store_category} onChange={e => setCreateForm(f => ({ ...f, store_category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border outline-none focus:border-primary text-sm text-foreground bg-card">
                  {categoryOptions.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                <input type="text" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92 300 1234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-border outline-none focus:border-primary text-sm text-foreground bg-card placeholder:text-muted-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                <input type="text" value={createForm.address} onChange={e => setCreateForm(f => ({ ...f, address: e.target.value }))} placeholder="Street address"
                  className="w-full px-4 py-2.5 rounded-xl border border-border outline-none focus:border-primary text-sm text-foreground bg-card placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">City</label>
                <input type="text" value={createForm.city} onChange={e => setCreateForm(f => ({ ...f, city: e.target.value }))} placeholder="e.g., Karachi"
                  className="w-full px-4 py-2.5 rounded-xl border border-border outline-none focus:border-primary text-sm text-foreground bg-card placeholder:text-muted-foreground" />
              </div>
            </div>
            <button onClick={handleCreateStore} disabled={creating || !createForm.name.trim()}
              className="w-full bg-amber hover:bg-amber/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              {creating ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Store</h1>
        <div className="flex items-center gap-3">
          <button className="bg-card border border-border hover:bg-muted text-foreground font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
            <Building2 size={14} /> Register as Company
          </button>
          <button onClick={openEdit}
            className="bg-card border border-border hover:bg-muted text-foreground font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
            <Edit size={14} /> Edit Store
          </button>
        </div>
      </div>

      {/* Store Profile Card */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-border mb-5">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber/10 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {store.logo_url ? (
              <img src={store.logo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Store size={32} className="text-amber" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{store.name}</h2>
              {store.is_approved && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-vitality/10 text-vitality flex items-center gap-1">
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{store.description || 'No description'}</p>
            <span className="text-xs font-medium px-3 py-1 rounded-full border border-border text-foreground">
              {store.store_category || 'General Pet Store'}
            </span>
            <div className="flex items-center gap-1 mt-2">
              {renderStars(store.rating)}
              <span className="text-sm text-muted-foreground ml-1">{store.rating || 0} ({store.total_reviews || 0} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Details + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-5">
        {/* Store Details */}
        <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Store Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground">{store.address}{store.city ? `, ${store.city}` : ''}</span>
            </div>
            {store.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground">{store.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground">{formData.website || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground">{storeTypeMap[store.location_type] || 'Online Store'}</span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: stats.products, label: 'Products' },
              { value: stats.orders, label: 'Orders' },
              { value: `${stats.fulfillment}%`, label: 'Fulfillment' },
              { value: stats.avgDelivery, label: 'Avg. Delivery' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-muted rounded-xl p-4 text-center border border-border">
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Store Categories */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Store Categories</h3>
        <div className="flex flex-wrap gap-2">
          {storeCategories.map((cat) => (
            <span key={cat} className="text-sm font-medium px-4 py-1.5 rounded-full bg-vitality/10 text-vitality border border-vitality/20">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Edit Store Modal */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-sm shadow-elevated max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
                <h2 className="text-lg font-bold text-foreground">Edit Store Details</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-muted rounded-lg"><X size={20} className="text-foreground" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Store Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Store Category</label>
                  <select value={formData.store_category} onChange={(e) => setFormData({ ...formData, store_category: e.target.value })} className={inputClass}>
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Store Type</label>
                  <select value={formData.store_type} onChange={(e) => setFormData({ ...formData, store_type: e.target.value })} className={inputClass}>
                    {storeTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Website</label>
                  <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="petsupply.pk" className={inputClass} />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">Save Changes</button>
                  <button onClick={() => setShowEditModal(false)} className="px-4 py-2.5 bg-card hover:bg-muted text-foreground font-medium rounded-lg transition-colors border border-border text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
