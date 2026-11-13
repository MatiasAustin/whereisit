'use client';

import React, { useState } from 'react';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import { Play, Image as ImageIcon, Video, AlertCircle, Maximize2, Sparkles, ExternalLink, Flame } from 'lucide-react';

export default function StravaGallery() {
  const items = STRAVA_PRODUCT_CONFIG.gallery;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex];
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  return (
    <div className="w-full space-y-4">
      {/* Main Showcase Stage */}
      <div className="relative aspect-square sm:aspect-16/10 rounded-3xl bg-[#14191F] overflow-hidden border border-[#26333E] shadow-2xl flex flex-col justify-between">
        
        {/* Subtle studio topography background grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none editorial-grid"></div>

        {/* Top Badges */}
        <div className="relative z-20 p-4 sm:p-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/15 flex items-center gap-1.5">
              {activeItem.type === 'video' ? (
                <>
                  <Video className="w-3 h-3 text-[#8BA1B4]" />
                  <span>Video Bukti Threads</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3 h-3 text-[#8BA1B4]" />
                  <span>{activeItem.badge || 'Foto Resmi Shopee'}</span>
                </>
              )}
            </span>

            {activeItem.highlightBadge && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#5C7489] text-white flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span>{activeItem.highlightBadge}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeItem.type === 'image' && (
              <button
                onClick={() => setFullscreenOpen(true)}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-colors"
                title="Perbesar foto"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            <span className="text-xs font-mono text-[#8E9FAA] bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
              {activeIndex + 1} / {items.length}
            </span>
          </div>
        </div>

        {/* Center Visual Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 sm:p-6">
          {activeItem.type === 'video' ? (
            <div className="w-full max-w-md space-y-4 text-center my-auto px-4">
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
            /* REAL SHOPEE PRODUCT PHOTO RENDERING */
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeItem.src}
                alt={activeItem.title}
                className="max-h-[300px] sm:max-h-[440px] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-102"
              />
            </div>
          )}
        </div>

        {/* Bottom Bar: Title & Social Source */}
        <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-xs border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-center sm:text-left space-y-0.5">
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {activeItem.title}
            </h4>
            <p className="text-[#8E9FAA] text-[11px] max-w-md">
              {activeItem.caption}
            </p>
          </div>

          <a
            href={STRAVA_PRODUCT_CONFIG.sourceOfTruth.shopeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8BA1B4] hover:text-white transition-colors underline underline-offset-4 flex-shrink-0"
          >
            <span>Shopee WhereIsIt?</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Thumbnail Selector Row */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2">
        {items.map((item, idx) => {
          const isSelected = activeIndex === idx;
          return (
            <button
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border overflow-hidden transition-all text-left group ${
                isSelected
                  ? 'border-[#5C7489] ring-2 ring-[#5C7489] shadow-lg scale-102'
                  : 'border-[#E8E2D7] bg-white opacity-70 hover:opacity-100 hover:border-[#8BA1B4]'
              }`}
            >
              {item.type === 'image' ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/60 text-white font-mono">
                    #{idx + 1}
                  </span>
                </>
              ) : (
                <div className="w-full h-full bg-[#182027] text-[#8BA1B4] p-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-[#8BA1B4]">#{idx + 1}</span>
                    <Video className="w-3 h-3 text-[#5C7489]" />
                  </div>
                  <span className="text-[9px] font-bold text-white line-clamp-2 leading-tight">
                    Video Proof
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Fullscreen Lightbox for High-Res Inspection */}
      {fullscreenOpen && activeItem.type === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreenOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeItem.src}
              alt={activeItem.title}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-4 text-center text-white space-y-1">
              <p className="font-bold text-sm">{activeItem.title}</p>
              <p className="text-xs text-[#8E9FAA]">{activeItem.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
