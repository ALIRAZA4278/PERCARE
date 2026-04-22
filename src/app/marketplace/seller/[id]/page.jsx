'use client';

import { ArrowLeft, ShoppingCart, Star, BadgeCheck, MapPin, Phone, Globe, Store, ShoppingBag, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

export default function SellerProfilePage() {
  const { id } = useParams();
  const { addToCart, getCartCount } = useCart();
  const cartCount = getCartCount();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchStore();
  }, [id]);

  const fetchStore = async () => {
    const [storeRes, productsRes, reviewsRes] = await Promise.all([
      supabase.from('stores').select('*').eq('id', id).single(),
      supabase.from('products').select('*').eq('store_id', id).eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('reviews').select('*, reviewer:profiles(full_name)').eq('target_type', 'store').eq('target_id', id).order('created_at', { ascending: false }).limit(10),
    ]);
    setStore(storeRes.data);
    setProducts(productsRes.data || []);
    setReviews(reviewsRes.data || []);
    setLoading(false);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-gray-700 mb-4">Store not found</p>
        <Link href="/marketplace" className="text-blue-600 hover:underline">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Link href="/marketplace" className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                <ArrowLeft size={18} className="text-gray-700" />
              </Link>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{store.name}</h1>
            </div>
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
              <ShoppingCart size={20} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Store size={26} className="text-blue-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{store.name}</h2>
                {store.is_approved && <BadgeCheck size={18} className="text-blue-600" />}
              </div>
              {store.store_type && (
                <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-100 mt-0.5">
                  <Store size={11} />{store.store_type}
                </div>
              )}
            </div>
          </div>

          {(store.rating > 0 || products.length > 0) && (
            <div className="flex items-center gap-1 mb-4">
              {store.rating > 0 && (
                <>
                  <Star size={15} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-gray-900">{Number(store.rating).toFixed(1)}</span>
                  {store.total_reviews > 0 && <span className="text-sm text-gray-500">({store.total_reviews} reviews)</span>}
                  <span className="text-gray-400 mx-1">·</span>
                </>
              )}
              <span className="text-sm text-gray-500">{products.length} products</span>
            </div>
          )}

          {store.description && <p className="text-sm text-gray-600 leading-relaxed mb-5">{store.description}</p>}

          <div className="space-y-2">
            {(store.city || store.country) && (
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <MapPin size={15} className="text-gray-400" /><span>{[store.city, store.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Phone size={15} className="text-gray-400" /><span>{store.phone}</span>
              </div>
            )}
            {store.website && (
              <div className="flex items-center gap-2.5 text-sm text-blue-600">
                <Globe size={15} className="text-gray-400" /><span>{store.website}</span>
              </div>
            )}
          </div>
        </div>

        {products.length > 0 && (
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-t border-gray-200 pt-5">All Products</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {products.map((product) => (
                <Link key={product.id} href={`/marketplace/${product.id}`}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={40} className="text-gray-300" />
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    {product.brand && <p className="text-[10px] sm:text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">{product.brand}</p>}
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1.5 leading-tight">{product.name}</h3>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-semibold text-gray-900">{Number(product.rating).toFixed(1)}</span>
                        {product.total_reviews > 0 && <span className="text-[10px] text-gray-500">({product.total_reviews})</span>}
                      </div>
                    )}
                    <p className="text-sm font-bold text-gray-900">Rs. {Number(product.sale_price || product.price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Reviews ({reviews.length})</h3>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{review.reviewer?.full_name || 'User'}</span>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={13} className={j < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
