'use client';

import { X, ShoppingBag, CreditCard, Building2 } from 'lucide-react';
import { useState } from 'react';

export default function CheckoutModal({ isOpen, onClose, total }) {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Payment</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-700" /></button>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <div className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6 flex items-center justify-between border border-blue-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-blue-600" size={18} />
                </div>
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Order Total</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">Rs. {total.toLocaleString()}</span>
            </div>
            <div className="mb-5 sm:mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Delivery Address *</label>
              <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Enter your delivery address" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 resize-none text-sm sm:text-base" rows={3} />
            </div>
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[{ key: 'card', icon: CreditCard, label: 'Card', sub: 'Debit or Credit' }, { key: 'bank', icon: Building2, label: 'Bank Transfer', sub: 'Direct transfer' }].map(({ key, icon: Icon, label, sub }) => (
                  <button key={key} onClick={() => setPaymentMethod(key)}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === key ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${paymentMethod === key ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon className={paymentMethod === key ? 'text-blue-600' : 'text-gray-600'} size={18} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">{label}</h3>
                    <p className="text-xs text-gray-600">{sub}</p>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => { console.log('Checkout:', { deliveryAddress, paymentMethod, total }); onClose(); }} disabled={!deliveryAddress.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 sm:px-6 sm:py-4 rounded-lg transition-colors shadow-sm text-sm sm:text-base"
            >Confirm Payment</button>
          </div>
        </div>
      </div>
    </>
  );
}
