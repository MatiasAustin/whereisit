'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import StravaGallery from '@/components/strava/StravaGallery';
import ProductionQueueWidget from '@/components/strava/ProductionQueueWidget';
import MayarCheckoutModal from '@/components/strava/MayarCheckoutModal';
import { STRAVA_PRODUCT_CONFIG, getWhatsAppAdminLink } from '@/data/stravaKeychainConfig';
import { formatRupiah } from '@/lib/utils';
import { 
  Sparkles, 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2, 
  ChevronDown, 
  ExternalLink, 
  ShieldCheck, 
  Eye, 
  Star, 
  Flame,
  Layers,
  Clock,
  Compass
} from 'lucide-react';

export default function StravaKeychainLandingPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedVariationId, setSelectedVariationId] = useState<string | undefined>(undefined);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleOpenCheckout = (varId?: string) => {
    setSelectedVariationId(varId);
    setCheckoutOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1] text-[#14191F]">
      <Navbar />

      <main className="flex-grow">
        
        {/* SECTION A: HERO SECTION */}
        <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden border-b border-[#ECE6DC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Top Micro Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#5C7489] text-white">
                {STRAVA_PRODUCT_CONFIG.badge}
              </span>

              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EDF3F7] text-[#3E5161] border border-[#C5D5E2] flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-[#5C7489]" />
                <span>Viral di Threads (88.2K Views)</span>
              </span>

              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white text-[#44505C] border border-[#DDD5C7] flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Rating Shopee 5.0</span>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Product Title & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                    WhereIsIt Studio Jakarta & Karawang
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#14191F] tracking-tight leading-[1.05]">
                    {STRAVA_PRODUCT_CONFIG.hook}
                  </h1>
                </div>

                <p className="text-sm sm:text-base text-[#44505C] leading-relaxed max-w-xl">
                  Gantungan kunci 3D print presisi mikron yang dibuat khusus dari data rute Strava kamu sendiri—menampilkan kontur jalur lari, jarak tempuh, pace, dan durasi finis. Bisa difungsikan ganda sebagai kartu e-money untuk tap di MRT dan KRL.
                </p>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-white border border-[#E8E2D7] inline-block shadow-sm">
                  <span className="text-[11px] uppercase font-bold text-[#7A8B99] tracking-wider block">
                    Rentang Harga Pre-Order
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight mt-0.5">
                    {STRAVA_PRODUCT_CONFIG.priceRange}
                  </div>
                  <span className="text-[11px] text-[#5C7489] font-medium">
                    Tersedia 3 variasi pilihan • Pre-order 5–7 hari kerja
                  </span>
                </div>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    onClick={() => handleOpenCheckout()}
                    className="px-8 py-4 rounded-full bg-[#14191F] hover:bg-[#5C7489] text-[#F8F6F1] font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Pre-Order Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={getWhatsAppAdminLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-4 rounded-full bg-white hover:bg-[#FAF8F5] text-[#14191F] font-bold text-sm border border-[#DDD5C7] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Tanya Admin di WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#7A8B99] pt-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#5C7489]" />
                    <span>Checkout Langsung via Mayar</span>
                  </span>
                  <span>•</span>
                  <span>Bukan Ready Stock</span>
                  <span>•</span>
                  <span>Personal 3D Map</span>
                </div>
              </div>

              {/* Right Column: Visual Teaser */}
              <div className="lg:col-span-5">
                <div className="relative p-6 sm:p-8 rounded-3xl bg-[#182027] text-white border border-[#26333E] shadow-xl overflow-hidden space-y-6">
                  <div className="absolute inset-0 opacity-10 pointer-events-none editorial-grid"></div>

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8BA1B4]">
                      Bespoke 3D Artifact
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-[#5C7489] text-white">
                      0.12mm Micro-Layer
                    </span>
                  </div>

                  <div className="relative z-10 py-6 text-center space-y-3">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#24303C] to-[#3E5161] border border-[#5C7489]/50 mx-auto flex items-center justify-center shadow-inner">
                      <Sparkles className="w-10 h-10 text-[#8BA1B4]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black tracking-tight text-white">
                        Keychain Custom Data Strava
                      </h3>
                      <p className="text-xs text-[#8E9FAA]">
                        Rute &ldquo;BDO ULTRA&rdquo; • 50.2 KM • Finisher Keepsake
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-[#8E9FAA] flex items-center justify-between">
                    <span>E-Money Chip Terintegrasi:</span>
                    <span className="font-bold text-emerald-400">Aktif & Siap Tap</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION B: PHOTO & VIDEO GALLERY */}
        <section className="py-14 sm:py-20 border-b border-[#ECE6DC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                  Galeri Produk & Bukti Nyata
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                  Visual Detail & Bukti Video Tap MRT
                </h2>
                <p className="text-xs sm:text-sm text-[#556473]">
                  6 foto produk resmi studio dan rekaman video tap langsung di gerbang MRT Jakarta.
                </p>
              </div>

              <div className="text-xs text-[#7A8B99] flex items-center gap-2">
                <span>Sumber:</span>
                <a
                  href={STRAVA_PRODUCT_CONFIG.sourceOfTruth.shopeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#5C7489] hover:underline flex items-center gap-1"
                >
                  <span>Shopee WhereIsIt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <StravaGallery />
          </div>
        </section>

        {/* SECTION C: THE STORY (PIXAR-STYLE 3-4 PARAGRAPHS) */}
        <section className="py-14 sm:py-20 bg-[#F2EDE4]/60 border-b border-[#ECE6DC]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                The Narrative
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                Mengapa Rute Lari Kamu Layak Diabadikan?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STRAVA_PRODUCT_CONFIG.story.map((item, index) => (
                <div
                  key={item.phase}
                  className="p-6 rounded-3xl bg-white border border-[#E8E2D7] shadow-sm space-y-3 relative overflow-hidden"
                >
                  <span className="text-[10px] font-mono uppercase font-bold text-[#5C7489] tracking-wider px-2.5 py-1 rounded-full bg-[#EDF3F7] inline-block">
                    0{index + 1} / {item.phase}
                  </span>
                  <h3 className="text-base font-bold text-[#14191F]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#556473] leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION D: WHAT YOU GET */}
        <section className="py-14 sm:py-20 border-b border-[#ECE6DC]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                Spesifikasi & Kelengkapan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                Yang Kamu Dapatkan di Dalam Paket
              </h2>
              <p className="text-xs sm:text-sm text-[#556473]">
                Setiap piece dirancang personal dan melalui proses hand-finishing studio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STRAVA_PRODUCT_CONFIG.whatYouGet.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-[#ECE6DC] shadow-sm space-y-2"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#EDF3F7] text-[#5C7489] flex items-center justify-center font-bold text-xs">
                    0{idx + 1}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#14191F]">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#556473] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION E: HOW IT WORKS (4 STEPS - NUMBERED) */}
        <section className="py-14 sm:py-20 bg-white border-b border-[#ECE6DC]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                Alur Pemesanan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                Cara Kerja Pre-Order (4 Langkah)
              </h2>
              <p className="text-xs sm:text-sm text-[#556473]">
                Harap perhatikan: Langkah 2 adalah <strong>WAJIB</strong> setelah pembayaran dilakukan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STRAVA_PRODUCT_CONFIG.howItWorks.map((step) => (
                <div
                  key={step.step}
                  className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#14191F] text-white font-mono font-bold text-sm flex items-center justify-center">
                      {step.step}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#14191F] leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-[#556473] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E8E2D7]/70">
                    <span className="text-[10px] font-semibold text-[#5C7489] block">
                      ★ {step.highlight}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 max-w-2xl mx-auto">
              <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Ketentuan Produksi:</strong> Produksi mesin 3D print baru akan dimulai setelah Langkah 2 (Form data) terisi dan Anda menyetujui layout 3D yang dikirim admin di Langkah 3. Jika belum mengisi form, pesanan akan tetap menunggu data Anda.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION F: VARIATIONS (3 VARIATIONS ON SHOPEE) */}
        <section id="variations" className="py-14 sm:py-20 border-b border-[#ECE6DC]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                Pilihan Varian Resmi
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                Pilih Varian Sesuai Kebutuhanmu
              </h2>
              <p className="text-xs sm:text-sm text-[#556473]">
                Semua varian dibuat secara personal berdasarkan rute Strava kamu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {STRAVA_PRODUCT_CONFIG.variations.map((v) => (
                <div
                  key={v.id}
                  className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all ${
                    v.isPopular
                      ? 'bg-white border-[#5C7489] shadow-xl ring-2 ring-[#5C7489]/20 relative'
                      : 'bg-[#FAF8F5] border-[#E8E2D7] shadow-sm'
                  }`}
                >
                  <div className="space-y-4">
                    {v.badge && (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          v.isPopular
                            ? 'bg-[#5C7489] text-white'
                            : 'bg-[#EDF3F7] text-[#3E5161]'
                        }`}
                      >
                        {v.badge}
                      </span>
                    )}

                    <div>
                      <h3 className="text-lg font-black text-[#14191F] tracking-tight">
                        {v.name}
                      </h3>
                      <p className="text-xs text-[#556473] mt-1 leading-relaxed">
                        {v.shortDesc}
                      </p>
                    </div>

                    <div className="pt-2 pb-3 border-y border-[#ECE6DC]">
                      <span className="text-[10px] text-[#7A8B99] uppercase font-bold tracking-wider block">
                        Harga Pre-Order
                      </span>
                      <div className="text-2xl font-black text-[#14191F]">
                        {formatRupiah(v.price)}
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2 text-xs text-[#44505C]">
                      {v.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {v.emoneyNote && (
                      <p className="text-[10px] text-[#7A8B99] italic bg-white/60 p-2.5 rounded-xl border border-[#E8E2D7]">
                        * {v.emoneyNote}
                      </p>
                    )}

                    {v.todoNote && (
                      <p className="text-[10px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                        * {v.todoNote}
                      </p>
                    )}
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => handleOpenCheckout(v.id)}
                      className={`w-full py-3.5 rounded-2xl font-bold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 ${
                        v.isPopular
                          ? 'bg-[#14191F] hover:bg-[#5C7489] text-white'
                          : 'bg-white hover:bg-[#14191F] text-[#14191F] hover:text-white border border-[#DDD5C7]'
                      }`}
                    >
                      <span>Pilih & Pre-Order ({formatRupiah(v.price)})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION G: PRODUCTION QUEUE (LIVE ON LANDING PAGE) */}
        <section id="queue" className="py-14 sm:py-20 bg-white border-b border-[#ECE6DC]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                Live Transparency
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                Antrian Produksi Saat Ini
              </h2>
              <p className="text-xs sm:text-sm text-[#556473]">
                Pantau kapasitas mesin 3D print dan status pengerjaan pesanan secara terbuka.
              </p>
            </div>

            <ProductionQueueWidget />
          </div>
        </section>

        {/* SECTION H: FAQ */}
        <section id="faq" className="py-14 sm:py-20 border-b border-[#ECE6DC]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                Pertanyaan Umum
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {STRAVA_PRODUCT_CONFIG.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#ECE6DC] bg-white overflow-hidden shadow-xs transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-[#14191F] flex items-center justify-between gap-4"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#7A8B99] transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs text-[#556473] leading-relaxed border-t border-[#F0EBE3] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <a
                href={getWhatsAppAdminLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#5C7489] font-bold hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Punya pertanyaan lain? Tanya admin langsung via WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

        {/* SECTION I: REVIEWS / REAL SOCIAL PROOF ONLY */}
        <section className="py-14 sm:py-20 bg-[#F2EDE4]/50 border-b border-[#ECE6DC]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                Bukti Nyata & Reputasi
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                Social Proof & Real Traction
              </h2>
              <p className="text-xs text-[#556473]">
                Kami hanya menampilkan data riil dari Threads dan toko resmi Shopee WhereIsIt.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Viral Threads Post */}
              <div className="p-6 rounded-3xl bg-white border border-[#E8E2D7] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EDF3F7] text-[#3E5161]">
                    Viral di Threads
                  </span>
                  <span className="text-xs font-bold text-[#5C7489]">88.2K Views</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#14191F]">
                    Postingan Viral @jaynrrrrr
                  </h3>
                  <p className="text-xs text-[#556473] leading-relaxed">
                    Diposting tanggal 9 Nov 2026. Menampilkan bukti nyata tap di reader fare gate MRT Jakarta, lampu indikator hijau, dan model 3D Blender &ldquo;BDO ULTRA&rdquo;.
                  </p>
                </div>

                <a
                  href={STRAVA_PRODUCT_CONFIG.sourceOfTruth.threadsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C7489] hover:underline pt-2"
                >
                  <span>Lihat Postingan Asli Threads</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Card 2: Shopee Store 5.0 Rating */}
              <div className="p-6 rounded-3xl bg-white border border-[#E8E2D7] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                    Official Shopee Listing
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>5.0 / 5.0</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#14191F]">
                    WhereIsIt Studio (Shopee Official)
                  </h3>
                  <p className="text-xs text-[#556473] leading-relaxed">
                    Lokasi pengiriman: Workshop Kab. Karawang & Jakarta. Rating sempurna 5.0 bintang dari pembeli dengan status pre-order terpercaya.
                  </p>
                </div>

                <a
                  href={STRAVA_PRODUCT_CONFIG.sourceOfTruth.shopeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C7489] hover:underline pt-2"
                >
                  <span>Buka Listing Shopee Resmi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION J: FINAL CTA SECTION */}
        <section className="py-16 sm:py-24 bg-[#14191F] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#8BA1B4] font-bold">
              Pre-Order Your Milestone
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Rute Lari Kamu Terlalu Berharga untuk Sekadar Jadi Angka di Layar.
            </h2>
            <p className="text-xs sm:text-sm text-[#8E9FAA] max-w-xl mx-auto leading-relaxed">
              Jadikan personal best dan rute perjuanganmu sebagai gantungan kunci 3D nyata yang kamu bawa setiap hari saat tap di MRT atau membuka pintu rumah.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => handleOpenCheckout()}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#5C7489] hover:bg-[#6D879E] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Pre-Order Sekarang (Mulai Rp 119.000)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={getWhatsAppAdminLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Tanya Admin di WhatsApp</span>
              </a>
            </div>

            <div className="pt-4">
              <Link
                href="/track"
                className="text-xs text-[#8BA1B4] hover:text-white underline underline-offset-4"
              >
                Sudah pernah pesan? Lacak status pesanan kamu di sini
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* STICKY BOTTOM BAR ON MOBILE (390px PERFECT CONVERSION) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-[#ECE6DC] p-3 shadow-2xl flex items-center gap-2">
        <a
          href={getWhatsAppAdminLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-2xl bg-[#FAF8F5] text-[#14191F] border border-[#DDD5C7] flex items-center justify-center"
          title="Tanya Admin"
        >
          <MessageCircle className="w-5 h-5 text-emerald-600" />
        </a>

        <button
          onClick={() => handleOpenCheckout()}
          className="flex-1 py-3 px-4 rounded-2xl bg-[#14191F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Pre-Order (Rp 119rb)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Direct Mayar Checkout Modal */}
      <MayarCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        initialVariationId={selectedVariationId}
      />

      <Footer />
    </div>
  );
}
