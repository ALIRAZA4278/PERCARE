'use client';

import { useState, useEffect } from 'react';
import { Trash2, Star, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700 fill-gray-700'} />
      ))}
    </div>
  );
}

function targetLabel(review) {
  if (review.vet_id) return { label: 'Vet', id: review.vet_id };
  if (review.store_id) return { label: 'Store', id: review.store_id };
  if (review.shelter_id) return { label: 'Shelter', id: review.shelter_id };
  return { label: 'Unknown', id: null };
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviewer_id(full_name)')
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
    setDeleteModal(null); setProcessing(null);
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">{reviews.length} total reviews</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Reviewer</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Rating</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Comment</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Target</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-600 py-12">No reviews found</td></tr>
              ) : reviews.map(review => {
                const { label, id: tId } = targetLabel(review);
                return (
                  <tr key={review.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 font-bold text-xs shrink-0">
                          {review.reviewer?.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="text-white text-xs font-medium truncate max-w-[100px]">{review.reviewer?.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StarRating rating={review.rating || 0} /></td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell max-w-[200px]">
                      <p className="truncate">{review.comment || <span className="text-gray-600 italic">No comment</span>}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{label}</span>
                        {tId && <p className="text-[10px] text-gray-600 mt-1 font-mono">{tId.slice(0, 6)}...</p>}
                      </div>
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
                );
              })}
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
              <p className="text-sm text-gray-400 mb-2">Review by <span className="text-white">{deleteModal.reviewer?.full_name || 'Unknown'}</span></p>
              {deleteModal.comment && <p className="text-xs text-gray-500 mb-4 bg-gray-800 px-3 py-2 rounded-lg line-clamp-3">{deleteModal.comment}</p>}
              <p className="text-xs text-red-400 mb-4">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={processing === deleteModal.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
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
