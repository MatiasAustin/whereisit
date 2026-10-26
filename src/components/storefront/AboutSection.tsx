'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Compass, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-[#F8F6F1] border-t border-[#ECE6DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header (Image 1 reference) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#5C7489] mb-2 block">
              01/ Philosophy & Context
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#14191F] tracking-tight leading-tight">
              Thoughtful objects <br />
              <span className="font-bold text-[#14191F]">for intentional living</span>
            </h2>
          </div>
          
          <div className="mt-4 md:mt-0 text-sm font-medium text-[#7A8B99]">
            WhereIsIt Studio • Jakarta / Bespoke Lab
          </div>
        </div>

        {/* Two-Column Visual & Narrative Grid (Image 1 layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card 1 (Wide): Studio Ambience (The Where Is It? store with blue arches & curved counters!) */}
          <div className="lg:col-span-7 group">
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-lg border border-[#E2DDD4]">
              <Image
                src="/images/whereisit-store.jpg"
                alt="WhereIsIt Design Studio & Flagship Showroom"
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#D5E1E9] font-medium">Showroom & Experience</p>
                  <p className="text-lg font-semibold tracking-tight">WhereIsIt Studio Lab</p>
                </div>
                <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  Open for Consultation
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#7A8B99] italic">
              WhereIsIt flagship space: dusty slate blue arches, warm lighting, and physical character display alcoves.
            </p>
          </div>

          {/* Card 2 (Narrower): Craft Detail & Mission Statement */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Texture Detail Card */}
            <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-md border border-[#E2DDD4]">
              <Image
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
                alt="Tactile 3D printing micro-layer details"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4 bg-[#14191F]/80 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-full font-mono">
                layer: 0.12mm · continuous
              </div>
            </div>

            {/* Editorial Copy */}
            <div className="space-y-4">
              <p className="text-base text-[#44505C] leading-relaxed">
                We create objects with thoughtful architecture, clean lines, and relentless attention to detail — for those who choose not just interior objects, but a calm quality of life.
              </p>
              <p className="text-sm text-[#667584] leading-relaxed">
                WhereIsIt is never a generic print service. We are an industrial design studio that first understands your spatial problem, functional purpose, and tactile context. We shape every contour before a single filament is extruded.
              </p>

              {/* Pillars list */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#5C7489]/10 text-[#5C7489] mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#14191F]">Purpose Driven</h4>
                    <p className="text-[11px] text-[#7A8B99]">Designed for real ergonomics & daily use</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#5C7489]/10 text-[#5C7489] mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#14191F]">Satin Finish</h4>
                    <p className="text-[11px] text-[#7A8B99]">Hand buffed to eliminate raw print lines</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="#custom-design"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#14191F] hover:text-[#5C7489] transition-colors group"
                >
                  <span>More about our design process</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
