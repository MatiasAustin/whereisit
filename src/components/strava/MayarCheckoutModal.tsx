'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import { StravaVariation } from '@/types';
import {
  getActivePaymentProvider,
  ClickyShippingRegion,
  CLICKY_SHIPPING_RATES,
} from '@/lib/clicky';
import {
  X,
  ShieldCheck,
  ArrowRight,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  RefreshCw,
} from 'lucide-react';

interface MayarCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVariationId?: string;
  variationPrices?: Record<string, number>;
  variations?: StravaVariation[];
}

export default function MayarCheckoutModal({
  isOpen,
  onClose,
  initialVariationId,
  variationPrices,
  variations,
}: MayarCheckoutModalProps) {
  const provider = getActivePaymentProvider();

  const availableVariations = variations && variations.length > 0 ? variations : STRAVA_PRODUCT_CONFIG.variations;

  const [selectedVarId, setSelectedVarId] = useState(
    initialVariationId || availableVariations[0]?.id || 'var-57x94'
  );
  const [shippingRegion, setShippingRegion] = useState<ClickyShippingRegion>('Jabodetabek');
  const [mediaPrices, setMediaPrices] = useState<Record<string, number>>(variationPrices || {});

  // Clicky created order state (displays single matching link + order ID)
  const [createdOrder, setCreatedOrder] = useState<{
    orderId: string;
    paymentUrl: string;
    total: number;
    shippingFee: number;
    price: number;
    variationName: string;
    shippingRegion: string;
  } | null>(null);

  const [copiedOrderId, setCopiedOrderId] = useState(false);

  useEffect(() => {
    if (variationPrices && Object.keys(variationPrices).length > 0) {
      setMediaPrices(variationPrices);
    } else {
      fetch('/api/strava-media')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data?.variationPrices) {
            setMediaPrices(d.data.variationPrices);
          }
        })
        .catch(() => {});
    }
  }, [variationPrices, isOpen]);

  useEffect(() => {
    if (initialVariationId) {
      setSelectedVarId(initialVariationId);
    }
  }, [initialVariationId]);

  useEffect(() => {
    if (!isOpen) {
      setCreatedOrder(null);
      setError('');
      setCopiedOrderId(false);
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const [customer, setCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Jakarta',
    postalCode: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentVariation =
    availableVariations.find((v) => v.id === selectedVarId) ||
    availableVariations[0];
  const currentPrice = mediaPrices[currentVariation.id] ?? currentVariation.price;
  const currentShippingFee = CLICKY_SHIPPING_RATES[shippingRegion] || 16000;
  const currentTotal = currentPrice + currentShippingFee;

  const handleCopyOrderId = (idToCopy: string) => {
    try {
      navigator.clipboard.writeText(idToCopy);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2500);
    } catch {}
  };

  // Submit checkout: branches based on payment provider flag
  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (provider === 'clicky') {
        // --- CLICKY FLOW (CURRENT DEFAULT) ---
        const res = await fetch('/api/checkout/clicky', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: {
              ...customer,
              city: shippingRegion,
            },
            variationId: selectedVarId,
            shippingRegion,
            existingOrderId: createdOrder?.orderId,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal memproses pesanan Clicky. Periksa kembali formulir.');
        }

        setCreatedOrder({
          orderId: data.orderId,
          paymentUrl: data.paymentUrl,
          total: data.total,
          shippingFee: data.shippingFee,
          price: data.price,
          variationName: data.variationName,
          shippingRegion: data.shippingRegion,
        });
      } else {
        // --- MAYAR FLOW (PRESERVED BEHIND FLAG) ---
        const res = await fetch('/api/checkout/mayar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer,
            variationId: selectedVarId,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal memproses checkout. Silakan periksa kembali formulir.');
        }

        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          throw new Error('Tautan pembayaran tidak diterima dari gateway.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#FAF8F5] text-[#14191F] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E2D7] my-6 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#ECE6DC] flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#5C7489] block">
              {provider === 'mayar'
                ? 'Pre-Order Langsung via Mayar'
                : 'Pre-Order Keychain Strava (Batch 2)'}
            </span>
            <h2 id="checkout-modal-title" className="text-base sm:text-lg font-black text-[#14191F] leading-snug">
              {STRAVA_PRODUCT_CONFIG.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] p-2 rounded-full hover:bg-[#FAF8F5] text-[#556473] hover:text-[#14191F] transition-colors flex items-center justify-center flex-shrink-0"
            aria-label="Tutup form checkout"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        {createdOrder ? (
          /* ============================================================== */
          /* SCREEN 2: ORDER CREATED & SINGLE MATCHING CLICKY PAYMENT LINK */
          /* ============================================================== */
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* 1. ORDER ID BANNER (CRITICAL) */}
            <div className="p-5 rounded-3xl bg-[#14191F] text-white border border-[#26333E] shadow-lg space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#8BA1B4]">
                  Nomor Pesanan Terdaftar
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Menunggu Pembayaran
                </span>
              </div>

              <div>
                <p className="text-xs text-[#D5E1E9]">
                  Order ID kamu:
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white">
                    #{createdOrder.orderId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderId(createdOrder.orderId)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all flex items-center gap-1.5 text-[#D5E1E9]"
                    title="Salin Order ID"
                  >
                    {copiedOrderId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-[#A2B7C7] leading-relaxed">
                ⚠️ <strong>Simpan nomor ini</strong>, kamu akan membutuhkannya untuk melengkapi formulir data Strava (rute &amp; screenshot) setelah pembayaran.
              </div>
            </div>

            {/* 2. ORDER SUMMARY */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8E2D7] space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE3]">
                <span className="font-bold text-[#14191F]">Ringkasan Pesanan</span>
                <span className="text-[#5C7489] font-medium">{createdOrder.variationName}</span>
              </div>
              <div className="flex justify-between text-[#556473]">
                <span>Harga Produk:</span>
                <span className="font-semibold text-[#14191F]">{formatRupiah(createdOrder.price)}</span>
              </div>
              <div className="flex justify-between text-[#556473]">
                <span>Ongkir ({createdOrder.shippingRegion}):</span>
                <span className="font-semibold text-[#14191F]">{formatRupiah(createdOrder.shippingFee)}</span>
              </div>
              <div className="pt-2 border-t border-[#F0EBE3] flex justify-between items-center text-sm">
                <span className="font-black text-[#14191F]">Total Pembayaran:</span>
                <span className="font-black text-lg text-[#14191F]">
                  {formatRupiah(createdOrder.total)}
                </span>
              </div>
              <p className="text-[11px] text-[#5C7489] pt-1">
                {createdOrder.variationName} — {createdOrder.shippingRegion}: {formatRupiah(createdOrder.price)} + ongkir {formatRupiah(createdOrder.shippingFee)} = <strong>{formatRupiah(createdOrder.total)}</strong>
              </p>
            </div>

            {/* 3. THE ONE PAYMENT LINK (CLICKY) */}
            <div className="p-5 rounded-3xl bg-[#FAF8F5] border-2 border-[#5C7489] space-y-4 shadow-sm">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#5C7489] block">
                  Tautan Pembayaran Resmi Clicky
                </span>
                <h3 className="text-sm font-black text-[#14191F] mt-0.5">
                  Klik tombol di bawah untuk membayar
                </h3>
                <p className="text-[11px] text-[#556473] mt-1 leading-relaxed">
                  Mendukung <strong>QRIS</strong> (GoPay, DANA, OVO, ShopeePay), <strong>E-Wallet</strong> (AstraPay, LinkAja, DOKU), dan <strong>Virtual Account</strong> (BCA, Mandiri, BNI, BRI, Permata, CIMB Niaga, BSI).
                </p>
              </div>

              <div>
                <a
                  href={createdOrder.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] py-4 rounded-2xl bg-[#5C7489] hover:bg-[#4C6275] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Bayar Sekarang via Clicky ({formatRupiah(createdOrder.total)})</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
                <span className="text-[10px] text-[#7A8B99] text-center block mt-2 break-all">
                  Link: {createdOrder.paymentUrl}
                </span>
              </div>
            </div>

            {/* 4. POST-PAYMENT FORM STEP PROMPT */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Langkah Wajib Setelah Bayar:</h4>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed mt-0.5">
                    Setelah menyelesaikan pembayaran di Clicky, kembali ke website dan lengkapi formulir data Strava (screenshot &amp; link aktivitas) agar desain rute dapat diproses.
                  </p>
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                <Link
                  href={`/preorder/keychain-strava/data?orderId=${encodeURIComponent(createdOrder.orderId)}`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-950 font-bold text-xs hover:bg-amber-100/50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Lanjut ke Formulir Data Strava</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={handleSubmitCheckout}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs text-[#5C7489] hover:text-[#14191F] font-semibold flex items-center justify-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Coba Bayar Ulang (Order ID Sama)</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* SCREEN 1: FORM INPUT (VARIAN, DATA PEMESAN, LOKASI REGION)     */
          /* ============================================================== */
          <form onSubmit={handleSubmitCheckout} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Pilih Variasi Produk */}
            <div className="space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#44505C]">
                1. Pilih Variasi Keychain (Batch 2)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableVariations.map((v) => {
                  const isSelected = selectedVarId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVarId(v.id)}
                      aria-pressed={isSelected}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#5C7489] bg-[#EDF3F7] shadow-sm ring-1 ring-[#5C7489]'
                          : 'border-[#E8E2D7] bg-white hover:border-[#8BA1B4]'
                      }`}
                    >
                      <div className="w-full space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-[#14191F] leading-tight">
                            {v.name}
                          </span>
                          {v.isPopular && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-[#5C7489] text-white font-bold">
                              Populer
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#556473] line-clamp-2">{v.shortDesc}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#E8E2D7]/60 w-full">
                        <span className="text-sm font-black text-[#14191F]">
                          {formatRupiah(mediaPrices[v.id] ?? v.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Data Pemesan & Pengiriman */}
            <div className="space-y-4 pt-2 border-t border-[#ECE6DC]">
              <div>
                <h3 className="block text-xs font-bold uppercase tracking-wider text-[#44505C] mb-1">
                  2. Data Pemesan &amp; Pengiriman
                </h3>
                <p className="text-[11px] text-[#556473]">
                  URL Strava dan tangkapan layar rute diisi <strong>SETELAH</strong> pembayaran.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="chk-fullname" className="block text-[11px] font-semibold text-[#44505C] mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    id="chk-fullname"
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div>
                  <label htmlFor="chk-phone" className="block text-[11px] font-semibold text-[#44505C] mb-1">
                    No. WhatsApp Aktif *
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                  <span className="text-[10px] text-[#556473]">
                    Untuk konfirmasi preview rute 3D bersama admin.
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="chk-email" className="block text-[11px] font-semibold text-[#44505C] mb-1">
                    Email (Opsional untuk salinan konfirmasi)
                  </label>
                  <input
                    id="chk-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="chk-address" className="block text-[11px] font-semibold text-[#44505C] mb-1">
                    Alamat Lengkap Pengiriman *
                  </label>
                  <textarea
                    id="chk-address"
                    required
                    rows={2}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Pilih Lokasi Pengiriman (Tarif Flat Saling Subsidi) */}
            <div className="space-y-3 pt-2 border-t border-[#ECE6DC]">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-[#44505C]">
                  3. Pilih Wilayah Pengiriman
                </span>
                <p className="text-[11px] text-[#556473]">
                  Tarif flat saling subsidi untuk seluruh Indonesia.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShippingRegion('Jabodetabek')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    shippingRegion === 'Jabodetabek'
                      ? 'border-[#5C7489] bg-[#EDF3F7] ring-1 ring-[#5C7489]'
                      : 'border-[#E8E2D7] bg-white hover:border-[#8BA1B4]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-[#14191F] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#5C7489]" />
                      <span>Jabodetabek</span>
                    </span>
                    <span className="text-[11px] text-[#556473] block">
                      Jakarta, Bogor, Depok, Tangerang, Bekasi
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#14191F]">
                    Rp16.000
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingRegion('Luar Jabodetabek')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    shippingRegion === 'Luar Jabodetabek'
                      ? 'border-[#5C7489] bg-[#EDF3F7] ring-1 ring-[#5C7489]'
                      : 'border-[#E8E2D7] bg-white hover:border-[#8BA1B4]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-[#14191F] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#5C7489]" />
                      <span>Luar Jabodetabek</span>
                    </span>
                    <span className="text-[11px] text-[#556473] block">
                      Seluruh kota &amp; daerah lain di Indonesia
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#14191F]">
                    Rp20.000
                  </span>
                </button>
              </div>

              {/* Total Breakdown Calculation Display */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8E2D7] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[#556473]">
                  {currentVariation.name} ({shippingRegion}): {formatRupiah(currentPrice)} + ongkir {formatRupiah(currentShippingFee)}
                </span>
                <span className="font-black text-sm text-[#14191F]">
                  Total: {formatRupiah(currentTotal)}
                </span>
              </div>
            </div>

            {/* Footer Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] py-4 rounded-2xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Menyiapkan Link Pembayaran...</span>
                ) : (
                  <>
                    <span>Lanjut ke Pembayaran ({formatRupiah(currentTotal)})</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-[#556473]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Pembayaran Resmi WhereIsIt Studio • Terdaftar Server-Side</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
