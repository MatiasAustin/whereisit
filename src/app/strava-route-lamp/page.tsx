'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ComingSoonNotifyForm from '@/components/strava/ComingSoonNotifyForm';
import { BlurFade, BlurText } from '@/components/motion/MotionPrimitives';
import { COMING_SOON_HIGHLIGHTS } from '@/data/stravaKeychainConfig';
import { Layers, Lightbulb, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';

export default function StravaRouteLampComingSoonPage() {
  const lampInfo = COMING_SOON_HIGHLIGHTS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1] text-[#14191F]">
      <Navbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="py-12 sm:py-20 border-b border-[#ECE6DC]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <BlurFade>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#5C7489] text-white">
                    Coming Soon
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EDF3F7] text-[#3E5161] border border-[#C5D5E2]">
                    Belum Bisa Dipesan
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-[#14191F] tracking-tight leading-[1.08]">
                  <BlurText text={lampInfo.name} />
                </h1>

                <p className="text-base sm:text-lg text-[#44505C] leading-relaxed max-w-3xl">
                  {lampInfo.hook}
                </p>
              </div>
            </BlurFade>

            {/* Specification Card (No Price, Static Hardware Only) */}
            <BlurFade delay={0.08}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D7] shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C7489]">
                      <Lightbulb className="w-4 h-4" />
                      <span>Konsep & Spesifikasi Objek</span>
                    </div>
                    <p className="text-sm text-[#44505C] leading-relaxed">
                      {lampInfo.whatItIs}
                    </p>
                    <div className="pt-3 border-t border-[#F0EBE3] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7]">
                        <span className="text-[10px] font-bold uppercase text-[#7A8B99] block">Material Rute</span>
                        <span className="font-semibold text-[#14191F]">Acrylic Laser-Engraved + LED</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7]">
                        <span className="text-[10px] font-bold uppercase text-[#7A8B99] block">Dudukan (Base)</span>
                        <span className="font-semibold text-[#14191F]">3D-Printed Architectural Base (Statis)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F0EBE3] text-xs text-[#556473] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#5C7489] flex-shrink-0" />
                    <span>Tanpa layar LCD, tanpa Wi-Fi, fokus pada data pencapaian statis yang abadi di ruanganmu.</span>
                  </div>
                </div>

                <div className="md:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#14191F] text-white border border-[#26333E] space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8BA1B4]">
                      <Trophy className="w-4 h-4" />
                      <span>Use Case Utama</span>
                    </div>
                    <ul className="space-y-3 text-xs sm:text-sm text-[#D5E1E9]">
                      {lampInfo.useCases.map((uc, idx) => (
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
                    <span className="text-[11px] text-[#8E9FAA] block mb-2">
                      Status rilis & harga resmi belum dibuka.
                    </span>
                    <Link
                      href="/preorder/keychain-strava"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#8BA1B4] hover:text-white transition-colors"
                    >
                      <span>Lihat Keychain Strava yang sudah siap Pre-Order</span>
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
                defaultProduct={lampInfo.notifyProductKey}
                waMessage={lampInfo.waMessage}
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
