'use client';

import { useState, useEffect } from 'react';
import { Trash2, Star, Search, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const TARGET_TYPES = ['All', 'vet', 'clinic', 'product', 'store', 'shelter'];

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700 fill-gray-700'} />
      ))}
    </div>
  );
}

const targetColor = {
  vet: 'bg-blue-950 text-blue-400',
  clinic: 'bg-teal-950 text-teal-400',
  product: 'bg-orange-950 text-orange-400',
  store: 'bg-purple-950 text-purple-400',
  shelter: 'bg-green-950 text-green-400',
};

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [targetFilter, setTargetFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => { fetchReviews(); }, []);

  useEffect(() => {
    let r = reviews;
    if (targetFilter !== 'All') r = r.filter(rv => rv.target_type === targetFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(rv =>
        rv.reviewer?.full_name?.toLowerCase().includes(q) ||
        rv.comment?.toLowerCase().includes(q) ||
        rv.target_type?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [reviews, targetFilter, search]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviewer_id(full_name, email)')
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const logAudit = (targetId, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action: 'delete_review', target_type: 'review', target_id: targetId, details });

  const handleDelete = async () => {
    if (!deleteModal) return;
    setProcessing(deleteModal.id);
    await supabase.from('reviews').delete().eq('id', deleteModal.id);
    await logAudit(deleteModal.id, `Deleted review by ${deleteModal.reviewer?.full_name || 'Unknown'}`);
    setReviews(prev => prev.filter(r => r.id !== deleteModal.id));
    setDeleteModal(null);
    setProcessing(null);
  };

  const counts = TARGET_TYPES.reduce((acc, t) => {
    acc[t] = t === 'All' ? reviews.length : reviews.filter(r => r.target_type === t).length;
    return acc;
  }, {});

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '—';

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">{reviews.length} total · Avg rating: {avgRating} ★</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviewer, comment..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-gray-600" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TARGET_TYPES.map(t => (
            <button key={t} onClick={() => setTargetFilter(t)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap flex items-center gap-1.5 transition-colors ${targetFilter === t ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'}`}>
              {t} <span className="opacity-70">({counts[t]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Reviewer</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Rating</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Comment</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">For</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-600 py-12">No reviews found</td></tr>
              ) : filtered.map(review => (
                <tr key={review.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 font-bold text-xs shrink-0">
                        {review.reviewer?.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate max-w-[100px]">{review.reviewer?.full_name || 'Unknown'}</p>
                        <p className="text-gray-600 text-[10px] truncate max-w-[100px]">{review.reviewer?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StarRating rating={review.rating || 0} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell max-w-[200px]">
                    <p className="truncate">{review.comment || <span className="text-gray-600 italic">No comment</span>}</p>
                    {review.reply && <p className="text-[10px] text-blue-400 truncate mt-0.5">Reply: {review.reply}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${targetColor[review.target_type] || 'bg-gray-800 text-gray-400'}`}>
                      {review.target_type || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteModal(review)} disabled={processing === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-red-950 text-red-400 text-xs font-semibold rounded-lg transition-colors border border-gray-700 ml-auto disabled:opacity-50">
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setDeleteModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Delete Review</h3>
                <button onClick={() => setDeleteModal(null)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400"><X size={18} /></button>
              </div>
              <p className="text-sm text-gray-400 mb-1">By: <span className="text-white">{deleteModal.reviewer?.full_name || 'Unknown'}</span></p>
              <div className="mb-2"><StarRating rating={deleteModal.rating || 0} /></div>
              {deleteModal.comment && <p className="text-xs text-gray-500 mb-4 bg-gray-800 px-3 py-2 rounded-lg line-clamp-3">{deleteModal.comment}</p>}
              <p className="text-xs text-red-400 mb-4">This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={processing === deleteModal.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-semibold py-2.5 rounded-lg text-sm">
                  {processing === deleteModal.id ? 'Deleting...' : 'Delete Review'}
                </button>
                <button onClick={() => setDeleteModal(null)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
