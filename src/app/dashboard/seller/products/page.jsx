'use client';

import { Search, Plus, Eye, Edit, Trash2, X, ImagePlus, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/upload';

const categoryOptions = ['Food', 'Accessories', 'Health', 'Grooming', 'Hygiene', 'Toys', 'Beds', 'Other'];

export default function SellerProductsPage() {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: 'Food', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: s } = await supabase.from('stores').select('*').eq('owner_id', user.id).single();
    setStore(s);
    if (s) {
      const { data } = await supabase.from('products').select('*').eq('store_id', s.id).order('created_at', { ascending: false });
      setProducts(data || []);
    }
    setLoading(false);
  };

  const openAdd = () => {
    setFormData({ name: '', price: '', stock: '', category: 'Food', description: '' });
    setImageFile(null); setImagePreview(null);
    setShowAddModal(true);
  };

  const openEdit = (p) => {
    setFormData({ name: p.name, price: p.price, stock: p.stock_quantity, category: p.brand || 'Food', description: p.description || '' });
    setImagePreview(p.image_url || null); setImageFile(null);
    setEditProduct(p);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSave = async (isEdit = false) => {
    if (!formData.name || !formData.price || !store) return;
    setSaving(true);
    let image_url = isEdit ? editProduct?.image_url : null;
    if (imageFile) image_url = await uploadImage('product-images', imageFile, user.id);

    const data = {
      store_id: store.id, name: formData.name, price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock) || 0, brand: formData.category,
      description: formData.description || null, image_url, is_active: true, is_approved: true,
    };

    if (isEdit) {
      await supabase.from('products').update(data).eq('id', editProduct.id);
    } else {
      await supabase.from('products').insert(data);
    }
    setSaving(false); setShowAddModal(false); setEditProduct(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p => p.id !== id));
  };

  const getStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-50 text-red-600' };
    if (stock <= 10) return { label: 'Low Stock', color: 'bg-orange-50 text-orange-600' };
    return { label: 'Active', color: 'bg-green-50 text-green-700' };
  };

  const filtered = products.filter(p => {
    const catMatch = activeCategory === 'All' || p.brand === activeCategory;
    const searchMatch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400";

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <button onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 self-start">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search + Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="flex-1 relative max-w-lg">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', ...categoryOptions].map((c) => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                activeCategory === c ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {filtered.map((product) => {
          const status = getStatus(product.stock_quantity);
          return (
            <div key={product.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package size={20} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                <p className="text-xs text-gray-500">{product.brand || 'General'} · {product.total_sold || 0} sold</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="font-bold text-gray-900 text-sm">Rs. {product.price?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                <button onClick={() => setViewProduct(product)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Eye size={16} className="text-gray-400" /></button>
                <button onClick={() => openEdit(product)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Edit size={16} className="text-gray-400" /></button>
                <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} className="text-red-400" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products</h3>
          <p className="text-gray-600">Add your first product to start selling.</p>
        </div>
      )}

      {/* View Product Modal */}
      {viewProduct && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setViewProduct(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl">
              <div className="relative">
                <button onClick={() => setViewProduct(null)} className="absolute top-3 right-3 p-1 bg-white rounded-full shadow hover:bg-gray-100 z-10"><X size={16} className="text-gray-700" /></button>
                <div className="bg-gray-100 rounded-t-2xl h-40 flex items-center justify-center">
                  {viewProduct.image_url ? <img src={viewProduct.image_url} alt="" className="w-full h-full object-cover rounded-t-2xl" /> : <Package size={48} className="text-gray-300" />}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-3">{viewProduct.name}</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><p className="text-xs text-blue-600">Price</p><p className="font-bold text-gray-900">Rs. {viewProduct.price?.toLocaleString()}</p></div>
                  <div><p className="text-xs text-blue-600">Stock</p><p className="font-bold text-gray-900">{viewProduct.stock_quantity}</p></div>
                </div>
                <div className="mb-3"><p className="text-xs text-blue-600">Category</p><p className="font-semibold text-gray-900">{viewProduct.brand || 'General'}</p></div>
                {viewProduct.description && <div><p className="text-xs text-blue-600">Description</p><p className="text-sm text-gray-700">{viewProduct.description}</p></div>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Product Modal */}
      {(showAddModal || editProduct) && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setShowAddModal(false); setEditProduct(null); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="text-lg font-bold text-gray-900">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => { setShowAddModal(false); setEditProduct(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Premium Dog Food" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g., Rs. 2,500" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
                    <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="e.g., 45" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image</label>
                  <input type="file" ref={fileRef} accept="image/*" onChange={handleImageSelect} className="hidden" />
                  <div onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    {imagePreview ? (
                      <img src={imagePreview} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <>
                        <ImagePlus size={24} className="text-gray-400 mb-1" />
                        <p className="text-xs text-gray-400">Click to upload product image</p>
                        <p className="text-[10px] text-gray-300">JPG, PNG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description..." rows={3} className={`${inputClass} resize-none`} />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleSave(!!editProduct)} disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                    {saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                  <button onClick={() => { setShowAddModal(false); setEditProduct(null); }}
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
