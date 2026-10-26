'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cartContext';
import { formatRupiah, formatUSD } from '@/lib/utils';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] text-[#14191F] shadow-2xl flex flex-col justify-between border-l border-[#E5DFD4]">
          
          {/* Header */}
          <div className="p-6 border-b border-[#ECE6DC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#5C7489]" />
              <h2 className="text-lg font-bold tracking-tight">Your Studio Bag</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EDF3F7] text-[#5C7489]">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-[#ECE6DC] text-[#7A8B99] hover:text-[#14191F] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F0ECE1] text-[#7A8B99] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#14191F]">Your bag is currently empty</h3>
                  <p className="text-xs text-[#7A8B99] mt-1 max-w-xs mx-auto">
                    Explore our curated collection of 3D printed objects and sculptural pieces.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-semibold hover:bg-[#5C7489] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-[#ECE6DC] shadow-sm flex gap-4 items-center"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F2EDE4] shrink-0 border border-[#E5DFD4]">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-sm font-bold text-[#14191F] truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#8E9FAA] hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#5C7489] font-medium">
                      Finish: {item.selectedColor || 'Standard'}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-bold text-[#14191F]">
                        {formatRupiah(item.product.price * item.quantity)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E2DDD4] rounded-full bg-[#FAF8F5] px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-1.5 text-xs text-[#7A8B99] hover:text-[#14191F] font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-1.5 text-xs text-[#7A8B99] hover:text-[#14191F] font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#ECE6DC] bg-[#FAF8F5] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#667584]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#14191F]">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#667584]">
                  <span>Estimated Courier</span>
                  <span className="text-[#5C7489]">Calculated at Checkout</span>
                </div>
                <div className="pt-2 border-t border-[#ECE6DC] flex justify-between text-base font-bold text-[#14191F]">
                  <span>Total</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-4 rounded-full bg-[#14191F] text-white text-sm font-semibold hover:bg-[#5C7489] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#7A8B99]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5C7489]" />
                <span>Hand-inspected before dispatch. 100% Transit Guarantee.</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
