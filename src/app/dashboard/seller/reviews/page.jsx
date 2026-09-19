'use client';

import { Star, MessageSquare, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SellerReviewsPage() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: s } = await supabase.from('stores').select('*').eq('owner_id', user.id).single();
    setStore(s);
    if (!s) { setLoading(false); return; }

    // Get product IDs for this store
    const { data: products } = await supabase.from('products').select('id, name').eq('store_id', s.id);
    const productIds = (products || []).map(p => p.id);
    const productMap = Object.fromEntries((products || []).map(p => [p.id, p.name]));

    // Fetch reviews for store + products
    let allReviews = [];

    // Store reviews
    const { data: storeReviews } = await supabase.from('reviews')
      .select('*, reviewer:profiles(full_name)')
      .eq('target_type', 'store').eq('target_id', s.id)
      .order('created_at', { ascending: false });
    (storeReviews || []).forEach(r => allReviews.push({ ...r, productName: s.name }));

    // Product reviews
    if (productIds.length > 0) {
      const { data: prodReviews } = await supabase.from('reviews')
        .select('*, reviewer:profiles(full_name)')
        .eq('target_type', 'product').in('target_id', productIds)
        .order('created_at', { ascending: false });
      (prodReviews || []).forEach(r => allReviews.push({ ...r, productName: productMap[r.target_id] || 'Product' }));
    }

    // Sort by date
    allReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setReviews(allReviews);
    setLoading(false);
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    await supabase.from('reviews').update({ reply: replyText.trim(), reply_at: new Date().toISOString() }).eq('id', reviewId);
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, reply: replyText.trim(), reply_at: new Date().toISOString() } : r));
    setReplyingTo(null);
    setReplyText('');
  };

  const renderStars = (rating) => [...Array(5)].map((_, i) => (
    <Star key={i} size={14} className={i < rating ? 'text-amber fill-amber' : 'text-muted-foreground/40'} />
  ));

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const positive = reviews.filter(r => r.rating >= 4).length;
  const needsReply = reviews.filter(r => !r.reply).length;

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Customer Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and respond to customer feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="rounded-xl bg-card shadow-card p-4 sm:p-5 text-center">
          <p className="text-2xl font-bold text-foreground">{avgRating}</p>
          <div className="flex items-center justify-center gap-0.5 my-1">{renderStars(Math.round(avgRating))}</div>
          <p className="text-xs text-muted-foreground">Avg Rating</p>
        </div>
        <div className="rounded-xl bg-card shadow-card p-4 sm:p-5 text-center">
          <p className="text-2xl font-bold text-foreground">{reviews.length}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">Total Reviews</p>
        </div>
        <div className="rounded-xl bg-card shadow-card p-4 sm:p-5 text-center">
          <p className="text-2xl font-bold text-vitality">{positive}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">Positive</p>
        </div>
        <div className="rounded-xl bg-card shadow-card p-4 sm:p-5 text-center">
          <p className="text-2xl font-bold text-amber">{needsReply}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">Needs Reply</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl sm:rounded-2xl bg-card shadow-card p-5 sm:p-6">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-foreground text-sm">{review.reviewer?.full_name || 'Customer'}</span>
                  <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                </div>
                <p className="text-xs text-muted-foreground">{review.productName} · {formatDate(review.created_at)}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${review.reply ? 'bg-vitality/10 text-vitality' : 'bg-amber/10 text-amber'}`}>
                {review.reply ? 'Replied' : 'Needs Reply'}
              </span>
            </div>

            {/* Review Comment */}
            <p className="text-sm text-foreground mb-3">{review.comment}</p>

            {/* Existing Reply */}
            {review.reply && (
              <div className="bg-muted rounded-xl p-3 sm:p-4 border-l-3 border-primary/40 ml-2">
                <p className="text-xs font-semibold text-primary mb-1">Your Reply</p>
                <p className="text-sm text-foreground">{review.reply}</p>
              </div>
            )}

            {/* Reply Button / Input */}
            {!review.reply && (
              <>
                {replyingTo === review.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      className="flex-1 px-4 py-2 rounded-lg border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground"
                      onKeyDown={(e) => e.key === 'Enter' && handleReply(review.id)} />
                    <button onClick={() => handleReply(review.id)}
                      className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg btn-press transition-expo">
                      <Send size={16} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setReplyingTo(review.id); setReplyText(''); }}
                    className="mt-2 bg-card border border-border hover:bg-muted text-foreground text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                    <MessageSquare size={14} /> Reply
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-bold text-foreground mb-2">No reviews yet</h3>
          <p className="text-muted-foreground">Reviews will appear here when customers rate your products.</p>
        </div>
      )}
    </div>
  );
}
