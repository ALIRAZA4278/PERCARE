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
        <Star key={i} size={13} className={i <= rating ? 'text-amber fill-amber' : 'text-muted-foreground/40 fill-muted'} />
      ))}
    </div>
  );
}

const targetColor = {
  vet: 'bg-primary/10 text-primary',
  clinic: 'bg-vitality/10 text-vitality',
  product: 'bg-amber/10 text-amber',
  store: 'bg-primary/10 text-primary',
  shelter: 'bg-vitality/10 text-vitality',
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

  if (loading) return <div className="flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">{reviews.length} total · Avg rating: {avgRating} ★</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviewer, comment..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TARGET_TYPES.map(t => (
            <button key={t} onClick={() => setTargetFilter(t)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap flex items-center gap-1.5 transition-colors ${targetFilter === t ? 'bg-primary text-white' : 'bg-card text-muted-foreground border border-border hover:border-border'}`}>
              {t} <span className="opacity-70">({counts[t]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Reviewer</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Rating</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Comment</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">For</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-12">No reviews found</td></tr>
              ) : filtered.map(review => (
                <tr key={review.id} className="border-b border-border last:border-0 hover:bg-muted transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold text-xs shrink-0">
                        {review.reviewer?.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground text-xs font-medium truncate max-w-[100px]">{review.reviewer?.full_name || 'Unknown'}</p>
                        <p className="text-muted-foreground text-[10px] truncate max-w-[100px]">{review.reviewer?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StarRating rating={review.rating || 0} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell max-w-[200px]">
                    <p className="truncate">{review.comment || <span className="text-muted-foreground italic">No comment</span>}</p>
                    {review.reply && <p className="text-[10px] text-primary truncate mt-0.5">Reply: {review.reply}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${targetColor[review.target_type] || 'bg-muted text-muted-foreground'}`}>
                      {review.target_type || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteModal(review)} disabled={processing === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-emergency/10 text-emergency text-xs font-semibold rounded-lg transition-colors border border-border ml-auto disabled:opacity-50">
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
            <div className="bg-card rounded-2xl w-full max-w-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Delete Review</h3>
                <button onClick={() => setDeleteModal(null)} className="p-1 hover:bg-muted rounded-lg text-muted-foreground"><X size={18} /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-1">By: <span className="text-foreground">{deleteModal.reviewer?.full_name || 'Unknown'}</span></p>
              <div className="mb-2"><StarRating rating={deleteModal.rating || 0} /></div>
              {deleteModal.comment && <p className="text-xs text-muted-foreground bg-muted mb-4 px-3 py-2 rounded-lg line-clamp-3">{deleteModal.comment}</p>}
              <p className="text-xs text-emergency mb-4">This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={processing === deleteModal.id}
                  className="flex-1 bg-emergency hover:bg-emergency/90 disabled:bg-emergency/40 text-white font-semibold py-2.5 rounded-lg text-sm btn-press transition-expo">
                  {processing === deleteModal.id ? 'Deleting...' : 'Delete Review'}
                </button>
                <button onClick={() => setDeleteModal(null)}
                  className="px-4 py-2.5 bg-muted hover:bg-muted-foreground/10 text-foreground rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
