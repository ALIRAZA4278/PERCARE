'use client';

import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import FeatureDisabled from '@/components/FeatureDisabled';
import { useCart } from '@/context/CartContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { supabase } from '@/lib/supabase';

const TRUST_BADGES = [
  { icon: Truck, label: '2-3 Days' },
  { icon: Shield, label: 'Verified' },
  { icon: RotateCcw, label: 'Easy Return' },
];

export default function ProductDetails() {
  const { id } = useParams();
  const { marketplaceEnabled, loading: flagsLoading } = useFeatureFlags();
  const { addToCart, getCartCount } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const cartCount = getCartCount();

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const { data: prod } = await supabase
        .from('products')
        .select('*, store:stores(id, name, is_approved, owner_id)')
        .eq('id', id)
        .single();

      const { data: revs } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles(full_name)')
        .eq('target_type', 'product')
        .eq('target_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      setProduct(prod);
      setReviews(revs || []);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (!flagsLoading && !marketplaceEnabled) {
    return <FeatureDisabled title="Marketplace" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg font-bold text-foreground mb-2">Product not found</p>
        <Link href="/shop" className="text-sm text-primary font-semibold hover:underline">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : product.image_url
      ? [product.image_url]
      : [];

  return (
    <div className="min-h-screen pb-28 md:pb-8 overflow-x-hidden">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 py-3 flex items-center gap-2 max-w-6xl mx-auto">
          <Link
            href="/shop"
            className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10 shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground flex-1 truncate">Product Details</h1>
          <button
            onClick={() => setLiked(!liked)}
            aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
            className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10 shrink-0"
          >
            <Heart
              className={`h-4 w-4 ${liked ? 'text-emergency fill-emergency' : 'text-muted-foreground'}`}
            />
          </button>
          <Link
            href="/cart"
            className="relative h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10 shrink-0"
          >
            <ShoppingCart className="h-4 w-4 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto md:flex md:gap-8 md:px-8 md:py-6">
        <div className="md:w-1/2 shrink-0">
          <div className="aspect-[4/3] md:aspect-square bg-muted flex items-center justify-center md:rounded-2xl overflow-hidden">
            {images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 p-3 md:px-0 md:pt-3 overflow-x-auto no-scrollbar">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === i
                      ? 'border-primary'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 md:px-0 py-2 md:py-0 space-y-4 flex-1 min-w-0">
          <div>
            {product.brand && (
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {product.brand}
              </p>
            )}
            <h2 className="text-xl font-bold text-foreground mt-0.5 break-words">{product.name}</h2>

            <div className="flex items-center gap-2 mt-2">
              <Star className="h-4 w-4 text-amber fill-amber" />
              <span className="text-sm font-semibold tabular-nums">{product.rating || 0}</span>
              <span className="text-sm text-muted-foreground tabular-nums">
                ({product.total_reviews || 0} reviews)
              </span>
            </div>

            <p className="text-2xl font-extrabold text-foreground mt-3 tabular-nums">
              Rs. {product.price.toLocaleString()}
            </p>

            {product.store && (
              <Link
                href={`/store/${product.store.id}`}
                className="mt-3 flex items-center gap-2.5 p-3 rounded-xl bg-muted hover:bg-muted-foreground/10 transition-colors btn-press"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                  <Store className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {product.store.name}
                    </span>
                    {product.store.is_approved && (
                      <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">Verified Store</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="p-3 rounded-xl bg-muted text-center">
                <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
              </div>
            ))}
          </div>

          <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:relative z-30 bg-background/95 backdrop-blur-lg border-t border-border md:border-0 px-4 py-3 md:p-0 md:pt-2">
            <div className="flex items-center gap-2 max-w-6xl mx-auto">
              <div className="flex items-center bg-muted rounded-xl px-1 shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  className="h-10 w-9 flex items-center justify-center btn-press"
                >
                  <Minus className="h-3.5 w-3.5 text-foreground" />
                </button>
                <span className="text-sm font-bold text-foreground w-5 text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                  className="h-10 w-9 flex items-center justify-center btn-press"
                >
                  <Plus className="h-3.5 w-3.5 text-foreground" />
                </button>
              </div>

              <button
                onClick={() =>
                  addToCart(
                    {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      store: product.store?.name,
                      store_id: product.store?.id,
                    },
                    quantity
                  )
                }
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press transition-expo hover:opacity-90 flex items-center justify-center gap-2 min-w-0"
              >
                <ShoppingCart className="h-4 w-4 shrink-0" />
                <span className="truncate tabular-nums">
                  Add — Rs. {(product.price * quantity).toLocaleString()}
                </span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card shadow-card">
            <h3 className="text-sm font-bold text-foreground mb-3">Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-semibold text-xs">
                          {(review.reviewer?.full_name || 'U').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {review.reviewer?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className={`h-3 w-3 ${
                            j < review.rating ? 'text-amber fill-amber' : 'text-muted-foreground/40'
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
