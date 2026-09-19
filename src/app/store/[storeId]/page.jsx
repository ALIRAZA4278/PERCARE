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
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-foreground mb-4">Store not found</p>
        <Link href="/shop" className="text-primary hover:underline">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 max-w-5xl mx-auto py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Link href="/shop" className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10 shrink-0">
                <ArrowLeft size={18} className="text-foreground" />
              </Link>
              <h1 className="text-base sm:text-xl font-bold text-foreground truncate">{store.name}</h1>
            </div>
            <Link href="/cart" className="relative p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
              <ShoppingCart size={20} className="text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-5xl mx-auto py-6 sm:py-8">
        <div className="p-5 rounded-2xl bg-card shadow-card mb-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Store size={26} className="text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{store.name}</h2>
                {store.is_approved && <BadgeCheck size={18} className="text-primary" />}
              </div>
              {store.store_type && (
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full border border-primary/20 mt-0.5">
                  <Store size={11} />{store.store_type}
                </div>
              )}
            </div>
          </div>

          {(store.rating > 0 || products.length > 0) && (
            <div className="flex items-center gap-1 mb-4">
              {store.rating > 0 && (
                <>
                  <Star size={15} className="text-amber fill-amber" />
                  <span className="text-sm font-semibold text-foreground">{Number(store.rating).toFixed(1)}</span>
                  {store.total_reviews > 0 && <span className="text-sm text-muted-foreground">({store.total_reviews} reviews)</span>}
                  <span className="text-muted-foreground mx-1">·</span>
                </>
              )}
              <span className="text-sm text-muted-foreground">{products.length} products</span>
            </div>
          )}

          {store.description && <p className="text-sm text-muted-foreground leading-relaxed mb-5">{store.description}</p>}

          <div className="space-y-2">
            {(store.city || store.country) && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MapPin size={15} className="text-muted-foreground" /><span>{[store.city, store.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone size={15} className="text-muted-foreground" /><span>{store.phone}</span>
              </div>
            )}
            {store.website && (
              <div className="flex items-center gap-2.5 text-sm text-primary">
                <Globe size={15} className="text-muted-foreground" /><span>{store.website}</span>
              </div>
            )}
          </div>
        </div>

        {products.length > 0 && (
          <div className="mb-5">
            <h3 className="text-lg font-bold text-foreground mb-4 border-t border-border pt-5">All Products</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}
                  className="rounded-2xl bg-card shadow-card overflow-hidden hover:shadow-card-hover transition-all group"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center group-hover:bg-muted-foreground/10 transition-colors overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={40} className="text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    {product.brand && <p className="text-[10px] sm:text-xs font-semibold text-primary mb-1 uppercase tracking-wide">{product.brand}</p>}
                    <h3 className="font-semibold text-foreground text-xs sm:text-sm mb-1.5 leading-tight">{product.name}</h3>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={12} className="text-amber fill-amber" />
                        <span className="text-xs font-semibold text-foreground">{Number(product.rating).toFixed(1)}</span>
                        {product.total_reviews > 0 && <span className="text-[10px] text-muted-foreground">({product.total_reviews})</span>}
                      </div>
                    )}
                    <p className="text-sm font-bold text-foreground">Rs. {Number(product.sale_price || product.price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="p-5 rounded-2xl bg-card shadow-card">
          <h3 className="text-sm font-bold text-foreground mb-3">Reviews ({reviews.length})</h3>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <User size={16} className="text-primary" />
                      </div>
                      <span className="font-semibold text-foreground text-sm">{review.reviewer?.full_name || 'User'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={13} className={j < review.rating ? 'text-amber fill-amber' : 'text-muted-foreground/40'} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
