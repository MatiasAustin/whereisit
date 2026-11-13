'use client';

import React, { useState } from 'react';
import { StravaVariation } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import { X, ShieldCheck, ArrowRight, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

interface MayarCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVariationId?: string;
}

export default function MayarCheckoutModal({
  isOpen,
  onClose,
  initialVariationId,
}: MayarCheckoutModalProps) {
  const [selectedVarId, setSelectedVarId] = useState(
    initialVariationId || STRAVA_PRODUCT_CONFIG.variations[1].id
  );

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

  const currentVariation = STRAVA_PRODUCT_CONFIG.variations.find((v) => v.id === selectedVarId) 
    || STRAVA_PRODUCT_CONFIG.variations[0];

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

      // Redirect directly to Mayar Payment URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Tautan pembayaran tidak diterima dari gateway.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan sistem');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF8F5] text-[#14191F] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E2D7] my-6 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#ECE6DC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDF3F7] text-[#5C7489] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#5C7489]">
                Pre-Order Langsung
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#14191F]">
                Checkout Keychain Strava 3D
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#7A8B99] hover:text-[#14191F] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmitCheckout} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Pilih Variasi */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44505C]">
              1. Pilih Variasi Produk
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STRAVA_PRODUCT_CONFIG.variations.map((v) => {
                const isSelected = selectedVarId === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVarId(v.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#5C7489] bg-[#EDF3F7] shadow-sm ring-1 ring-[#5C7489]'
                        : 'border-[#E8E2D7] bg-white hover:border-[#8BA1B4]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-[#14191F] leading-tight">
                          {v.name.replace('3D Route Keychain + ', '+ ')}
                        </span>
                        {v.isPopular && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-[#5C7489] text-white font-bold">
                            Favorit
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#556473] line-clamp-2">
                        {v.shortDesc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#E8E2D7]/60">
                      <span className="text-sm font-black text-[#14191F]">
                        {formatRupiah(v.price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Minimal Form Kontak & Alamat (HANYA INI SEBELUM BAYAR) */}
          <div className="space-y-4 pt-2 border-t border-[#ECE6DC]">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44505C] mb-1">
                2. Data Pemesan & Pengiriman
              </label>
              <p className="text-[11px] text-[#7A8B99]">
                Data rute Strava dan foto rute akan diisi <strong>SETELAH</strong> pembayaran selesai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Budi Santoso"
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                  Email (untuk bukti invoice) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="budi@example.com"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                  No. WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
                <span className="text-[10px] text-[#7A8B99]">
                  Digunakan untuk konfirmasi preview 3D rute kamu.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                  Kota / Kabupaten *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jakarta Selatan / Bandung"
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
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
              <CreditCard className="w-4 h-4 text-[#5C7489]" />
              <span>Pembayaran Resmi via Mayar Headless Gateway</span>
            </div>
            <p className="text-[11px] text-[#556473] leading-relaxed">
              Mendukung <strong>QRIS Instant</strong>, <strong>Virtual Account</strong> (BCA, Mandiri, BRI, BNI), E-Wallet, dan Kartu Debit/Kredit.
            </p>
            <div className="pt-2 border-t border-[#E8E2D7] flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/70 p-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-700 mt-0.5" />
              <span>
                <strong>WAJIB:</strong> Setelah pembayaran sukses di halaman Mayar, Anda akan dialihkan untuk mengisi formulir link Strava & upload screenshot rute. Produksi baru dapat dimulai setelah formulir terisi.
              </span>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Menghubungkan ke Gateway Mayar...</span>
              ) : (
                <>
                  <span>Bayar Sekarang ({formatRupiah(currentVariation.price)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-[#7A8B99]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transaksi Aman 256-bit SSL • Studio WhereIsIt Jakarta & Karawang</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
