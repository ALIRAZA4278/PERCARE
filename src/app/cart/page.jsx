'use client';

import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import CheckoutModal from '@/components/CheckoutModal';
import FeatureDisabled from '@/components/FeatureDisabled';
import { useCart } from '@/context/CartContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

export default function CartPage() {
  const { marketplaceEnabled, loading: flagsLoading } = useFeatureFlags();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const total = getCartTotal();

  if (!flagsLoading && !marketplaceEnabled) {
    return <FeatureDisabled title="Marketplace" />;
  }

  if (ordered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-vitality/10 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-vitality" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Order Confirmed!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your order has been placed and will be delivered in 2-3 days.
          </p>
          <Link
            href="/shop"
            className="inline-flex h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm items-center btn-press transition-expo hover:opacity-90"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 py-4 flex items-center gap-3">
          <Link
            href="/shop"
            className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center btn-press transition-expo hover:bg-muted-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Cart</h1>
          <span className="text-xs text-muted-foreground">({cartItems.length} items)</span>
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 max-w-lg space-y-3">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
            <Link
              href="/shop"
              className="inline-flex h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold items-center mt-4 btn-press"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 rounded-2xl bg-card shadow-card"
              >
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground/40" />
                </div>

                <div className="flex-1 min-w-0">
                  {item.store && (
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {item.store}
                    </p>
                  )}
                  <h3 className="text-sm font-semibold text-foreground truncate">{item.name}</h3>
                  <p className="text-sm font-bold text-foreground tabular-nums mt-1">
                    Rs. {item.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="h-7 w-7 rounded-lg bg-emergency/10 flex items-center justify-center btn-press"
                  >
                    <Trash2 className="h-3 w-3 text-emergency" />
                  </button>

                  <div className="flex items-center gap-1 bg-muted rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="h-7 w-7 flex items-center justify-center btn-press"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold tabular-nums w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="h-7 w-7 flex items-center justify-center btn-press"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-2xl bg-card shadow-card mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground tabular-nums">
                  Rs. {total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-semibold text-vitality">Free</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-border">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-extrabold text-foreground tabular-nums">
                  Rs. {total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press transition-expo hover:opacity-90 mt-2"
            >
              Checkout — Rs. {total.toLocaleString()}
            </button>
          </>
        )}
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={total}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          setOrdered(true);
        }}
      />
    </div>
  );
}
