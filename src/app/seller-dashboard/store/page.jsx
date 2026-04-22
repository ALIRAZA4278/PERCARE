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
    <Star key={i} size={16} className={i < Math.floor(rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
  ));

  // Store categories (from products brands/categories)
  const storeCategories = ['Dog Food', 'Cat Food', 'Bird Supplies', 'Fish Accessories', 'Grooming', 'Health & Wellness', 'Toys', 'Beds & Cages'];

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  if (!store) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Create Your Store</h2>
          <p className="text-gray-600 mb-6">Set up your store to start selling.</p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Store</h1>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
            <Building2 size={14} /> Register as Company
          </button>
          <button onClick={openEdit}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
            <Edit size={14} /> Edit Store
          </button>
        </div>
      </div>

      {/* Store Profile Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 mb-5">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {store.logo_url ? (
              <img src={store.logo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Store size={32} className="text-orange-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{store.name}</h2>
              {store.is_approved && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 flex items-center gap-1">
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">{store.description || 'No description'}</p>
            <span className="text-xs font-medium px-3 py-1 rounded-full border border-gray-300 text-gray-700">
              {store.store_category || 'General Pet Store'}
            </span>
            <div className="flex items-center gap-1 mt-2">
              {renderStars(store.rating)}
              <span className="text-sm text-gray-600 ml-1">{store.rating || 0} ({store.total_reviews || 0} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Details + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-5">
        {/* Store Details */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Store Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900">{store.address}{store.city ? `, ${store.city}` : ''}</span>
            </div>
            {store.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900">{store.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900">{formData.website || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900">{storeTypeMap[store.location_type] || 'Online Store'}</span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: stats.products, label: 'Products' },
              { value: stats.orders, label: 'Orders' },
              { value: `${stats.fulfillment}%`, label: 'Fulfillment' },
              { value: stats.avgDelivery, label: 'Avg. Delivery' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Store Categories */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Store Categories</h3>
        <div className="flex flex-wrap gap-2">
          {storeCategories.map((cat) => (
            <span key={cat} className="text-sm font-medium px-4 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Edit Store Modal */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="text-lg font-bold text-gray-900">Edit Store Details</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Category</label>
                  <select value={formData.store_category} onChange={(e) => setFormData({ ...formData, store_category: e.target.value })} className={inputClass}>
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Type</label>
                  <select value={formData.store_type} onChange={(e) => setFormData({ ...formData, store_type: e.target.value })} className={inputClass}>
                    {storeTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                  <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="petsupply.pk" className={inputClass} />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">Save Changes</button>
                  <button onClick={() => setShowEditModal(false)} className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200 text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
