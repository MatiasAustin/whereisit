'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { StoreSettings } from '@/types';
import { INITIAL_SETTINGS } from '@/lib/studioDefaults';
import { 
  FileText, 
  ShieldCheck, 
  Scale, 
  CreditCard, 
  Truck, 
  AlertCircle, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';

export default function TermsAndConditionsPage() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const contactPhone = settings.contactPhone || '+62 851-2806-6354';
  const contactEmail = settings.contactEmail || 'whereisit26@gmail.com';
  const studioAddress = settings.studioAddress || 'Kab. Karawang & Jakarta, Indonesia';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Navbar storeSettings={settings} />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDF3F7] text-[#5C7489] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#D5E1E9]">
              <Scale className="w-3.5 h-3.5" />
              <span>Perjanjian Hukum & Ketentuan Layanan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#14191F] tracking-tight">
              Syarat & Ketentuan (Terms & Conditions)
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#6C7E8E] leading-relaxed">
              Terakhir diperbarui: 18 November 2026. Harap membaca ketentuan ini secara seksama sebelum melakukan transaksi di platform WhereIsIt.
            </p>
          </div>

          {/* Main Legal Content Card */}
          <div className="bg-white border border-[#ECE6DC] rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 text-[#333E48] text-sm leading-relaxed">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">1</span>
                <span>Pendahuluan & Penerimaan Ketentuan</span>
              </h2>
              <p>
                Selamat datang di situs dan platform resmi <strong>WhereIsIt</strong> (selanjutnya disebut &quot;WhereIsIt&quot;, &quot;Kami&quot;, atau &quot;Studio&quot;). Syarat dan Ketentuan ini mengatur seluruh akses Anda ke situs web, layanan custom 3D design, pemesanan produk pre-order, pembelian katalog, serta seluruh transaksi pembayaran yang diproses melalui sistem kami.
              </p>
              <p>
                Dengan mengakses situs ini atau melakukan pemesanan, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat secara hukum pada seluruh Syarat & Ketentuan ini beserta Kebijakan Pengembalian Dana dan Kebijakan Privasi kami.
              </p>
            </section>

            <hr className="border-[#ECE6DC]" />

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">2</span>
                <span>Layanan & Pemesanan Produk</span>
              </h2>
              <p>
                WhereIsIt memproduksi dan menjual objek 3D fisik dengan dua skema utama:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#51606D]">
                <li>
                  <strong>Katalog Ready-Stock:</strong> Produk siap kirim yang diproses dalam 1-2 hari kerja setelah verifikasi pembayaran.
                </li>
                <li>
                  <strong>Produk Pre-Order & Custom Studio:</strong> Produk yang dicetak berdasarkan pesanan (seperti Keychain Strava, keepsakes, dan prototipe arsitektur). Estimasi produksi bergantung pada kerumitan desain dan antrian mesin yang tertera di sistem pelacakan kami.
                </li>
              </ul>
              <p>
                Karakteristik fisik cetak 3D berbasis layer mikro (0.12mm) memiliki tekstur unik bawaan proses additive manufacturing yang tidak dikategorikan sebagai cacat produksi melainkan ciri khas craftmanship material.
              </p>
            </section>

            <hr className="border-[#ECE6DC]" />

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">3</span>
                <span>Harga, Pembayaran, & Pajak</span>
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[#51606D]">
                <li>Semua harga tertera dalam Rupiah (IDR) dan sudah termasuk biaya persiapan produksi standar kecuali dinyatakan lain.</li>
                <li>Biaya pengiriman dan asuransi transit dihitung otomatis berdasarkan alamat pengiriman dan berat/volume paket saat checkout.</li>
                <li>
                  Transaksi pembayaran diproses melalui mitra resmi Payment Gateway (iPaymu / Mayar) yang telah mengantongi lisensi resmi dari otoritas terkait. Kami menerima QRIS, Virtual Account, Transfer Bank, dan Kartu Kredit.
                </li>
                <li>
                  Pesanan akan otomatis dibatalkan oleh sistem jika pembayaran tidak diselesaikan dalam batas waktu invoice (maksimal 24 jam).
                </li>
              </ul>
            </section>

            <hr className="border-[#ECE6DC]" />

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">4</span>
                <span>Hak Kekayaan Intelektual (HAKI)</span>
              </h2>
              <p>
                Seluruh materi di situs web ini, mencakup namun tidak terbatas pada logo merek WhereIsIt, foto produk, model 3D katalog, teks editorial, dan kode sumber adalah hak milik WhereIsIt Studio.
              </p>
              <p>
                Untuk pemesanan Custom Design: Pengguna menjamin bahwa file 3D, gambar, foto, atau referensi yang diunggah tidak melanggar hak cipta, paten, atau hak kekayaan intelektual pihak ketiga mana pun. Pengguna membebaskan WhereIsIt dari segala bentuk tuntutan hukum atas materi yang diunggah oleh pengguna.
              </p>
            </section>

            <hr className="border-[#ECE6DC]" />

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">5</span>
                <span>Pengiriman & Garansi Transit</span>
              </h2>
              <p>
                WhereIsIt bekerja sama dengan ekspedisi logistik terpercaya (JNE, SiCepat, Anteraja). Risiko kehilangan atau kerusakan selama pengiriman dilindungi oleh program Garansi Transit dengan ketentuan pembeli wajib melampirkan video unboxing utuh tanpa edit dalam 2x24 jam sejak paket dinyatakan tiba.
              </p>
            </section>

            <hr className="border-[#ECE6DC]" />

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">6</span>
                <span>Batasan Tanggung Jawab & Keadaan Kahar (Force Majeure)</span>
              </h2>
              <p>
                WhereIsIt tidak bertanggung jawab atas keterlambatan atau kegagalan pemenuhan kewajiban yang diakibatkan oleh keadaan kahar (force majeure) seperti bencana alam, kebakaran, pandemi, kebijakan restriksi pemerintah, atau gangguan massal jaringan telekomunikasi dan perbankan di luar kendali wajar kami.
              </p>
            </section>

            <hr className="border-[#ECE6DC]" />

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">7</span>
                <span>Hukum yang Berlaku (Jurisdiction)</span>
              </h2>
              <p>
                Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di <strong>Negara Republik Indonesia</strong>. Segala sengketa yang timbul akan diselesaikan secara musyawarah untuk mufakat, atau melalui yurisdiksi pengadilan di wilayah Republik Indonesia.
              </p>
            </section>

            <hr className="border-[#ECE6DC]" />

            {/* Section 8: Legal Identity & Contact (iPaymu Requirement) */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">8</span>
                <span>Identitas Usaha & Kontak Resmi</span>
              </h2>
              <p>
                Pertanyaan, klarifikasi, atau keluhan hukum terkait Syarat & Ketentuan ini dapat disampaikan ke saluran resmi WhereIsIt:
              </p>
              
              <div className="bg-[#FAF8F5] border border-[#E2D9CC] rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#5C7489] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#14191F]">Alamat Usaha / Workshop Studio:</span>
                    <p className="text-[#51606D] mt-0.5">{studioAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#5C7489] shrink-0" />
                  <div>
                    <span className="font-bold text-[#14191F]">Nomor Telepon / WhatsApp:</span>
                    <span className="text-[#51606D] ml-2">{contactPhone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#5C7489] shrink-0" />
                  <div>
                    <span className="font-bold text-[#14191F]">Email Resmi Usaha:</span>
                    <span className="text-[#51606D] ml-2">{contactEmail}</span>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Quick links */}
          <div className="mt-8 text-center text-xs text-[#7A8B99]">
            Lihat juga:{' '}
            <Link href="/refund-policy" className="text-[#5C7489] font-bold hover:underline">
              Kebijakan Pengembalian Dana
            </Link>{' '}
            •{' '}
            <Link href="/faq" className="text-[#5C7489] font-bold hover:underline">
              FAQ
            </Link>{' '}
            •{' '}
            <Link href="/kontak" className="text-[#5C7489] font-bold hover:underline">
              Kontak Kami
            </Link>
          </div>

        </div>
      </main>

      <Footer storeSettings={settings} />
    </div>
  );
}
