'use client';

import React, { useState, useEffect } from 'react';
import { formatRupiah } from '@/lib/utils';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import { X, ShieldCheck, ArrowRight, CreditCard, AlertCircle } from 'lucide-react';

interface MayarCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVariationId?: string;
  variationPrices?: Record<string, number>;
}

export default function MayarCheckoutModal({
  isOpen,
  onClose,
  initialVariationId,
  variationPrices,
}: MayarCheckoutModalProps) {
  const [selectedVarId, setSelectedVarId] = useState(
    initialVariationId || STRAVA_PRODUCT_CONFIG.variations[1].id
  );
  const [mediaPrices, setMediaPrices] = useState<Record<string, number>>(variationPrices || {});

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
    if (!isOpen) return;
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
    STRAVA_PRODUCT_CONFIG.variations.find((v) => v.id === selectedVarId) ||
    STRAVA_PRODUCT_CONFIG.variations[0];
  const currentPrice = mediaPrices[currentVariation.id] ?? currentVariation.price;

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
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
              Pre-Order Langsung via Mayar
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
        <form onSubmit={handleSubmitCheckout} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Pilih Variasi */}
          <div className="space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#44505C]">
              1. Pilih Variasi Shopee Resmi
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STRAVA_PRODUCT_CONFIG.variations.map((v) => {
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

          {/* 2. Minimal Form Kontak & Alamat (HANYA INI SEBELUM BAYAR) */}
          <div className="space-y-4 pt-2 border-t border-[#ECE6DC]">
            <div>
              <h3 className="block text-xs font-bold uppercase tracking-wider text-[#44505C] mb-1">
                2. Data Pemesan &amp; Pengiriman
              </h3>
              <p className="text-[11px] text-[#556473]">
                URL Strava dan foto screenshot diisi <strong>SETELAH</strong> pembayaran selesai.
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
                <label htmlFor="chk-email" className="block text-[11px] font-semibold text-[#44505C] mb-1">
                  Email (untuk bukti invoice) *
                </label>
                <input
                  id="chk-email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
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
                  Digunakan untuk konfirmasi preview desain 3D.
                </span>
              </div>

              <div>
                <label htmlFor="chk-city" className="block text-[11px] font-semibold text-[#44505C] mb-1">
                  Kota / Kabupaten *
                </label>
                <input
                  id="chk-city"
                  type="text"
                  required
                  placeholder="Contoh: Jakarta Selatan / Bandung"
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
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
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kode pos"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>
          </div>

          {/* Transparent Payment & Post-Payment Notice */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#14191F]">
              <CreditCard className="w-4 h-4 text-[#5C7489]" aria-hidden="true" />
              <span>Pembayaran via Mayar Headless Gateway</span>
            </div>
            <p className="text-[11px] text-[#44505C] leading-relaxed">
              Mendukung <strong>QRIS</strong>, <strong>Virtual Account</strong>, E-Wallet, dan Kartu.
            </p>
            <div className="pt-2 border-t border-[#E8E2D7] flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/70 p-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-700 mt-0.5" aria-hidden="true" />
              <span>
                <strong>WAJIB:</strong> Setelah pembayaran sukses, lengkapi form link Strava &amp; upload screenshot rute. Produksi baru dapat dimulai setelah form terisi dan desain dikonfirmasi.
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
                <span>Menghubungkan ke Gateway Mayar...</span>
              ) : (
                <>
                  <span>Lanjut Pembayaran ({formatRupiah(currentPrice)})</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-[#556473]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>WhereIsIt? (Kab. Karawang &amp; Jakarta)</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
