'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Pencil, X, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;
const EMPTY_FORM = {
  name: '', description: '', brand: '', price: '', sale_price: '',
  stock_quantity: '', sku: '', is_approved: false, is_active: true, is_medicine: false,
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    let r = products;
    if (filter === 'approved') r = r.filter(p => p.is_approved);
    if (filter === 'pending') r = r.filter(p => !p.is_approved && p.is_active);
    if (filter === 'inactive') r = r.filter(p => !p.is_active);
    if (filter === 'medicine') r = r.filter(p => p.is_medicine);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.store?.name?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
    setPage(0);
  }, [products, search, filter]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, store:stores(name), category:product_categories(name)')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const logAudit = (action, targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target_type: 'product', target_id: targetId, details });

  const handleApprove = async (product) => {
    setProcessing(product.id);
    await supabase.from('products').update({ is_approved: true }).eq('id', product.id);
    await logAudit('approve_product', product.id, `Approved: ${product.name}`);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_approved: true } : p));
    setProcessing(null);
  };

  const handleReject = async (product) => {
    setProcessing(product.id);
    await supabase.from('products').update({ is_approved: false }).eq('id', product.id);
    await logAudit('reject_product', product.id, `Rejected: ${product.name}`);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_approved: false } : p));
    setProcessing(null);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      description: product.description || '',
      brand: product.brand || '',
      price: product.price || '',
      sale_price: product.sale_price || '',
      stock_quantity: product.stock_quantity ?? '',
      sku: product.sku || '',
      is_approved: product.is_approved || false,
      is_active: product.is_active !== false,
      is_medicine: product.is_medicine || false,
    });
    setModal({ id: product.id, name: product.name });
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      brand: form.brand,
      price: form.price ? Number(form.price) : null,
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock_quantity: form.stock_quantity !== '' ? Number(form.stock_quantity) : null,
      sku: form.sku,
      is_approved: form.is_approved,
      is_active: form.is_active,
      is_medicine: form.is_medicine,
    };
    await supabase.from('products').update(payload).eq('id', modal.id);
    await logAudit('edit_product', modal.id, `Updated product: ${form.name}`);
    setProducts(prev => prev.map(p => p.id === modal.id ? { ...p, ...payload } : p));
    setSaving(false);
    setModal(null);
  };

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const counts = {
    all: products.length,
    approved: products.filter(p => p.is_approved).length,
    pending: products.filter(p => !p.is_approved && p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    medicine: products.filter(p => p.is_medicine).length,
  };

  if (loading) return <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center"><p className="text-gray-500 text-sm">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-1">{products.length} total · {counts.approved} approved · {counts.pending} pending · {counts.inactive} inactive</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product, brand, store, category..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'approved', 'pending', 'inactive', 'medicine'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors flex items-center gap-1.5 ${filter === f ? 'bg-red-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
              {f} <span className="opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Store</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Price</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Stock</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-600 py-12 text-sm">No products found</td></tr>
              ) : paged.map(product => (
                <tr key={product.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {product.image_url
                          ? <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                          : <span>📦</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-900 font-medium text-xs truncate max-w-[120px]">{product.name}</p>
                        {product.brand && <p className="text-gray-500 text-[10px] truncate max-w-[120px]">{product.brand}</p>}
                        {product.is_medicine && <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">Medicine</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{product.store?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{product.category?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-semibold text-xs">Rs. {Number(product.price || 0).toLocaleString()}</p>
                    {product.sale_price && <p className="text-green-600 text-[10px]">Sale: Rs. {Number(product.sale_price).toLocaleString()}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell">
                    {product.stock_quantity != null
                      ? <span className={product.stock_quantity < 5 ? 'text-red-600 font-semibold' : 'text-gray-500'}>{product.stock_quantity}</span>
                      : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {!product.is_active
                      ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>
                      : product.is_approved
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Approved</span>
                        : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Pending</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(product)} disabled={processing === product.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-200">
                        <Pencil size={12} /> Edit
                      </button>
                      {product.is_approved ? (
                        <button onClick={() => handleReject(product)} disabled={processing === product.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-colors border border-gray-200 disabled:opacity-40">
                          <XCircle size={12} /> Reject
                        </button>
                      ) : (
                        <button onClick={() => handleApprove(product)} disabled={processing === product.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg transition-colors border border-green-200 disabled:opacity-40">
                          <CheckCircle size={12} /> Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 disabled:opacity-30 hover:border-gray-300"><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 disabled:opacity-30 hover:border-gray-300"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Edit Product</h3>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'brand', label: 'Brand' },
                    { key: 'price', label: 'Price (Rs)', type: 'number' },
                    { key: 'sale_price', label: 'Sale Price (Rs)', type: 'number' },
                    { key: 'stock_quantity', label: 'Stock Quantity', type: 'number' },
                    { key: 'sku', label: 'SKU' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                      <input type={type || 'text'} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm resize-none" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'is_approved', label: 'Approved', accent: 'accent-green-500' },
                    { key: 'is_active', label: 'Active', accent: 'accent-blue-500' },
                    { key: 'is_medicine', label: 'Medicine', accent: 'accent-purple-500' },
                  ].map(({ key, label, accent }) => (
                    <div key={key} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                      <input type="checkbox" id={key} checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                        className={`w-4 h-4 ${accent}`} />
                      <label htmlFor={key} className="text-xs font-medium text-gray-900 cursor-pointer">{label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 disabled:text-gray-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setModal(null)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
