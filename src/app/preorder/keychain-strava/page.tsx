'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import StravaGallery from '@/components/strava/StravaGallery';
import ProductionQueueWidget from '@/components/strava/ProductionQueueWidget';
import MayarCheckoutModal from '@/components/strava/MayarCheckoutModal';
import { STRAVA_PRODUCT_CONFIG, getWhatsAppAdminLink } from '@/data/stravaKeychainConfig';
import { StravaMediaConfig } from '@/types';
import { formatRupiah } from '@/lib/utils';
import {
  BlurFade,
  BlurText,
  MagneticCta,
  NumberTicker,
  StudioTiltCard,
} from '@/components/motion/MotionPrimitives';
import {
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Star,
  Flame,
} from 'lucide-react';

export default function StravaKeychainLandingPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedVariationId, setSelectedVariationId] = useState<string | undefined>(undefined);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [adminLeadNote, setAdminLeadNote] = useState<string>(
    '5-7 hari kerja sejak desain dikonfirmasi'
  );
  const [mediaConfig, setMediaConfig] = useState<StravaMediaConfig | null>(null);

  useEffect(() => {
    // 1. Instant hydration from client storage to prevent image flicker on refresh
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('whereisit_strava_media_override');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            setMediaConfig(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('Could not read cached strava media override:', e);
    }

    fetch(`/api/strava-orders/queue?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.stats?.customNote) {
          setAdminLeadNote(data.data.stats.customNote);
        }
      })
      .catch(() => {});

    fetch(`/api/strava-media?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setMediaConfig(data.data);
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('whereisit_strava_media_override', JSON.stringify(data.data));
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenCheckout = (varId?: string) => {
    setSelectedVariationId(varId);
    setCheckoutOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const dynamicVariations = (
    mediaConfig?.customVariations && mediaConfig.customVariations.length > 0
      ? mediaConfig.customVariations
      : STRAVA_PRODUCT_CONFIG.variations
  ).map((v) => ({
    ...v,
    price: mediaConfig?.variationPrices?.[v.id] ?? v.price,
    image: mediaConfig?.variationImages?.[v.id] ?? v.image,
  }));
  const minDynamicPrice = dynamicVariations.length > 0 ? Math.min(...dynamicVariations.map((v) => v.price)) : 119000;
  const maxDynamicPrice = dynamicVariations.length > 0 ? Math.max(...dynamicVariations.map((v) => v.price)) : 220000;
  const dynamicPriceRange = `${formatRupiah(minDynamicPrice)} – ${formatRupiah(maxDynamicPrice)}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1] text-[#14191F] pb-20 sm:pb-0">
      <Navbar />

      <main className="flex-grow">
        {/* SECTION A: HERO SECTION */}
        <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden border-b border-[#ECE6DC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Status & Proof Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#5C7489] text-white">
                {STRAVA_PRODUCT_CONFIG.badge}
              </span>

              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EDF3F7] text-[#3E5161] border border-[#C5D5E2] flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-[#5C7489]" aria-hidden="true" />
                <span>Viral di Threads (88.2K Views)</span>
              </span>

              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white text-[#44505C] border border-[#DDD5C7] flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span>Rating Studio {STRAVA_PRODUCT_CONFIG.sourceOfTruth.studioRating} ★</span>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Product Title, Hook & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-bold text-[#5C7489] tracking-wide">
                    {STRAVA_PRODUCT_CONFIG.name}
                  </p>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#14191F] tracking-tight leading-[1.06]">
                    <BlurText text={STRAVA_PRODUCT_CONFIG.hook} />
                  </h1>
                </div>

                <p className="text-sm sm:text-base text-[#44505C] leading-relaxed max-w-xl">
                  Gantungan kunci 3D print dari rute Strava kamu sendiri, lengkap dengan peta rute, jarak, pace, dan waktu tempuh. Cocok untuk kenang-kenangan race, PB pertama, atau bukti kamu pernah lari sejauh itu. Tersedia varian yang bisa difungsikan sebagai e-money &amp; Flazz.
                </p>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-white border border-[#E8E2D7] inline-block shadow-sm">
                  <span className="text-[11px] uppercase font-bold text-[#556473] tracking-wider block">
                    Rentang Harga Pre-Order
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight mt-0.5">
                    {dynamicPriceRange}
                  </div>
                  <span className="text-[11px] text-[#3E5161] font-medium block mt-0.5">
                    3 Varian Resmi • {STRAVA_PRODUCT_CONFIG.shippingPolicyText}
                  </span>
                  <span className="text-[11px] text-[#556473] block">
                    Estimasi produksi: {adminLeadNote}
                  </span>
                </div>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <MagneticCta className="w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout()}
                      className="w-full sm:w-auto min-h-[48px] px-8 py-4 rounded-full bg-[#14191F] hover:bg-[#5C7489] text-[#F8F6F1] font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Pre-Order Sekarang</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </MagneticCta>

                  <a
                    href={getWhatsAppAdminLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[48px] px-6 py-4 rounded-full bg-white hover:bg-[#FAF8F5] text-[#14191F] font-bold text-sm border border-[#DDD5C7] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <span>Tanya Admin di WhatsApp</span>
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#556473] pt-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#5C7489]" aria-hidden="true" />
                    <span>Pre-Order Resmi Studio (Batch 2)</span>
                  </span>
                  <span>•</span>
                  <span>Bukan Ready Stock</span>
                  <span>•</span>
                  <span>Seller Kab. Karawang</span>
                </div>
              </div>

              {/* Right Column: Hero Product Visual Showcase (Shot 1: keychain-04.jpg) */}
              <div className="lg:col-span-5">
                <div className="relative p-5 sm:p-7 rounded-3xl bg-[#14191F] text-white border border-[#26333E] shadow-2xl overflow-hidden space-y-4">
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8BA1B4]">
                      STRAVA X whereIsIt?
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-[#5C7489] text-white">
                      Ukuran 5.7x9.4 cm
                    </span>
                  </div>

                  <div className="relative z-10 aspect-square rounded-2xl overflow-hidden bg-[#182027] border border-[#26333E] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaConfig?.heroImage || '/images/strava-keychain/keychain-04.jpg'}
                      alt={STRAVA_PRODUCT_CONFIG.name}
                      width={1024}
                      height={1024}
                      fetchPriority="high"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="relative z-10 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-[#D5E1E9] flex items-center justify-between gap-2">
                    <span>Opsi Varian E-Money:</span>
                    <span className="font-bold text-[#8BA1B4]">Konfirmasi saat review desain</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION B: PHOTO & VIDEO GALLERY */}
        <section className="py-14 sm:py-20 border-b border-[#ECE6DC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <BlurFade>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                    Galeri Produk &amp; Bukti Nyata
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                    Foto Asli Produk &amp; Video Bukti Threads
                  </h2>
                  <p className="text-xs sm:text-sm text-[#556473]">
                    Foto asli produk resmi studio dan slot bukti video dari postingan Threads @jaynrrrrr.
                  </p>
                </div>

                <div className="text-xs text-[#556473] flex items-center gap-2">
                  <span>Workshop:</span>
                  <span className="font-bold text-[#3E5161]">
                    Kab. Karawang &amp; Jakarta
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <StravaGallery items={mediaConfig?.gallery} />
              </div>
            </BlurFade>
          </div>
        </section>

        {/* SECTION C: THE STORY (PIXAR-STYLE) */}
        <section className="py-14 sm:py-20 bg-[#F2EDE4]/60 border-b border-[#ECE6DC]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <BlurFade>
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                  Cerita di Balik Produk
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                  Mengapa Rute Lari Kamu Layak Diabadikan?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {STRAVA_PRODUCT_CONFIG.story.map((item, index) => (
                  <div
                    key={item.phase}
                    className="p-6 rounded-3xl bg-white border border-[#E8E2D7] shadow-sm space-y-3"
                  >
                    <span className="text-[10px] font-mono uppercase font-bold text-[#3E5161] tracking-wider px-2.5 py-1 rounded-full bg-[#EDF3F7] inline-block">
                      0{index + 1} / {item.phase}
                    </span>
                    <h3 className="text-base font-bold text-[#14191F]">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-[#44505C] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </BlurFade>
          </div>
        </section>

        {/* SECTION D: WHAT YOU GET */}
        <section className="py-14 sm:py-20 border-b border-[#ECE6DC]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <BlurFade>
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                  Kelengkapan Paket
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                  Yang Kamu Dapatkan
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {STRAVA_PRODUCT_CONFIG.whatYouGet.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-[#ECE6DC] shadow-sm space-y-2"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#EDF3F7] text-[#3E5161] flex items-center justify-center font-bold text-xs">
                      0{idx + 1}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#14191F]">{item.title}</h3>
                    <p className="text-xs text-[#44505C] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </BlurFade>
          </div>
        </section>

        {/* SECTION E: HOW IT WORKS (4 STEPS - NUMBERED) */}
        <section className="py-14 sm:py-20 bg-white border-b border-[#ECE6DC]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <BlurFade>
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                  Alur Pemesanan
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                  Cara Kerja Pre-Order (4 Langkah)
                </h2>
                <p className="text-xs sm:text-sm text-[#44505C]">
                  Langkah 2 adalah <strong>WAJIB</strong> setelah pembayaran, dan produksi dimulai hanya setelah desain dikonfirmasi di Langkah 3.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
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
                      <p className="text-xs text-[#44505C] leading-relaxed">{step.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-[#E8E2D7]/70">
                      <span className="text-[11px] font-semibold text-[#3E5161] block">
                        {step.highlight}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-3xl mx-auto">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong>Ketentuan Penting:</strong> Produksi baru dimulai setelah form data Strava terisi dan kamu menyetujui preview desain 3D bersama admin via WhatsApp.
                  </div>
                </div>
                <a
                  href={getWhatsAppAdminLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-950 font-bold text-xs whitespace-nowrap flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span>Tanya Admin</span>
                </a>
              </div>
            </BlurFade>
          </div>
        </section>

        {/* SECTION F: VARIATIONS (2 VARIATIONS: EMONEY & FLAZZ) */}
        <section id="variations" className="py-14 sm:py-20 border-b border-[#ECE6DC]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <BlurFade>
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                  Pilihan Variasi Keychain
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                  Pilih Varian Keychain Kamu
                </h2>
                <p className="text-xs sm:text-sm text-[#44505C]">
                  {STRAVA_PRODUCT_CONFIG.shippingPolicyText}. Seluruh varian dibuat berdasarkan rute Strava pribadimu.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mt-8 max-w-6xl mx-auto">
                {dynamicVariations.map((v) => (
                  <StudioTiltCard key={v.id} className="h-full">
                    <div
                      className={`h-full p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all ${
                        v.isPopular
                          ? 'bg-white border-[#5C7489] shadow-xl ring-2 ring-[#5C7489]/20'
                          : 'bg-[#FAF8F5] border-[#E8E2D7] shadow-sm'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Distinct variation photo (auto-compressed & admin editable) */}
                        {(mediaConfig?.variationImages?.[v.id] || v.image) && (
                          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#14191F] border border-[#E8E2D7]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={mediaConfig?.variationImages?.[v.id] || v.image}
                              alt={`${STRAVA_PRODUCT_CONFIG.name} - ${v.name}`}
                              width={512}
                              height={512}
                              className="w-full h-full object-cover object-center"
                            />
                          </div>
                        )}

                        {v.badge && (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              v.isPopular ? 'bg-[#5C7489] text-white' : 'bg-[#EDF3F7] text-[#3E5161]'
                            }`}
                          >
                            {v.badge}
                          </span>
                        )}

                        <div>
                          <h3 className="text-lg font-black text-[#14191F] tracking-tight">
                            {v.name}
                          </h3>
                          <p className="text-xs text-[#44505C] mt-1 leading-relaxed">{v.shortDesc}</p>
                        </div>

                        <div className="pt-2 pb-3 border-y border-[#ECE6DC]">
                          <span className="text-[10px] text-[#556473] uppercase font-bold tracking-wider block">
                            Harga Pre-Order
                          </span>
                          <div className="text-2xl font-black text-[#14191F]">
                            {formatRupiah(mediaConfig?.variationPrices?.[v.id] ?? v.price)}
                          </div>
                        </div>

                        <ul className="space-y-2 text-xs text-[#44505C]">
                          {v.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2
                                className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5"
                                aria-hidden="true"
                              />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>

                        {v.emoneyNote && (
                          <p className="text-[11px] text-[#3E5161] bg-[#EDF3F7]/70 p-2.5 rounded-xl border border-[#C5D5E2]">
                            * {v.emoneyNote}
                          </p>
                        )}
                      </div>

                      <div className="pt-6">
                        <button
                          type="button"
                          onClick={() => handleOpenCheckout(v.id)}
                          className={`w-full min-h-[44px] py-3.5 rounded-2xl font-bold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 ${
                            v.isPopular
                              ? 'bg-[#14191F] hover:bg-[#5C7489] text-white'
                              : 'bg-white hover:bg-[#14191F] text-[#14191F] hover:text-white border border-[#DDD5C7]'
                          }`}
                        >
                          <span>Pilih {v.name} ({formatRupiah(mediaConfig?.variationPrices?.[v.id] ?? v.price)})</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </StudioTiltCard>
                ))}
              </div>
            </BlurFade>
          </div>
        </section>

        {/* SECTION G: PRODUCTION QUEUE (LIVE ON LANDING PAGE) */}
        <section id="queue" className="py-14 sm:py-20 bg-white border-b border-[#ECE6DC]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <BlurFade>
              <div className="text-center space-y-2 mb-6">
                <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                  Live Transparency
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                  Antrian Produksi Saat Ini
                </h2>
                <p className="text-xs sm:text-sm text-[#44505C]">
                  Pantau kapasitas produksi dan estimasi pengerjaan langsung dari pengaturan admin.
                </p>
              </div>

              <ProductionQueueWidget />
            </BlurFade>
          </div>
        </section>

        {/* SECTION H: FAQ */}
        <section id="faq" className="py-14 sm:py-20 border-b border-[#ECE6DC]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <BlurFade>
              <div className="text-center space-y-2 mb-8">
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
                        type="button"
                        onClick={() => toggleFaq(idx)}
                        aria-expanded={isOpen}
                        className="w-full min-h-[48px] p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-[#14191F] flex items-center justify-between gap-4"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#556473] flex-shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs text-[#44505C] leading-relaxed border-t border-[#F0EBE3] pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-6">
                <a
                  href={getWhatsAppAdminLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-4 text-xs text-[#3E5161] font-bold hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span>Punya pertanyaan lain? Tanya admin via WhatsApp</span>
                </a>
              </div>
            </BlurFade>
          </div>
        </section>

        {/* SECTION I: REAL SOCIAL PROOF ONLY */}
        <section className="py-14 sm:py-20 bg-[#F2EDE4]/50 border-b border-[#ECE6DC]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <BlurFade>
              <div className="text-center space-y-2 mb-8">
                <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                  Bukti Nyata
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
                  Rekam Jejak &amp; Ulasan Studio
                </h2>
                <p className="text-xs text-[#44505C]">
                  Hanya menampilkan tautan dan angka nyata dari Threads dan WhereIsIt Studio.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: Viral Threads Post */}
                <div className="p-6 rounded-3xl bg-white border border-[#E8E2D7] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EDF3F7] text-[#3E5161]">
                      Postingan Threads
                    </span>
                    <span className="text-xs font-bold text-[#3E5161]">
                      88.2K views
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-[#14191F]">
                      Postingan @jaynrrrrr (9 Nov 2026)
                    </h3>
                    <p className="text-xs text-[#44505C] leading-relaxed">
                      Mendapat <strong>~1.9K likes</strong>, <strong>108 komentar</strong>, <strong>114 repost</strong>, dan <strong>542 shares</strong>. Menampilkan bukti tap di reader gate MRT Jakarta (lampu hijau &amp; saldo muncul) serta preview 3D model &ldquo;BDO ULTRA&rdquo;.
                    </p>
                    <p className="text-[11px] text-[#556473]">
                      Kontak resmi studio: @whereisit.ofc
                    </p>
                  </div>

                  <a
                    href={STRAVA_PRODUCT_CONFIG.sourceOfTruth.threadsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3E5161] hover:underline pt-2"
                  >
                    <span>Lihat Postingan Threads @jaynrrrrr</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>

                {/* Card 2: Studio Quality & 5.0 Rating */}
                <div className="p-6 rounded-3xl bg-white border border-[#E8E2D7] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
                      Standar Studio WhereIsIt
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span>5.0 / 5.0</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-[#14191F]">
                      WhereIsIt? Studio (Kab. Karawang &amp; Jakarta)
                    </h3>
                    <p className="text-xs text-[#44505C] leading-relaxed">
                      Produk: <strong>{STRAVA_PRODUCT_CONFIG.name}</strong>. Status: <strong>{STRAVA_PRODUCT_CONFIG.shippingPolicyText}</strong>.
                    </p>
                    <p className="text-[11px] text-[#556473]">
                      Setiap gantungan kunci dibuat presisi menggunakan 3D print relief beresolusi tinggi, diintegrasikan dengan chip e-money/flazz aktif, serta lolos uji tap gate dan QC manual studio.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenCheckout()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3E5161] hover:underline pt-2"
                  >
                    <span>Pilih Varian &amp; Pre-Order Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        {/* SECTION J: FINAL CTA SECTION */}
        <section className="py-16 sm:py-24 bg-[#14191F] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#8BA1B4] font-bold">
              Pre-Order Keychain Strava
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Rute lari kamu, sekarang bisa dipegang.
            </h2>
            <p className="text-xs sm:text-sm text-[#D5E1E9] max-w-xl mx-auto leading-relaxed">
              Mulai dari Rp119.000 ({STRAVA_PRODUCT_CONFIG.priceRange}). {STRAVA_PRODUCT_CONFIG.shippingPolicyText}.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => handleOpenCheckout()}
                className="w-full sm:w-auto min-h-[48px] px-8 py-4 rounded-full bg-[#5C7489] hover:bg-[#6D879E] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Pre-Order Sekarang</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <a
                href={getWhatsAppAdminLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[48px] px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Tanya Admin di WhatsApp</span>
              </a>
            </div>

            <div className="pt-4">
              <Link
                href="/track"
                className="inline-flex items-center min-h-[44px] text-xs text-[#8BA1B4] hover:text-white underline underline-offset-4"
              >
                Sudah pernah pesan? Lacak status pesanan di /track
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* STICKY BOTTOM BAR ON MOBILE (390px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-[#ECE6DC] p-3 shadow-2xl flex items-center gap-2">
        <a
          href={getWhatsAppAdminLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[44px] min-h-[44px] p-3 rounded-2xl bg-[#FAF8F5] text-[#14191F] border border-[#DDD5C7] flex items-center justify-center"
          aria-label="Tanya Admin di WhatsApp"
        >
          <MessageCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
        </a>

        <button
          type="button"
          onClick={() => handleOpenCheckout()}
          className="flex-1 min-h-[44px] py-3 px-4 rounded-2xl bg-[#14191F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Pre-Order Sekarang (Rp119rb)</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Direct Mayar Checkout Modal */}
      <MayarCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        initialVariationId={selectedVariationId}
        variationPrices={mediaConfig?.variationPrices}
        variations={dynamicVariations}
      />

      <Footer />
    </div>
  );
}
