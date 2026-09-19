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
    <Star key={i} size={14} className={i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
  ));

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const positive = reviews.filter(r => r.rating >= 4).length;
  const needsReply = reviews.filter(r => !r.reply).length;

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Reviews</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and respond to customer feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
          <div className="flex items-center justify-center gap-0.5 my-1">{renderStars(Math.round(avgRating))}</div>
          <p className="text-xs text-gray-500">Avg Rating</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">Total Reviews</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-green-600">{positive}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">Positive</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-orange-600">{needsReply}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">Needs Reply</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-gray-900 text-sm">{review.reviewer?.full_name || 'Customer'}</span>
                  <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                </div>
                <p className="text-xs text-gray-500">{review.productName} · {formatDate(review.created_at)}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${review.reply ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                {review.reply ? 'Replied' : 'Needs Reply'}
              </span>
            </div>

            {/* Review Comment */}
            <p className="text-sm text-gray-700 mb-3">{review.comment}</p>

            {/* Existing Reply */}
            {review.reply && (
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-l-3 border-blue-400 ml-2">
                <p className="text-xs font-semibold text-blue-600 mb-1">Your Reply</p>
                <p className="text-sm text-gray-700">{review.reply}</p>
              </div>
            )}

            {/* Reply Button / Input */}
            {!review.reply && (
              <>
                {replyingTo === review.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder-gray-400"
                      onKeyDown={(e) => e.key === 'Enter' && handleReply(review.id)} />
                    <button onClick={() => handleReply(review.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                      <Send size={16} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setReplyingTo(review.id); setReplyText(''); }}
                    className="mt-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">Reviews will appear here when customers rate your products.</p>
        </div>
      )}
    </div>
  );
}
