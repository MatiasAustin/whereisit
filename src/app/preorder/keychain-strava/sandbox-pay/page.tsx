'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/utils';
import { StravaPreOrder } from '@/types';
import { ShieldCheck, CreditCard, QrCode, ArrowRight, CheckCircle2 } from 'lucide-react';

function SandboxPayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || '';

  const [order, setOrder] = useState<StravaPreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetch(`/api/strava-orders?orderId=${encodeURIComponent(orderId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleSimulateSuccess = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/strava-orders/simulate-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/preorder/keychain-strava/success?orderId=${orderId}`);
      }
    } catch (e) {
      console.error(e);
      setPaying(false);
    }
  };

  if (!orderId) {
    return (
      <div className="p-8 text-center text-xs text-[#7A8B99]">
        Order ID missing.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE6DC] shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
            Mayar Headless Sandbox Simulator
          </span>
          <h1 className="text-xl font-black text-[#14191F]">Simulasi Invoice Mayar</h1>
          <p className="text-xs text-[#556473]">Order #{orderId}</p>
        </div>

        {/* Invoice Items */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D7]">
            <span className="text-[#7A8B99]">Produk:</span>
            <span className="font-bold text-[#14191F] text-right">{order?.variationName || 'Keychain Strava'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D7]">
            <span className="text-[#7A8B99]">Pemesan:</span>
            <span className="font-semibold text-[#14191F]">{order?.customer.fullName || '-'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-[#14191F]">Total Bayar:</span>
            <span className="text-base font-black text-[#5C7489]">
              {order ? formatRupiah(order.total) : '...'}
            </span>
          </div>
        </div>

        {/* Payment Channels simulation */}
        <div className="space-y-2 text-xs text-[#556473]">
          <span className="text-[10px] uppercase font-bold text-[#7A8B99] tracking-wider block">
            Pilihan Metode Bayar (Simulasi)
          </span>
          <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-medium">
            <div className="p-2.5 rounded-xl border border-[#5C7489] bg-[#EDF3F7] text-[#3E5161]">
              QRIS Instant
            </div>
            <div className="p-2.5 rounded-xl border border-[#E8E2D7] bg-[#FAF8F5]">
              BCA Virtual Account
            </div>
          </div>
        </div>

        <button
          onClick={handleSimulateSuccess}
          disabled={paying || loading}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {paying ? (
            <span>Memproses Settlement...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulasikan Pembayaran Berhasil</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-[#7A8B99]">
          Halaman ini hanya muncul jika MAYAR_API_KEY belum dikonfigurasi di lingkungan lokal.
        </p>
      </div>
    </div>
  );
}

export default function SandboxPayPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F1]">
      <Suspense fallback={<div>Loading simulator...</div>}>
        <SandboxPayContent />
      </Suspense>
    </div>
  );
}
