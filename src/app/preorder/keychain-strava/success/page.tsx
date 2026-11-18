'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { StravaPreOrder } from '@/types';
import { getWhatsAppAdminLink } from '@/data/stravaKeychainConfig';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  FileEdit, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  const [order, setOrder] = useState<StravaPreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingPayment, setRetryingPayment] = useState(false);

  const handleRetrySameOrder = async () => {
    if (!order) return;
    setRetryingPayment(true);
    try {
      const endpoint = order.paymentMethod === 'Clicky' ? '/api/checkout/clicky' : '/api/checkout/mayar';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: order.customer,
          variationId: order.variationId,
          shippingRegion: order.shippingRegion || 'Jabodetabek',
          existingOrderId: order.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRetryingPayment(false);
    }
  };

  const fetchOrderStatus = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      setRefreshing(true);
      const res = await fetch(`/api/strava-orders?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
        <h1 className="text-xl font-bold text-[#14191F]">Order ID Tidak Ditemukan</h1>
        <p className="text-xs text-[#556473]">
          Silakan periksa kembali tautan yang Anda buka atau hubungi admin.
        </p>
        <Link href="/" className="inline-block px-6 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-bold">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isPaid = order && order.status !== 'Menunggu Pembayaran';
  const isDataComplete = order?.stravaData && order.stravaData.stravaUrl;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ECE6DC] shadow-sm text-center space-y-6">
        
        {loading ? (
          <div className="py-12 space-y-3">
            <div className="w-8 h-8 border-2 border-[#5C7489] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-[#7A8B99]">Memeriksa status pembayaran...</p>
          </div>
        ) : isPaid ? (
          /* PAYMENT SUCCESSFUL */
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs uppercase font-bold tracking-widest text-[#5C7489]">
                Pembayaran Terverifikasi
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                Terima Kasih, Pembayaran Berhasil!
              </h1>
              <p className="text-xs sm:text-sm text-[#556473]">
                Order ID: <span className="font-mono font-bold text-[#14191F]">#{order?.id}</span>
              </p>
            </div>

            {/* MANDATORY NEXT STEP BANNER */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <FileEdit className="w-4 h-4 text-amber-700" />
                <span>LANGKAH WAJIB BERIKUTNYA</span>
              </div>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                Produksi gantungan kunci 3D rute kamu <strong>TIDAK DAPAT DIMULAI</strong> sebelum kamu melengkapi link Strava dan screenshot rute di formulir data.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href={`/preorder/keychain-strava/data?orderId=${order?.id}`}
                className="w-full py-4 rounded-2xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Lengkapi Data Rute Strava Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-4 text-xs text-[#7A8B99] pt-1">
                <Link href={`/track?orderId=${order?.id}`} className="hover:text-[#14191F] underline">
                  Lacak Pesanan
                </Link>
                <span>•</span>
                <a
                  href={getWhatsAppAdminLink(order?.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#14191F] underline flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                  <span>Chat Admin di WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* PAYMENT STILL PENDING OR FAILED RETRY SCREEN */
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs uppercase font-bold tracking-widest text-[#5C7489]">
                Menunggu Konfirmasi
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                Menunggu Pembayaran
              </h1>
              <p className="text-xs sm:text-sm text-[#556473]">
                Order ID: <span className="font-mono font-bold text-[#14191F]">#{order?.id}</span>
              </p>
            </div>

            <p className="text-xs text-[#556473] max-w-md mx-auto leading-relaxed">
              Jika kamu sudah menyelesaikan pembayaran, klik tombol di bawah untuk menyegarkan status pesanan kamu.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={fetchOrderStatus}
                disabled={refreshing}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#14191F] hover:bg-[#5C7489] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Cek Ulang Status Pembayaran</span>
              </button>

              {/* If payment link exists or needs refresh, retry with SAME Order ID */}
              {order?.paymentDetails?.paymentUrl ? (
                <a
                  href={order.paymentDetails.paymentUrl}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-full bg-white border border-[#DDD5C7] text-[#14191F] text-xs font-bold hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Buka Ulang Halaman Bayar</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleRetrySameOrder}
                  disabled={retryingPayment}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-full bg-white border border-[#DDD5C7] text-[#14191F] text-xs font-bold hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>{retryingPayment ? 'Membuat ulang...' : 'Ulangi Pembayaran (Order ID Sama)'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PreorderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-xs text-[#7A8B99]">Memuat status invoice...</div>
          </div>
        }>
          <SuccessPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
