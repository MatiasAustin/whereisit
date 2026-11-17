'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ALL_NOTIFY_PRODUCTS, getWhatsAppAdminLink } from '@/data/stravaKeychainConfig';
import { Bell, CheckCircle2, AlertCircle, MessageCircle, ArrowRight } from 'lucide-react';

interface ComingSoonNotifyFormProps {
  defaultProduct: string;
  waMessage?: string;
  showSecondaryKeychainCta?: boolean;
  onSuccess?: () => void;
}

export default function ComingSoonNotifyForm({
  defaultProduct,
  waMessage,
  showSecondaryKeychainCta = true,
  onSuccess,
}: ComingSoonNotifyFormProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [product, setProduct] = useState(defaultProduct);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setProduct(defaultProduct);
    setSubmitted(false);
    setError('');
  }, [defaultProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          whatsapp,
          product,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan pendaftaran notifikasi.');
      }

      setSubmitted(true);
      setName('');
      setWhatsapp('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE6DC] shadow-sm space-y-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[#5C7489]">
          <Bell className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Kabari Saya Saat Ready</span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-[#14191F] tracking-tight">
          Daftar Antrian Info Rilis (Tanpa Biaya)
        </h3>
        <p className="text-xs text-[#556473] leading-relaxed">
          Masukkan nama dan nomor WhatsApp kamu. Tim WhereIsIt akan menghubungi begitu batch perdana siap dipesan.
        </p>
      </div>

      {submitted ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Terdaftar di Notify List!</span>
          </div>
          <p className="text-xs leading-relaxed">
            Nomor WhatsApp kamu sudah tercatat untuk pembaruan produk <strong>{product}</strong>.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
          >
            Daftarkan produk lainnya
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="notify-product" className="block text-xs font-bold text-[#44505C] mb-1 uppercase tracking-wider">
              Pilih Produk Coming Soon *
            </label>
            <select
              id="notify-product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-semibold text-[#14191F] focus:outline-none focus:border-[#5C7489]"
            >
              {ALL_NOTIFY_PRODUCTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="notify-name" className="block text-xs font-bold text-[#44505C] mb-1 uppercase tracking-wider">
                Nama Panggilan / Lengkap *
              </label>
              <input
                id="notify-name"
                type="text"
                required
                placeholder="Contoh: Rian"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label htmlFor="notify-wa" className="block text-xs font-bold text-[#44505C] mb-1 uppercase tracking-wider">
                Nomor WhatsApp Aktif *
              </label>
              <input
                id="notify-wa"
                type="tel"
                required
                placeholder="08xxxxxxxxxx"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] py-3.5 px-6 rounded-2xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs sm:text-sm font-bold tracking-wide transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>{submitting ? 'Menyimpan...' : 'Kabari Saya Saat Ready'}</span>
          </button>
        </form>
      )}

      {/* Secondary & Tertiary CTAs */}
      <div className="pt-4 border-t border-[#F0EBE3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {showSecondaryKeychainCta && (
          <Link
            href="/preorder/keychain-strava"
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#EDF3F7] hover:bg-[#DCE7F0] text-[#3E5161] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Sementara itu, keychain sudah bisa pre-order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}

        <a
          href={getWhatsAppAdminLink(undefined, waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EDE4] text-[#14191F] border border-[#DDD5C7] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Tanya Admin di WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
