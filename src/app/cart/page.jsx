'use client';

import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import CheckoutModal from '@/components/CheckoutModal';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const subtotal = getCartTotal();
  const total = subtotal;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/marketplace" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft size={18} className="text-gray-700" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <span className="text-xs sm:text-sm text-gray-600">({cartItems.length} items)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-16 text-center border border-gray-200">
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🛒</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Add some products to get started!</p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg transition-colors text-sm sm:text-base">
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex gap-3 sm:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl sm:text-4xl">{item.category === 'PETNUTRA' ? '🍗' : item.category === 'FURCARE' ? '🪮' : item.category === 'PLAYPET' ? '🎾' : '📦'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">{item.category}</p>
                          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{item.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">by {item.seller}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3 bg-gray-100 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-700 hover:text-gray-900 transition-colors"><Minus size={14} /></button>
                          <span className="font-semibold text-gray-900 w-7 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-700 hover:text-gray-900 transition-colors"><Plus size={14} /></button>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Rs. {item.price.toLocaleString()} × {item.quantity}</p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <Tag className="text-gray-400 hidden sm:block" size={20} />
                  <input type="text" placeholder="Enter promo code" className="flex-1 px-3 py-2 sm:px-0 sm:py-0 border sm:border-0 rounded-lg sm:rounded-none outline-none text-gray-900 text-sm sm:text-base" />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 sm:px-6 sm:py-2 rounded-lg transition-colors text-sm sm:text-base">Apply</button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 lg:sticky lg:top-24">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center justify-between text-gray-700 text-sm sm:text-base">
                    <span>Subtotal</span><span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700 text-sm sm:text-base">
                    <span>Delivery Fee</span><span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 sm:pt-3 mt-2 sm:mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg font-bold text-gray-900">Total</span>
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 sm:px-6 sm:py-4 rounded-lg transition-colors mb-3 sm:mb-4 shadow-sm text-sm sm:text-base">
                  Proceed to Checkout
                </button>
                <Link href="/marketplace" className="block text-center text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm sm:text-base">Continue Shopping</Link>
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 space-y-2 sm:space-y-3">
                  {['Free delivery on all orders', '100% buyer protection', 'Easy returns within 7 days'].map((text) => (
                    <div key={text} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} total={total} />
    </div>
  );
}
