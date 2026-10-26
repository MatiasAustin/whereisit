'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cartContext';
import { formatRupiah } from '@/lib/utils';
import { Order } from '@/types';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, ArrowLeft, QrCode } from 'lucide-react';

const SHIPPING_CARRIERS = [
  { id: 'jne-reg', name: 'JNE Regular (2-3 Days)', fee: 25000 },
  { id: 'jne-yes', name: 'JNE YES Express (Next Day)', fee: 40000 },
  { id: 'sicepat-cargo', name: 'SiCepat Cargo (Secure Crating)', fee: 65000 },
];

const PAYMENT_METHODS = [
  { id: 'qris', name: 'QRIS Instant (GoPay / ShopeePay / OVO / Dana)', icon: 'QRIS' },
  { id: 'bca_va', name: 'BCA Virtual Account', icon: 'BCA' },
  { id: 'mandiri_va', name: 'Mandiri Virtual Account', icon: 'MANDIRI' },
  { id: 'credit_card', name: 'Credit / Debit Card (Visa, Mastercard)', icon: 'CARD' },
];

export default function CheckoutModal() {
  const { cart, subtotal, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();

  const [customer, setCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Jakarta Selatan',
    postalCode: '',
    notes: '',
  });

  const [selectedCarrier, setSelectedCarrier] = useState(SHIPPING_CARRIERS[0]);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const total = subtotal + selectedCarrier.fee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        customer,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          image: item.product.images[0],
        })),
        subtotal,
        shippingFee: selectedCarrier.fee,
        total,
        shippingCarrier: selectedCarrier.name,
        paymentMethod: selectedPayment.name,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      setPlacedOrder(data.data);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Something went wrong processing order');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setPlacedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#FAF8F5] text-[#14191F] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E2D7] my-8 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#ECE6DC] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {placedOrder ? 'Order Confirmation' : 'Checkout & Delivery'}
            </h2>
            <p className="text-xs text-[#7A8B99]">
              {placedOrder ? 'Thank you for supporting WhereIsIt Studio' : 'Direct studio fulfillment & secure dispatch'}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-[#ECE6DC] text-[#7A8B99] hover:text-[#14191F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar">
          {placedOrder ? (
            /* Order Success View */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5C7489]">
                  Order Placed Successfully
                </span>
                <h3 className="text-2xl font-black text-[#14191F] mt-1">
                  Invoice #{placedOrder.orderNumber}
                </h3>
                <p className="text-xs text-[#667584] mt-1 max-w-md mx-auto">
                  A studio invoice and tracking link will be sent to <strong>{placedOrder.customer.email}</strong>.
                </p>
              </div>

              {/* Order breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] text-left max-w-lg mx-auto space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-[#ECE6DC]">
                  <span className="text-[#7A8B99]">Recipient:</span>
                  <span className="font-semibold">{placedOrder.customer.fullName} ({placedOrder.customer.phone})</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#ECE6DC]">
                  <span className="text-[#7A8B99]">Destination:</span>
                  <span className="font-semibold text-right">{placedOrder.customer.address}, {placedOrder.customer.city}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#ECE6DC]">
                  <span className="text-[#7A8B99]">Courier:</span>
                  <span className="font-semibold">{placedOrder.shippingCarrier}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#ECE6DC]">
                  <span className="text-[#7A8B99]">Payment:</span>
                  <span className="font-semibold">{placedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold text-[#14191F]">
                  <span>Total Paid:</span>
                  <span>{formatRupiah(placedOrder.total)}</span>
                </div>
              </div>

              <div className="bg-[#EDF3F7] p-4 rounded-2xl border border-[#D5E1E9] text-xs text-[#445564] max-w-lg mx-auto">
                <strong>Studio Note:</strong> Our craftsmen will inspect each 3D contour, polish the satin coating, and pack with shock-proof foam inserts.
              </div>

              <button
                onClick={handleClose}
                className="px-8 py-3 rounded-full bg-[#14191F] text-white text-xs font-semibold hover:bg-[#5C7489] transition-colors"
              >
                Back to WhereIsIt Store
              </button>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              {/* Items Summary Accordion */}
              <div className="bg-white p-4 rounded-2xl border border-[#ECE6DC] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C7489]">
                  Order Items ({cart.length})
                </h4>
                <div className="divide-y divide-[#F0EBE3] max-h-40 overflow-y-auto no-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F2EDE4] shrink-0">
                          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#14191F]">{item.product.name}</p>
                          <p className="text-[10px] text-[#7A8B99]">
                            {item.quantity}x • Finish: {item.selectedColor || 'Standard'}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#14191F]">
                        {formatRupiah(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#14191F]">
                  1. Shipping Information
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      placeholder="e.g. Bambang Kusuma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="e.g. bambang@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="+62 818-xxxx-xxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">City / District *</label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      placeholder="e.g. Jakarta Selatan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={customer.postalCode}
                      onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                      placeholder="e.g. 12190"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#556473] mb-1">Full Street Address *</label>
                  <textarea
                    required
                    rows={2}
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="House/Unit number, street name, landmarks..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              {/* Delivery Carrier Choice */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#14191F]">
                  2. Choose Shipping Carrier
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SHIPPING_CARRIERS.map((carrier) => (
                    <button
                      type="button"
                      key={carrier.id}
                      onClick={() => setSelectedCarrier(carrier)}
                      className={`p-3 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between ${
                        selectedCarrier.id === carrier.id
                          ? 'border-[#5C7489] bg-[#EDF3F7] text-[#14191F] font-bold shadow-sm'
                          : 'border-[#E2DDD4] bg-white text-[#556473] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{carrier.name}</span>
                      <span className="font-bold text-[#5C7489] mt-1">{formatRupiah(carrier.fee)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Choice */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#14191F]">
                  3. Payment Method
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm)}
                      className={`p-3 rounded-2xl text-left border transition-all text-xs flex items-center justify-between ${
                        selectedPayment.id === pm.id
                          ? 'border-[#5C7489] bg-[#EDF3F7] text-[#14191F] font-bold shadow-sm'
                          : 'border-[#E2DDD4] bg-white text-[#556473] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{pm.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#5C7489] font-mono border">
                        {pm.icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Final Summary & Place Order */}
              <div className="pt-4 border-t border-[#ECE6DC] space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#667584]">
                    <span>Items Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#667584]">
                    <span>Shipping Courier</span>
                    <span>{formatRupiah(selectedCarrier.fee)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#ECE6DC] flex justify-between text-base font-bold text-[#14191F]">
                    <span>Final Amount</span>
                    <span>{formatRupiah(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full py-4 rounded-full bg-[#14191F] text-white text-sm font-semibold hover:bg-[#5C7489] transition-all duration-200 flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                >
                  {loading ? (
                    <span>Creating Order...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Order & Pay {formatRupiah(total)}</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-[#7A8B99]">
                  Foundation Mode: Orders are stored persistently in studio records. No automatic credit card charges without confirmation.
                </p>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
