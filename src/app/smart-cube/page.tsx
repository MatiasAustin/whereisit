'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ComingSoonNotifyForm from '@/components/strava/ComingSoonNotifyForm';
import { BlurFade, BlurText } from '@/components/motion/MotionPrimitives';
import { COMING_SOON_HIGHLIGHTS } from '@/data/stravaKeychainConfig';
import { Box, Activity, Clock, ArrowRight } from 'lucide-react';

export default function SmartCubeComingSoonPage() {
  const cubeInfo = COMING_SOON_HIGHLIGHTS[1];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1] text-[#14191F]">
      <Navbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="py-12 sm:py-20 border-b border-[#ECE6DC]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <BlurFade>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Column: Headline, Badges, Hook */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#14191F] text-white">
                      Coming Soon
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Dalam pengembangan, belum bisa dipesan
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#FAF8F5] text-[#556473] border border-[#DDD5C7]">
                      Tahap R&amp;D Studio
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black text-[#14191F] tracking-tight leading-[1.08]">
                    <BlurText text={cubeInfo.name} />
                  </h1>

                  <p className="text-base sm:text-lg text-[#44505C] leading-relaxed">
                    {cubeInfo.hook}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#556473] font-medium">
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E2D7]">
                      • Display 2.8&quot; IPS / E-Ink
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E2D7]">
                      • Sleep &amp; Workout Companion
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E2D7]">
                      • Circadian Ambient Lighting
                    </span>
                  </div>
                </div>

                {/* Right Column: Hero Concept Visual */}
                <div className="lg:col-span-5">
                  <div className="relative w-full aspect-[4/3] sm:aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-[#ECE6DC] bg-[#14191F] group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/coming-soon/smart-cube.jpg"
                      alt="Smart Cube Sleep Lamp Pro Concept"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 p-3 rounded-2xl bg-[#14191F]/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-between text-xs shadow-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span className="font-semibold text-[11px]">Sleep Lamp Pro &amp; Cube Companion</span>
                      </div>
                      <span className="text-[#8BA1B4] text-[10px] font-mono">Tahap R&amp;D Studio</span>
                    </div>
                  </div>
                </div>
              </div>
            </BlurFade>

            {/* Vision Cards (Copy Only — Not Built Yet) */}
            <BlurFade delay={0.08}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D7] shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C7489]">
                      <Box className="w-4 h-4" />
                      <span>Visi Produk (Tahap R&amp;D Studio)</span>
                    </div>
                    <p className="text-sm text-[#44505C] leading-relaxed">
                      {cubeInfo.whatItIs}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7]">
                        <span className="text-[10px] font-bold uppercase text-[#7A8B99] block">Konsep Bentuk</span>
                        <span className="font-semibold text-[#14191F]">Kubus Meja ~15x15x15 cm + Topografi 3D Atas</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7]">
                        <span className="text-[10px] font-bold uppercase text-[#7A8B99] block">Konsep Informasi</span>
                        <span className="font-semibold text-[#14191F]">Statistik Strava, Workout &amp; Sleep Reminder</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                    <strong>Catatan Transparansi:</strong> Halaman ini hanya memaparkan konsep visi produk yang sedang dieksplorasi oleh studio. Belum ada harga resmi dan belum dibuka pemesanan.
                  </div>
                </div>

                <div className="md:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#14191F] text-white border border-[#26333E] space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8BA1B4]">
                      <Activity className="w-4 h-4" />
                      <span>Arah Pengalaman Pengguna</span>
                    </div>
                    <ul className="space-y-3 text-xs sm:text-sm text-[#D5E1E9]">
                      {cubeInfo.useCases.map((uc, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#5C7489]/30 text-[#8BA1B4] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{uc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-[11px] text-[#8E9FAA] mb-2">
                      <Clock className="w-3.5 h-3.5 text-[#8BA1B4]" />
                      <span>Daftarkan nomor WhatsApp untuk mendapatkan kabar rilis.</span>
                    </div>
                    <Link
                      href="/preorder/keychain-strava"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#8BA1B4] hover:text-white transition-colors"
                    >
                      <span>Atau pre-order Keychain Strava sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        {/* Notify List Form Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <BlurFade delay={0.1}>
              <ComingSoonNotifyForm
                defaultProduct={cubeInfo.notifyProductKey}
                waMessage={cubeInfo.waMessage}
                showSecondaryKeychainCta
              />
            </BlurFade>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
