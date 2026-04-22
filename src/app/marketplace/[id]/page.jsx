'use client';

import { ArrowLeft, Heart, ShoppingCart, Star, BadgeCheck, Store, Truck, Shield, RotateCcw, Minus, Plus, ShoppingBag, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, getCartCount } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const cartCount = getCartCount();

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

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

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-gray-700 mb-4">Product not found</p>
        <Link href="/marketplace" className="text-blue-600 hover:underline">Back to Marketplace</Link>
      </div>
    );
  }

  const cartProduct = { id: product.id, name: product.name, price: product.sale_price || product.price, seller: product.store?.name || 'Store', category: product.brand || 'Product' };
  const displayPrice = product.sale_price || product.price;
  const images = product.images?.length ? product.images : product.image_url ? [product.image_url] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Link href="/marketplace" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <ArrowLeft size={18} className="text-gray-700" />
              </Link>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Product Details</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <div className="relative">
                <Link href="/cart">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ShoppingCart size={20} className="text-gray-700" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
          <div>
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-3 sm:mb-4 border border-gray-200">
              <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                {images[selectedImage] ? (
                  <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="text-6xl sm:text-8xl">📦</div>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {images.slice(0, 4).map((img, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg sm:rounded-xl border-2 transition-all overflow-hidden ${selectedImage === index ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.brand && <p className="text-[10px] sm:text-xs font-semibold text-blue-600 mb-1.5 sm:mb-2 uppercase tracking-wide">{product.brand}</p>}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-base sm:text-lg font-semibold text-gray-900">{product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
              </div>
              {product.total_reviews > 0 && <span className="text-sm sm:text-base text-gray-600">({product.total_reviews} reviews)</span>}
            </div>
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">Rs. {displayPrice.toLocaleString()}</div>
              {product.sale_price && product.price > product.sale_price && (
                <div className="text-lg text-gray-400 line-through">Rs. {product.price.toLocaleString()}</div>
              )}
            </div>

            {product.store && (
              <Link href={`/marketplace/seller/${product.store.id}`} className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Store className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.store.name}</span>
                      {product.store.is_approved && <BadgeCheck size={14} className="text-blue-600 flex-shrink-0" />}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">Verified Store</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
              </Link>
            )}

            {product.description && (
              <p className="text-gray-700 leading-relaxed mb-5 sm:mb-6 text-xs sm:text-sm">{product.description}</p>
            )}

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
              {[
                { icon: Truck, label: '2-3 Days' },
                { icon: Shield, label: 'Verified' },
                { icon: RotateCcw, label: 'Easy Return' },
              ].map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                    <div className="flex justify-center mb-1.5 sm:mb-2">
                      <Icon size={18} className="text-gray-600" />
                    </div>
                    <p className="text-[10px] sm:text-xs font-medium text-gray-900">{badge.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-3 bg-gray-100 rounded-lg px-4 py-3 border border-gray-200">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-700 hover:text-gray-900 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="font-semibold text-gray-900 w-8 text-center text-sm sm:text-base">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-gray-700 hover:text-gray-900 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={() => { for (let i = 0; i < quantity; i++) addToCart(cartProduct); setQuantity(1); }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm sm:text-base"
              >
                <ShoppingCart size={18} />
                Add — Rs. {(displayPrice * quantity).toLocaleString()}
              </button>
            </div>

            <div className="border-t border-gray-200 pt-5 sm:pt-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Reviews ({reviews.length})</h2>
              </div>
              {reviews.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                            {(review.reviewer?.full_name || 'U').charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm">{review.reviewer?.full_name || 'User'}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      {review.comment && <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
