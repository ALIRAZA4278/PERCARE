'use client';

import { X, ShoppingBag, CreditCard, Building2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

export default function CheckoutModal({ isOpen, onClose, total }) {
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!deliveryAddress.trim() || !user) return;
    setPlacing(true);
    try {
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        buyer_id: user.id,
        total_amount: total,
        status: 'pending',
        shipping_address: deliveryAddress,
        phone: phone || null,
        payment_method: paymentMethod,
        payment_status: 'pending',
      }).select().single();

      if (orderError) throw orderError;

      if (order && cartItems.length > 0) {
        const orderItems = cartItems.map(item => ({
          order_id: order.id,
          product_id: item.id,
          store_id: item.store_id || null,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        }));
        await supabase.from('order_items').insert(orderItems);
      }

      clearCart();
      setPlaced(true);
    } catch {}
    setPlacing(false);
  };

  const handleClose = () => {
    onClose();
    setDeliveryAddress('');
    setPhone('');
    setPaymentMethod('card');
    setPlaced(false);
  };

  if (placed) return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 text-sm mb-2">Your order has been placed successfully.</p>
          <p className="text-gray-500 text-sm mb-6">Total: <strong>Rs. {total.toLocaleString()}</strong></p>
          <button onClick={handleClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            Done
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Payment</h2>
            <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-700" /></button>
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

            {!user && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                Please log in to place an order.
              </div>
            )}

            <div className="mb-5 sm:mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Delivery Address *</label>
              <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Enter your full delivery address" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 resize-none text-sm sm:text-base" rows={3} />
            </div>

            <div className="mb-5 sm:mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm sm:text-base" />
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

            <button onClick={handleConfirm} disabled={!deliveryAddress.trim() || placing || !user}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 sm:px-6 sm:py-4 rounded-lg transition-colors shadow-sm text-sm sm:text-base"
            >
              {placing ? 'Placing Order...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
