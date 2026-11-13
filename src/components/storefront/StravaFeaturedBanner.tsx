'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Flame, Star, ShieldCheck } from 'lucide-react';

export default function StravaFeaturedBanner() {
  return (
    <section className="py-6 sm:py-8 bg-[#F8F6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#182027] via-[#212B35] to-[#14191F] text-white p-6 sm:p-10 border border-[#26333E] shadow-xl overflow-hidden">
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none editorial-grid"></div>

          {/* Ambient soft glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#5C7489]/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#5C7489] text-white">
                  Pre-Order Release
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#26333E] text-[#8BA1B4] border border-[#3E5161] flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-[#8BA1B4]" />
                  <span>Viral di Threads (88.2K Views)</span>
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#26333E] text-amber-300 border border-[#3E5161] flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>Shopee 5.0</span>
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase font-mono tracking-widest text-[#8BA1B4]">
                  Bespoke 3D Running Memorabilia
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  &ldquo;Rute lari kamu, sekarang bisa dipegang.&rdquo;
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#8E9FAA] leading-relaxed max-w-xl">
                Keychain 3D custom dari kontur rute Strava kamu sendiri + data jarak, pace, & durasi. Terintegrasi fungsi e-money untuk tap di gerbang MRT & KRL.
              </p>

              <div className="flex items-center gap-4 text-xs text-[#8E9FAA] pt-1">
                <span>Mulai Rp 119.000</span>
                <span>•</span>
                <span>3 Variasi Resmi</span>
                <span>•</span>
                <span>Pre-Order 5–7 Hari Kerja</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
              <Link
                href="/preorder/keychain-strava"
                className="px-8 py-4 rounded-full bg-[#5C7489] hover:bg-[#6D879E] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Lihat & Pre-Order Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/track"
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-colors flex items-center justify-center gap-2"
              >
                <span>Lacak Pesanan (Track PO)</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
