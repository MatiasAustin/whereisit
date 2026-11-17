'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { COMING_SOON_HIGHLIGHTS, COMING_SOON_LINEUP } from '@/data/stravaKeychainConfig';
import ComingSoonNotifyForm from '@/components/strava/ComingSoonNotifyForm';
import { BlurFade, StudioTiltCard } from '@/components/motion/MotionPrimitives';
import { ArrowRight, Bell, X } from 'lucide-react';

export default function ComingSoonLineupSection() {
  const [notifyTargetProduct, setNotifyTargetProduct] = useState<string | null>(null);

  return (
    <section id="lineup" className="py-16 md:py-24 bg-[#FAF8F5] border-t border-[#ECE6DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Part 1: Two Featured Coming Soon Products (with Dedicated Teaser Pages) */}
        <BlurFade>
          <div className="space-y-8">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs uppercase tracking-widest font-bold text-[#5C7489]">
                Upcoming Releases (Coming Soon Only)
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#14191F] tracking-tight">
                Produk Berikutnya Sedang Dikembangkan
              </h2>
              <p className="text-xs sm:text-sm text-[#556473] leading-relaxed">
                Saat ini hanya Keychain Strava yang dapat dipesan. Dua produk di bawah ini masih dalam pengembangan dan belum tersedia untuk pembelian atau pemesanan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {COMING_SOON_HIGHLIGHTS.map((item) => (
                <StudioTiltCard key={item.id}>
                  <div className="h-full p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D7] shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      {/* Concept Image Preview */}
                      {item.image && (
                        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#14191F] border border-[#E8E2D7] group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#14191F]/80 backdrop-blur-md text-white border border-white/10">
                              {item.badge}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EDF3F7] text-[#3E5161] border border-[#C5D5E2]">
                          {item.badge}
                        </span>
                        <span className="text-[11px] font-medium text-[#556473]">
                          {item.statusLabel}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-[#14191F] tracking-tight">
                        {item.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#44505C] leading-relaxed">
                        {item.hook}
                      </p>

                      <p className="text-xs text-[#556473] leading-relaxed pt-2 border-t border-[#F0EBE3]">
                        {item.whatItIs}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setNotifyTargetProduct(item.notifyProductKey)}
                        className="min-h-[44px] flex-1 px-5 py-3 rounded-2xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Kabari saya saat ready</span>
                      </button>

                      <Link
                        href={item.slug}
                        className="min-h-[44px] px-5 py-3 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2EDE4] text-[#14191F] border border-[#DDD5C7] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Lihat Teaser</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </StudioTiltCard>
              ))}
            </div>
          </div>
        </BlurFade>

        {/* Part 2: "Segera Hadir" 6-Item Lineup List ONLY (No dedicated page, no price, no order button) */}
        <BlurFade delay={0.08}>
          <div className="space-y-6 pt-8 border-t border-[#ECE6DC]">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-bold text-[#5C7489]">
                Eksplorasi Studio
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#14191F] tracking-tight">
                Segera Hadir
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMING_SOON_LINEUP.map((prod) => (
                <div
                  key={prod.id}
                  className="p-5 rounded-2xl bg-white border border-[#E8E2D7] flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#14191F] leading-snug">
                        {prod.name}
                      </h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          prod.isExperimental
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-[#EDF3F7] text-[#3E5161]'
                        }`}
                      >
                        {prod.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#556473] leading-relaxed">
                      {prod.concept}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotifyTargetProduct(prod.notifyProductKey)}
                    className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#14191F] text-[#14191F] hover:text-white border border-[#DDD5C7] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Kabari saya</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </BlurFade>
      </div>

      {/* Notify Signup Modal */}
      {notifyTargetProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setNotifyTargetProduct(null)}
        >
          <div
            className="relative w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setNotifyTargetProduct(null)}
              aria-label="Tutup Form Notifikasi"
              className="absolute top-4 right-4 z-10 min-w-[44px] min-h-[44px] rounded-full bg-[#FAF8F5] hover:bg-[#ECE6DC] text-[#14191F] flex items-center justify-center shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
            <ComingSoonNotifyForm
              defaultProduct={notifyTargetProduct}
              showSecondaryKeychainCta
            />
          </div>
        </div>
      )}
    </section>
  );
}
