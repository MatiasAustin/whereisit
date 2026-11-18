'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { StoreSettings } from '@/types';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import { BlurText, MagneticCta } from '@/components/motion/MotionPrimitives';

interface HeroProps {
  onGoToLineup: () => void;
  storeSettings?: StoreSettings;
}

export default function Hero({ onGoToLineup, storeSettings }: HeroProps) {
  const content = storeSettings?.homepageContent;
  const brandTagline =
    content?.heroStatement ||
    'Transforms personal data, achievements, and everyday routines into meaningful physical products. Personal data. Physical products. Meaningful experiences.';
  const headlineTag = content?.heroHeadlineTag || '3d design & objects studio';
  const headlineTitle = content?.heroHeadlineTitle || 'whereisit';
  const specLayer = content?.heroSpecLayer || '0.12mm Topografi 3D Timbul';
  const specMaterial = content?.heroSpecMaterial || '3D Print Custom Objects';
  const heroMainImage = content?.heroMainImage || '/images/strava-keychain/keychain-04.jpg';
  const heroMainLabel = content?.heroMainLabel || STRAVA_PRODUCT_CONFIG.name;
  const heroMainPrice = content?.heroMainPrice || 'Rp119.000';
  const heroMainLink = content?.heroMainLink || '/preorder/keychain-strava';
  const shortcut1Title = content?.heroShortcut1Title || '3 Varian Pre-Order';
  const shortcut1Image = content?.heroShortcut1Image || '/images/strava-keychain/keychain-05.jpg';
  const shortcut2Title = content?.heroShortcut2Title || 'Produk Segera Hadir';
  const shortcut2Image = content?.heroShortcut2Image || '/images/strava-keychain/keychain-06.jpg';

  return (
    <section className="relative pt-6 pb-16 md:pt-10 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Massive Editorial Header Typography */}
        <div className="relative border-b border-transparent">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
            <h1 className="text-[15vw] sm:text-[14vw] md:text-[12.5vw] font-black tracking-[-0.05em] leading-[0.88] text-[#14191F] select-none lowercase">
              {headlineTitle.includes('is') ? (
                <>
                  {headlineTitle.split('is')[0]}
                  <span className="text-[#5C7489]">is</span>
                  {headlineTitle.split('is')[1]}
                </>
              ) : (
                <BlurText text={headlineTitle} />
              )}
            </h1>
            <span className="text-sm sm:text-base md:text-lg font-medium text-[#5C7489] tracking-wider uppercase sm:self-end sm:mb-4 sm:ml-4">
              {headlineTag}
            </span>
          </div>
        </div>

        {/* Central Composition */}
        <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          {/* Left Column: Brand Statement & Primary Keychain CTA */}
          <div className="lg:col-span-4 z-10 flex flex-col justify-center space-y-6">
            <p className="text-base sm:text-lg text-[#44505C] leading-relaxed font-normal max-w-sm">
              {brandTagline}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <MagneticCta>
                <Link
                  href="/preorder/keychain-strava"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#14191F] text-[#F8F6F1] font-medium text-sm hover:bg-[#5C7489] hover:shadow-lg transition-all duration-200"
                >
                  <span>Pre-Order Keychain Strava</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticCta>

              <Link
                href="/track"
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#ECE6DC] text-[#14191F] font-medium text-sm hover:bg-[#DFD8CC] transition-colors"
              >
                <Search className="w-4 h-4 text-[#5C7489]" />
                <span>Lacak Pesanan</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#556473] uppercase tracking-wider font-medium">
              <div>• {specLayer}</div>
              <div>• {specMaterial}</div>
            </div>
          </div>

          {/* Center Column: Primary Buyable Product Visual (Keychain Shot #1: keychain-04.jpg) */}
          <div className="lg:col-span-5 relative flex items-center justify-center py-4 lg:py-0">
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#5C7489]/10 blur-3xl -z-10 pointer-events-none"></div>

            <Link
              href={heroMainLink}
              className="relative w-full max-w-md sm:max-w-lg aspect-square group block"
              aria-label={`Lihat ${heroMainLabel}`}
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02] bg-[#14191F]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroMainImage}
                  alt={heroMainLabel}
                  width={1024}
                  height={1024}
                  fetchPriority="high"
                  className="w-full h-full object-cover object-center"
                />

                <div className="absolute bottom-4 left-4 right-4 bg-[#14191F]/90 backdrop-blur-md text-white text-xs px-4 py-2.5 rounded-2xl font-medium flex items-center justify-between gap-2 border border-white/10 shadow-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#5C7489] flex-shrink-0"></span>
                    <span className="font-semibold truncate">{heroMainLabel}</span>
                  </div>
                  <span className="text-[#8BA1B4] font-mono flex-shrink-0">{heroMainPrice}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right Column: Shortcut Cards (Unique Shots keychain-05.jpg & keychain-06.jpg) */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col gap-4 sm:gap-6 justify-center">
            <Link
              href="/preorder/keychain-strava#variations"
              className="flex-1 group relative block text-left bg-[#14191F] rounded-2xl overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1 shadow-md border border-[#232D37]"
            >
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shortcut1Image}
                  alt={shortcut1Title}
                  width={1024}
                  height={1024}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center justify-between px-1.5 pb-1">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  {shortcut1Title}
                </span>
                <span className="text-white group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onGoToLineup}
              className="flex-1 group relative block text-left bg-[#14191F] rounded-2xl overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1 shadow-md border border-[#232D37]"
            >
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shortcut2Image}
                  alt={shortcut2Title}
                  width={1023}
                  height={1023}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center justify-between px-1.5 pb-1">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  {shortcut2Title}
                </span>
                <span className="text-white group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
