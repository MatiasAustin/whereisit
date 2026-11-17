'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Star } from 'lucide-react';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import { BlurFade, MagneticCta, NumberTicker } from '@/components/motion/MotionPrimitives';
import { formatRupiah } from '@/lib/utils';

export default function StravaFeaturedBanner() {
  return (
    <section className="py-6 sm:py-8 bg-[#F8F6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade>
          <div className="relative rounded-3xl bg-[#182027] text-white p-6 sm:p-10 border border-[#26333E] shadow-xl overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#5C7489] text-white">
                    {STRAVA_PRODUCT_CONFIG.badge}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#26333E] text-[#D5E1E9] border border-[#3E5161] flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-[#8BA1B4]" />
                    <span>
                      Viral di Threads (<NumberTicker value={88.2} decimals={1} suffix="K" /> Views)
                    </span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#26333E] text-amber-300 border border-[#3E5161] flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Shopee {STRAVA_PRODUCT_CONFIG.sourceOfTruth.shopeeRating}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#8BA1B4]">
                    {STRAVA_PRODUCT_CONFIG.name}
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                    &ldquo;{STRAVA_PRODUCT_CONFIG.hook}&rdquo;
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-[#D5E1E9] leading-relaxed max-w-xl">
                  {STRAVA_PRODUCT_CONFIG.descriptionId}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {STRAVA_PRODUCT_CONFIG.variations.map((v) => (
                    <span
                      key={v.id}
                      className="px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-[11px] font-semibold text-[#D5E1E9]"
                    >
                      {v.name} ({formatRupiah(v.price)})
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#8E9FAA] pt-1">
                  <span>{STRAVA_PRODUCT_CONFIG.priceRange}</span>
                  <span>•</span>
                  <span>{STRAVA_PRODUCT_CONFIG.shippingPolicyText}</span>
                </div>
              </div>

              {/* Action CTAs (No duplicate image thumbnails) */}
              <div className="flex flex-col gap-3 w-full sm:w-auto flex-shrink-0">
                <MagneticCta>
                  <Link
                    href="/preorder/keychain-strava"
                    className="w-full min-h-[44px] px-8 py-3.5 rounded-full bg-[#5C7489] hover:bg-[#6D879E] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span>Pre-Order Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </MagneticCta>

                <Link
                  href="/track"
                  className="min-h-[44px] px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Lacak Pesanan (Track PO)</span>
                </Link>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
