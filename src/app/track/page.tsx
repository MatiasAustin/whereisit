'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductionQueueWidget from '@/components/strava/ProductionQueueWidget';
import { getWhatsAppAdminLink } from '@/data/stravaKeychainConfig';
import { StravaPreOrder, StravaOrderStatus } from '@/types';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Truck, 
  Package, 
  Layers, 
  Sparkles, 
  MessageCircle, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

const EXACT_STATUS_STEPS: { step: number; status: StravaOrderStatus; title: string; desc: string }[] = [
  {
    step: 1,
    status: 'Menunggu Pembayaran',
    title: 'Menunggu Pembayaran',
    desc: 'Invoice dibuat, menunggu pelunasan via Mayar Gateway (QRIS, VA, E-Wallet, Kartu).',
  },
  {
    step: 2,
    status: 'Dibayar — Data Belum Lengkap',
    title: 'Dibayar — Data Belum Lengkap',
    desc: 'Pembayaran terverifikasi. Pembeli WAJIB mengisi link Strava & upload screenshot rute.',
  },
  {
    step: 3,
    status: 'Data Diterima — Menunggu Konfirmasi Desain',
    title: 'Data Diterima — Review Desain',
    desc: 'Tim 3D WhereIsIt menyusun layout rute dan menyiapkan preview persetujuan via WhatsApp.',
  },
  {
    step: 4,
    status: 'Desain Dikonfirmasi',
    title: 'Desain Dikonfirmasi',
    desc: 'Layout 3D disetujui pembeli. File siap dikirim ke mesin cetak mikron.',
  },
  {
    step: 5,
    status: 'Produksi',
    title: 'Produksi (Dalam Antrian Mesin)',
    desc: 'Proses 3D printing adaptif mikro-layer 0.12mm di workshop Karawang.',
  },
  {
    step: 6,
    status: 'QC / Finishing',
    title: 'QC / Finishing',
    desc: 'Pemeriksaan dimensi, pengujian chip e-money, perakitan split ring stainless & satin coat.',
  },
  {
    step: 7,
    status: 'Packing',
    title: 'Packing Studio',
    desc: 'Pengemasan dalam box eksklusif WhereIsIt bersama kartu sertifikat keaslian.',
  },
  {
    step: 8,
    status: 'Dikirim',
    title: 'Dikirim',
    desc: 'Paket diserahkan ke kurir ekspedisi. Nomor resi aktif dapat dipantau.',
  },
  {
    step: 9,
    status: 'Selesai',
    title: 'Selesai',
    desc: 'Pesanan telah diterima. Rute perjuangan lari kamu kini siap menemani setiap hari.',
  },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<StravaPreOrder | null>(null);
  const [error, setError] = useState('');
  const [copiedResi, setCopiedResi] = useState(false);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) return setError('Masukkan Order ID yang ingin dilacak');

    setLoading(true);
    setError('');

    try {
      let url = `/api/strava-orders?orderId=${encodeURIComponent(orderId.trim())}`;
      if (phone.trim()) {
        url += `&phone=${encodeURIComponent(phone.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || 'Pesanan dengan ID tersebut tidak ditemukan');
      }

      setOrder(data.data);
    } catch (err: any) {
      setError(err.message || 'Gagal melacak pesanan');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      handleTrack();
    }
  }, [initialOrderId]);

  const copyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  // Determine current step index (0-8)
  const currentStepIndex = order
    ? EXACT_STATUS_STEPS.findIndex((s) => s.status === order.status)
    : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
          Pre-Order Tracking Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
          Lacak Status Pesanan Kamu
        </h1>
        <p className="text-xs sm:text-sm text-[#556473] max-w-md mx-auto">
          Pantau progres 3D printing gantungan kunci rute Strava kamu mulai dari validasi data hingga nomor resi pengiriman.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE6DC] shadow-sm">
        <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-6">
            <label htmlFor="track-order-id" className="block text-xs font-bold text-[#44505C] mb-1 uppercase tracking-wider">
              Order ID *
            </label>
            <input
              id="track-order-id"
              type="text"
              required
              placeholder="e.g. WSI-20261116-A8F2"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full min-h-[44px] px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="track-phone" className="block text-xs font-bold text-[#44505C] mb-1 uppercase tracking-wider">
              No. WhatsApp (Verifikasi)
            </label>
            <input
              id="track-phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full min-h-[44px] px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-3.5 rounded-2xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Mencari...' : 'Lacak'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* TRACKING RESULT DETAILS */}
      {order && (
        <div className="space-y-6">
          
          {/* WARNING BANNER: INCOMPLETE DATA */}
          {order.status === 'Dibayar — Data Belum Lengkap' && (
            <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold">Lengkapi Data Strava Kamu Supaya Produksi Bisa Mulai!</h3>
              </div>
              <p className="text-xs text-amber-950/90 leading-relaxed">
                Pembayaran kamu telah kami terima. Namun, tim 3D kami belum dapat memulai proses desain karena kamu belum melampirkan tautan Strava dan screenshot rute.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <Link
                  href={`/preorder/keychain-strava/data?orderId=${order.id}`}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <span>Isi Formulir Data Strava Sekarang</span>
                </Link>
                <a
                  href={getWhatsAppAdminLink(order.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-amber-300 text-amber-950 text-xs font-bold"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Butuh bantuan? Chat admin</span>
                </a>
              </div>
            </div>
          )}

          {/* WARNING BANNER: UNPAID */}
          {order.status === 'Menunggu Pembayaran' && (
            <div className="p-5 rounded-3xl bg-blue-50 border border-blue-200 text-blue-900 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-700 flex-shrink-0" />
                <h3 className="text-sm font-bold">Menunggu Pembayaran Invoice</h3>
              </div>
              <p className="text-xs text-blue-900/90 leading-relaxed">
                Pesanan kamu berstatus menunggu pembayaran. Selesaikan pembayaran sebelum batas waktu berakhir.
              </p>
              {order.paymentDetails?.paymentUrl && (
                <div className="pt-1">
                  <a
                    href={order.paymentDetails.paymentUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#14191F] hover:bg-[#5C7489] text-white text-xs font-bold transition-colors"
                  >
                    <span>Lanjutkan Pembayaran di Mayar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ORDER SNAPSHOT CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE6DC] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EBE3]">
              <div>
                <span className="text-[10px] text-[#7A8B99] font-bold uppercase tracking-wider">
                  Order ID
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#14191F] font-mono">
                  #{order.id}
                  {order.isExample && (
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-sans font-bold">
                      Contoh Uji Coba
                    </span>
                  )}
                </h2>
                <p className="text-xs text-[#5C7489] font-semibold mt-0.5">
                  {order.variationName}
                </p>
              </div>

              <div className="sm:text-right space-y-1">
                <span className="text-[10px] text-[#7A8B99] font-bold uppercase tracking-wider">
                  Tahap Saat Ini
                </span>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#EDF3F7] text-[#3E5161] border border-[#C5D5E2]">
                    {order.status}
                  </span>
                </div>
                {order.production?.estimatedCompletionDate && (
                  <p className="text-[11px] text-[#556473]">
                    Target Selesai (dari Pengaturan Studio):{' '}
                    <strong>{order.production.estimatedCompletionDate}</strong>
                    {order.production.queuePosition ? ` • Antrian #${order.production.queuePosition}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Event & Strava Summary (if available) */}
            {order.stravaData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7] text-xs">
                <div>
                  <span className="text-[10px] text-[#7A8B99] font-medium block">Event</span>
                  <span className="font-bold text-[#14191F]">{order.stravaData.eventName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A8B99] font-medium block">Tanggal</span>
                  <span className="font-semibold text-[#14191F]">{order.stravaData.eventDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A8B99] font-medium block">Jarak & Pace</span>
                  <span className="font-semibold text-[#14191F]">{order.stravaData.distance} • {order.stravaData.pace}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A8B99] font-medium block">Durasi</span>
                  <span className="font-semibold text-[#14191F]">{order.stravaData.duration}</span>
                </div>
              </div>
            )}

            {/* Courier & Resi (when shipped) */}
            {order.production?.resiNumber && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">
                      Nomor Resi Pengiriman ({order.production.courier || 'Ekspedisi'})
                    </span>
                    <p className="font-mono font-bold text-base text-emerald-950">
                      {order.production.resiNumber}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => copyResi(order.production?.resiNumber || '')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  {copiedResi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedResi ? 'Tersalin' : 'Salin Resi'}</span>
                </button>
              </div>
            )}

            {/* 9-STEP EXACT TIMELINE */}
            <div className="space-y-4 pt-4 border-t border-[#F0EBE3]">
              <div className="flex items-center justify-between text-xs font-bold text-[#14191F]">
                <span className="uppercase tracking-wider">Timeline Tahapan Produksi</span>
                <span className="text-[#5C7489]">
                  Langkah {currentStepIndex >= 0 ? currentStepIndex + 1 : 1} dari 9
                </span>
              </div>

              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E2D7]">
                {EXACT_STATUS_STEPS.map((stepItem, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const isCompleted = idx < currentStepIndex;

                  return (
                    <div key={stepItem.step} className="relative flex items-start gap-4">
                      {/* Step Indicator Node */}
                      <div
                        className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                          isCurrent
                            ? 'bg-[#14191F] text-white border-[#14191F] ring-4 ring-[#EDF3F7]'
                            : isCompleted
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-[#7A8B99] border-[#DDD5C7]'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepItem.step}
                      </div>

                      {/* Step Details */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isCurrent
                                ? 'text-[#14191F]'
                                : isCompleted
                                ? 'text-emerald-900'
                                : 'text-[#7A8B99]'
                            }`}
                          >
                            {stepItem.title}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#EDF3F7] text-[#3E5161]">
                              Sedang Berjalan
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#556473] leading-relaxed max-w-xl">
                          {stepItem.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WhatsApp Admin Action */}
            <div className="pt-6 border-t border-[#F0EBE3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[#7A8B99]">
                Ada pertanyaan mengenai rute atau pesanan ini?
              </span>
              <a
                href={getWhatsAppAdminLink(order.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-[#F2EDE4] text-[#14191F] font-bold border border-[#DDD5C7] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Butuh bantuan? Chat admin</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* LIVE PRODUCTION QUEUE SECTION (TASK 7) */}
      <div className="space-y-4 pt-4">
        <ProductionQueueWidget currentOrderId={order?.id} />
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-xs text-[#7A8B99]">Memuat pelacakan pesanan...</div>
          </div>
        }>
          <TrackContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
