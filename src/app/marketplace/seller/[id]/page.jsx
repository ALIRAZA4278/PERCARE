'use client';

import { ArrowLeft, ShoppingCart, Star, BadgeCheck, MapPin, Phone, Globe, Store, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function SellerProfilePage() {
  const { addToCart, getCartCount } = useCart();
  const cartCount = getCartCount();

  const seller = {
    name: 'PetNutra Official',
    type: 'Company Store',
    verified: true,
    rating: 4.8,
    reviews: 234,
    products: 48,
    description: "PetNutra is Pakistan's leading pet nutrition company, committed to providing scientifically formulated meals for dogs, cats, and birds since 2018. All products are manufactured in ISO-certified facilities with imported ingredients.",
    established: '2018',
    team: '50–100',
    hq: 'Lahore',
    location: 'Lahore, Pakistan',
    phone: '+92 300 1234567',
    website: 'petnutra.pk',
  };

  const products = [
    { id: 1, category: 'PETNUTRA', name: 'Premium Dog Food – Chicken', rating: 4.8, reviews: 45, price: 2500 },
    { id: 6, category: 'PETNUTRA', name: 'Kitten Milk Replacer', rating: 4.4, reviews: 23, price: 950 },
    { id: 11, category: 'PETNUTRA', name: 'Adult Cat Food – Salmon', rating: 4.7, reviews: 31, price: 2200 },
    { id: 12, category: 'PETNUTRA', name: 'Puppy Starter Pack', rating: 4.9, reviews: 17, price: 3400 },
  ];

  const storeReviews = [
    { name: 'Zainab Hussain', date: 'Mar 12, 2026', rating: 5, comment: 'Always reliable products and fast shipping. Highly recommend.' },
    { name: 'Usman Khalid', date: 'Feb 28, 2026', rating: 4, comment: 'Good selection, prices are fair. Packaging could be better.' },
    { name: 'Fatima Noor', date: 'Feb 15, 2026', rating: 5, comment: 'Genuine products every time. My go-to store for pet supplies.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Link href="/marketplace" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <ArrowLeft size={18} className="text-gray-700" />
              </Link>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{seller.name}</h1>
            </div>
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <ShoppingCart size={20} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center w-5 h-5">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Seller Info Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 mb-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store size={26} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{seller.name}</h2>
                {seller.verified && <BadgeCheck size={18} className="text-blue-600" />}
              </div>
              <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-100 mt-0.5">
                <Store size={11} />{seller.type}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-4">
            <Star size={15} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-900">{seller.rating}</span>
            <span className="text-sm text-gray-500">({seller.reviews} reviews)</span>
            <span className="text-gray-400 mx-1">·</span>
            <span className="text-sm text-gray-500">{seller.products} products</span>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-5">{seller.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Est.', value: seller.established },
              { label: 'Team', value: seller.team },
              { label: 'HQ', value: seller.hq },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <MapPin size={15} className="text-gray-400" /><span>{seller.location}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <Phone size={15} className="text-gray-400" /><span>{seller.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-blue-600">
              <Globe size={15} className="text-gray-400" /><span>{seller.website}</span>
            </div>
          </div>
        </div>

        {/* All Products */}
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-t border-gray-200 pt-5">All Products</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/marketplace/${product.id}`}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <ShoppingBag size={40} className="text-gray-300" />
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">{product.category}</p>
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1.5 leading-tight">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold text-gray-900">{product.rating}</span>
                    <span className="text-[10px] text-gray-500">({product.reviews})</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">Rs. {product.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Store Reviews */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Reviews ({storeReviews.length})</h3>
            <button className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors">Write a Review</button>
          </div>
          <div className="space-y-4">
            {storeReviews.map((review, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{review.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-1.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={13} className={j < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
