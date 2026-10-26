'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onGoToCatalog: () => void;
  onGoToCustom: () => void;
}

export default function Hero({ onGoToCatalog, onGoToCustom }: HeroProps) {
  return (
    <section className="relative pt-6 pb-20 md:pt-10 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Massive Editorial Header Typography (Image 1 reference) */}
        <div className="relative border-b border-transparent">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
            <h1 className="text-[15vw] sm:text-[14vw] md:text-[12.5vw] font-black tracking-[-0.05em] leading-[0.88] text-[#14191F] select-none lowercase">
              where<span className="text-[#5C7489]">is</span>it
            </h1>
            <span className="text-sm sm:text-base md:text-lg font-medium text-[#5C7489] tracking-wider uppercase sm:self-end sm:mb-4 sm:ml-4">
              3d design & objects studio
            </span>
          </div>
        </div>

        {/* Central Composition with Hero Visual, Narrative on Left, and Shortcut Cards on Right */}
        <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          
          {/* Left Column: Brand Statement & CTA */}
          <div className="lg:col-span-4 z-10 flex flex-col justify-center space-y-6">
            <p className="text-base sm:text-lg text-[#44505C] leading-relaxed font-normal max-w-sm">
              Bespoke 3D printed objects made for spaces that value quality, tactile texture, and thoughtful design. From human intention to final micro-layer — every piece is built to last and made to be lived with.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onGoToCatalog}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#14191F] text-[#F8F6F1] font-medium text-sm hover:bg-[#5C7489] hover:shadow-lg transition-all duration-200"
              >
                Go to catalog
              </button>
              
              <button
                onClick={onGoToCustom}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#ECE6DC] text-[#14191F] font-medium text-sm hover:bg-[#DFD8CC] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#5C7489]" />
                <span>Custom design</span>
              </button>
            </div>

            {/* Subtle Studio Credentials */}
            <div className="pt-4 flex items-center gap-6 text-xs text-[#7B8B9A] uppercase tracking-wider font-medium">
              <div>• 0.08mm - 0.16mm Precision</div>
              <div>• Bio-Composite Materials</div>
            </div>
          </div>

          {/* Center Column: Dominant Hero 3D Printed Object Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center py-4 lg:py-0">
            {/* Ambient soft glow backdrop */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#5C7489]/10 blur-3xl -z-10 pointer-events-none"></div>

            <div className="relative w-full max-w-md sm:max-w-lg aspect-square group">
              {/* Sculptural Product Visual */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=85"
                  alt="WhereIsIt Signature 3D Sculpted Chair"
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Floating pill badge */}
                <div className="absolute bottom-4 left-4 bg-[#14191F]/85 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full font-medium flex items-center gap-2 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#5C7489] animate-pulse"></span>
                  <span>Walnut Curve • Edition 01</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Shortcut Cards (Exact match to Image 1) */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col gap-4 sm:gap-6 justify-center">
            
            {/* Card 1: Ready to Buy */}
            <button
              onClick={onGoToCatalog}
              className="flex-1 group relative block text-left bg-[#14191F] rounded-2xl overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1 shadow-md border border-[#232D37]"
            >
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3">
                <Image
                  src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
                  alt="Ready to buy objects"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center justify-between px-1.5 pb-1">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  Ready to buy
                </span>
                <span className="text-white group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </button>

            {/* Card 2: Custom Order */}
            <button
              onClick={onGoToCustom}
              className="flex-1 group relative block text-left bg-[#14191F] rounded-2xl overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1 shadow-md border border-[#232D37]"
            >
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3">
                <Image
                  src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80"
                  alt="Custom order drafting"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center justify-between px-1.5 pb-1">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  Custom order
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
