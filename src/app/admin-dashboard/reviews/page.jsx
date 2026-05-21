'use client';

import { Trash2, Star, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviewer_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    setReviews(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setProcessing(true);
    await supabase.from('reviews').delete().eq('id', deleteModal.id);
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id, action: 'delete_review', target_type: 'review',
      target_id: deleteModal.id, details: `Deleted review by ${deleteModal.reviewer?.full_name}`,
    });
    setReviews(prev => prev.filter(r => r.id !== deleteModal.id));
    setDeleteModal(null); setProcessing(false);
  };

  const targetLabel = (review) => {
    if (review.vet_id) return 'Vet review';
    if (review.store_id) return 'Store review';
    if (review.shelter_id) return 'Shelter review';
    return 'Review';
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Review Moderation</h1>
        <p className="text-sm text-gray-600 mt-1">{reviews.length} total reviews</p>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">No reviews yet</p>
          </div>
        ) : reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 flex gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-semibold text-gray-900 text-sm">{review.reviewer?.full_name || 'Anonymous'}</p>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                  {targetLabel(review)}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
              </div>
              {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
              <p className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <button onClick={() => setDeleteModal(review)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors shrink-0 self-start">
              <Trash2 size={16} className="text-red-400" />
            </button>
          </div>
        ))}
      </div>

      {deleteModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeleteModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Review?</h3>
              <p className="text-sm text-gray-600 mb-6">This will permanently delete the review by <strong>{deleteModal.reviewer?.full_name}</strong>. This action cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={processing}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {processing ? 'Deleting...' : 'Delete'}
                </button>
                <button onClick={() => setDeleteModal(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
