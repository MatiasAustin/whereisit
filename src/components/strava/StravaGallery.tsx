'use client';

import React, { useState } from 'react';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import { Play, Image as ImageIcon, Video, AlertCircle, Maximize2, Sparkles, ExternalLink } from 'lucide-react';

export default function StravaGallery() {
  const items = STRAVA_PRODUCT_CONFIG.gallery;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex];

  return (
    <div className="w-full space-y-4">
      {/* Main Showcase Stage */}
      <div className="relative aspect-4/3 sm:aspect-16/10 rounded-3xl bg-[#182027] overflow-hidden border border-[#26333E] shadow-lg flex flex-col justify-between">
        
        {/* Subtle studio topography background grid */}
        <div className="absolute inset-0 opacity-15 pointer-events-none editorial-grid"></div>

        {/* Top Badges */}
        <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/40 text-white backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              {activeItem.type === 'video' ? (
                <>
                  <Video className="w-3 h-3 text-[#8BA1B4]" />
                  <span>Video Bukti Threads</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3 h-3 text-[#8BA1B4]" />
                  <span>Foto Produk Shopee</span>
                </>
              )}
            </span>

            {activeItem.highlightBadge && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#5C7489] text-white">
                {activeItem.highlightBadge}
              </span>
            )}
          </div>

          <span className="text-xs font-mono text-[#8E9FAA] bg-black/30 px-2.5 py-1 rounded-full">
            {activeIndex + 1} / {items.length}
          </span>
        </div>

        {/* Center Visual Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
          {activeItem.type === 'video' ? (
            <div className="w-full max-w-md space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#5C7489]/20 border border-[#5C7489]/40 text-[#8BA1B4] flex items-center justify-center mx-auto shadow-inner">
                <Play className="w-8 h-8 fill-current ml-1 text-[#8BA1B4]" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {activeItem.title}
                </h4>
                <p className="text-xs text-[#8E9FAA] max-w-sm mx-auto leading-relaxed">
                  {activeItem.caption}
                </p>
              </div>

              {activeItem.isTodo && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{activeItem.todoLabel}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-md space-y-4">
              {/* Architectural studio 3D representation */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-[#26333E] to-[#14191F] border border-[#3E5161] mx-auto flex items-center justify-center shadow-2xl">
                <div className="absolute inset-2 border border-dashed border-[#5C7489]/40 rounded-xl flex items-center justify-center text-center p-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8BA1B4]">
                    3D PRINT KEYCHAIN
                  </span>
                </div>
                <Sparkles className="w-8 h-8 text-[#5C7489] opacity-70" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {activeItem.title}
                </h4>
                <p className="text-xs text-[#8E9FAA] max-w-sm mx-auto leading-relaxed">
                  {activeItem.caption}
                </p>
              </div>

              {activeItem.isTodo && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{activeItem.todoLabel}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar: Threads and Shopee links */}
        <div className="relative z-10 p-4 sm:p-5 bg-black/40 backdrop-blur-md border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-[#D5E1E9] text-[11px] text-center sm:text-left">
            Semua visual diadaptasi dari postingan viral Threads (88.2K views) & listing Shopee resmi.
          </p>

          <a
            href={STRAVA_PRODUCT_CONFIG.sourceOfTruth.threadsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8BA1B4] hover:text-white transition-colors underline underline-offset-4"
          >
            <span>Buka Postingan Threads @jaynrrrrr</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Thumbnail Selector Row */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
        {items.map((item, idx) => {
          const isSelected = activeIndex === idx;
          return (
            <button
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-18 rounded-2xl border text-left p-2 transition-all flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-[#5C7489] bg-[#182027] shadow-md ring-2 ring-[#5C7489]'
                  : 'border-[#E8E2D7] bg-white hover:border-[#8BA1B4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold uppercase ${isSelected ? 'text-[#8BA1B4]' : 'text-[#7A8B99]'}`}>
                  #{idx + 1}
                </span>
                {item.type === 'video' ? (
                  <Video className={`w-3 h-3 ${isSelected ? 'text-[#8BA1B4]' : 'text-[#7A8B99]'}`} />
                ) : (
                  <ImageIcon className={`w-3 h-3 ${isSelected ? 'text-[#8BA1B4]' : 'text-[#7A8B99]'}`} />
                )}
              </div>

              <span className={`text-[10px] font-semibold truncate ${isSelected ? 'text-white' : 'text-[#14191F]'}`}>
                {item.type === 'video' ? 'Video Proof' : item.title.split('&')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
