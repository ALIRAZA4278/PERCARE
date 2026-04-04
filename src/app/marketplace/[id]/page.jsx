'use client';

import { ArrowLeft, Heart, ShoppingCart, Star, BadgeCheck, Store, Truck, Shield, RotateCcw, Minus, Plus, ShoppingBag, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ProductDetails() {
  const { addToCart, getCartCount } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const cartCount = getCartCount();

  const product = {
    id: 1,
    category: 'PETNUTRA',
    name: 'Premium Dog Food - Chicken',
    rating: 4.8,
    reviews: 45,
    price: 2500,
    seller: {
      name: 'PetNutra Official',
      verified: true,
      type: 'Company Store',
    },
    description: 'High-quality chicken-based dog food formulated with essential nutrients, vitamins and minerals for adult dogs. Made with real chicken as the first ingredient. No artificial flavors or preservatives.',
    features: [
      { text: 'Real chicken first ingredient' },
      { text: 'Rich in Omega-3 & 6' },
      { text: 'No artificial preservatives' },
      { text: 'Supports healthy coat' },
      { text: 'All breed sizes' },
    ],
    badges: [
      { icon: Truck, label: '2-3 Days' },
      { icon: Shield, label: 'Verified' },
      { icon: RotateCcw, label: 'Easy Return' },
    ],
  };

  const reviews = [
    {
      id: 1,
      author: 'Hamza Tariq',
      date: 'Mar 5, 2026',
      rating: 5,
      comment: 'My dog loves this food! Great quality and packaging.',
    },
    {
      id: 2,
      author: 'Ayesha Malik',
      date: 'Feb 20, 2026',
      rating: 4,
      comment: "Good food but a bit pricey. My dog's coat has improved though.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Link href="/marketplace" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <ArrowLeft size={18} className="text-gray-700 sm:w-5 sm:h-5" />
              </Link>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Product Details</h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Heart size={20} className="text-gray-700 sm:w-[22px] sm:h-[22px]" />
              </button>
              <div className="relative">
                <Link href="/cart">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ShoppingCart size={20} className="text-gray-700 sm:w-[22px] sm:h-[22px]" />
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

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
          {/* Left - Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-3 sm:mb-4 border border-gray-200">
              <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                <div className="text-6xl sm:text-8xl">🍗</div>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg sm:rounded-xl border-2 transition-all overflow-hidden ${
                    selectedImage === index ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <div className="text-2xl sm:text-3xl">🍗</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right - Product Info */}
          <div>
            {/* Category */}
            <p className="text-[10px] sm:text-xs font-semibold text-blue-600 mb-1.5 sm:mb-2 uppercase tracking-wide">
              {product.category}
            </p>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500 sm:w-[18px] sm:h-[18px]" />
                <span className="text-base sm:text-lg font-semibold text-gray-900">{product.rating}</span>
              </div>
              <span className="text-sm sm:text-base text-gray-600">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 sm:mb-6">
              Rs. {product.price.toLocaleString()}
            </div>

            {/* Seller Info */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Store className="text-blue-600" size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.seller.name}</span>
                    {product.seller.verified && (
                      <BadgeCheck size={14} className="text-blue-600 flex-shrink-0 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">{product.seller.type}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 sm:w-5 sm:h-5" />
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-5 sm:mb-6 text-xs sm:text-sm">
              {product.description}
            </p>

            {/* Features */}
            <div className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-6">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
                  <span className="text-green-600 font-bold text-sm sm:text-base flex-shrink-0">✓</span>
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
              {product.badges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                    <div className="flex justify-center mb-1.5 sm:mb-2">
                      <Icon size={18} className="text-gray-600 sm:w-[22px] sm:h-[22px]" />
                    </div>
                    <p className="text-[10px] sm:text-xs font-medium text-gray-900">{badge.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-3 bg-gray-100 rounded-lg px-4 py-3 border border-gray-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Minus size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <span className="font-semibold text-gray-900 w-8 text-center text-sm sm:text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>

              <button 
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addToCart(product);
                  }
                  setQuantity(1);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm sm:text-base"
              >
                <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                Add — Rs. {(product.price * quantity).toLocaleString()}
              </button>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-200 pt-5 sm:pt-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Reviews ({reviews.length})</h2>
                <button className="text-blue-600 font-medium text-xs sm:text-sm hover:text-blue-700 transition-colors">
                  Write a Review
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                            {review.author.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm">{review.author}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{review.date}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} sm:w-3.5 sm:h-3.5`}
                        />
                      ))}
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
