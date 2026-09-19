'use client';

import { Building2, Check, CreditCard, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

const labelClass =
  'text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block';

const PAYMENT_METHODS = [
  { key: 'card', icon: CreditCard, label: 'Card', sub: 'Debit or Credit' },
  { key: 'bank', icon: Building2, label: 'Bank Transfer', sub: 'Direct transfer' },
];

export default function CheckoutModal({ isOpen, onClose, total, onSuccess }) {
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
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          total_amount: total,
          status: 'pending',
          shipping_address: deliveryAddress,
          phone: phone || null,
          payment_method: paymentMethod,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      if (order && cartItems.length > 0) {
        const orderItems = cartItems.map((item) => ({
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

  const handleDone = () => {
    handleClose();
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-elevated">
        {placed ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-vitality/10 flex items-center justify-center mx-auto mb-3">
              <Check className="h-5 w-5 text-vitality" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Order Placed!</h2>
            <p className="text-sm text-muted-foreground mb-1">
              Your order has been placed successfully.
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              Total:{' '}
              <strong className="text-foreground tabular-nums">
                Rs. {total.toLocaleString()}
              </strong>
            </p>
            <button
              onClick={handleDone}
              className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold btn-press hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-card z-10 p-4 border-b border-border flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
              <h2 className="text-base font-bold text-foreground">Payment</h2>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center btn-press"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Order Total</span>
                </div>
                <span className="text-xl font-extrabold text-foreground tabular-nums">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              {!user && (
                <div className="p-3 rounded-xl bg-amber/10 border border-amber/20 text-xs text-amber-foreground">
                  Please log in to place an order.
                </div>
              )}

              <div>
                <label htmlFor="checkout-address" className={labelClass}>
                  Delivery Address *
                </label>
                <textarea
                  id="checkout-address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full delivery address"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label htmlFor="checkout-phone" className={labelClass}>
                  Phone Number
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full h-11 px-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <p className={labelClass}>Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(({ key, icon: Icon, label, sub }) => {
                    const active = paymentMethod === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setPaymentMethod(key)}
                        className={`p-4 rounded-2xl border transition-expo text-left btn-press ${
                          active
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:bg-muted'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                            active ? 'bg-primary/10' : 'bg-muted'
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-0.5">{label}</h3>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={!deliveryAddress.trim() || placing || !user}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press transition-expo hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? 'Placing Order...' : 'Confirm Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
