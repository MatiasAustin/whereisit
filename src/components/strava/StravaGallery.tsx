'use client';

import React, { useState, useEffect } from 'react';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import { StravaGalleryMediaItem } from '@/types';
import {
  parseYouTubeUrl,
  resolveEffectiveAspectRatio,
  getGalleryStageContainerClass,
} from '@/lib/youtube';
import { Play, Image as ImageIcon, Video, AlertCircle, Maximize2, ExternalLink, Flame, X } from 'lucide-react';

interface StravaGalleryProps {
  items?: StravaGalleryMediaItem[];
}

export default function StravaGallery({ items: externalItems }: StravaGalleryProps) {
  const defaultItems: StravaGalleryMediaItem[] = STRAVA_PRODUCT_CONFIG.gallery.map((g) => ({
    id: g.id,
    type: g.type,
    title: g.title,
    caption: g.caption,
    src: g.src,
    badge: 'badge' in g ? g.badge : undefined,
    highlightBadge: 'highlightBadge' in g ? g.highlightBadge : undefined,
    videoFormat: g.type === 'video' ? 'auto' : undefined,
    aspectRatio: g.type === 'video' ? 'auto' : '1:1',
    isTodo: 'isTodo' in g ? Boolean(g.isTodo) : false,
    todoLabel: 'todoLabel' in g ? g.todoLabel : undefined,
  }));

  const items = externalItems && externalItems.length > 0 ? externalItems : defaultItems;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] || items[0];
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [items.length, activeIndex]);

  useEffect(() => {
    if (!fullscreenOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreenOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullscreenOpen]);

  const ytInfo = activeItem.type === 'video' ? parseYouTubeUrl(activeItem.src) : null;
  const effectiveRatio = resolveEffectiveAspectRatio(activeItem);
  const adaptiveStageClass = getGalleryStageContainerClass(effectiveRatio);

  return (
    <div className="w-full space-y-4">
      {/* Main Showcase Stage */}
      <div className="relative rounded-3xl bg-[#14191F] overflow-hidden border border-[#26333E] shadow-2xl flex flex-col justify-between min-h-[380px] sm:min-h-[460px]">
        {/* Top Badges */}
        <div className="relative z-20 p-4 sm:p-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/15 flex items-center gap-1.5">
              {activeItem.type === 'video' ? (
                <>
                  <Video className="w-3 h-3 text-[#8BA1B4]" aria-hidden="true" />
                  <span>
                    {ytInfo?.isYouTube
                      ? effectiveRatio === '9:16'
                        ? 'YouTube Shorts (9:16)'
                        : `YouTube Video (${effectiveRatio})`
                      : 'Video Bukti Threads'}
                  </span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3 h-3 text-[#8BA1B4]" aria-hidden="true" />
                  <span>{activeItem.badge || 'Foto Resmi Studio'}</span>
                </>
              )}
            </span>

            {activeItem.highlightBadge && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#5C7489] text-white flex items-center gap-1">
                <Flame className="w-3 h-3" aria-hidden="true" />
                <span>{activeItem.highlightBadge}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeItem.type === 'image' && activeItem.src && (
              <button
                type="button"
                onClick={() => setFullscreenOpen(true)}
                className="min-w-[44px] min-h-[44px] rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-colors flex items-center justify-center"
                title="Perbesar foto"
                aria-label="Perbesar foto produk"
              >
                <Maximize2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <span className="text-xs font-mono text-[#D5E1E9] bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
              {activeIndex + 1} / {items.length}
            </span>
          </div>
        </div>

        {/* Center Visual Content (Adapts dynamically to video ratio: 9:16 Shorts vs 16:9 Full vs 4:5 vs 1:1) */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-3 py-2 sm:px-6 sm:py-4">
          {activeItem.type === 'video' ? (
            !activeItem.isTodo && activeItem.src ? (
              ytInfo?.isYouTube && ytInfo.embedUrl ? (
                <div className={`${adaptiveStageClass} rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl`}>
                  <iframe
                    src={ytInfo.embedUrl}
                    title={activeItem.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className={`${adaptiveStageClass} rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl`}>
                  <video
                    src={activeItem.src}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              )
            ) : (
              <div className="w-full max-w-md space-y-4 text-center my-auto px-4 py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#5C7489]/20 border border-[#5C7489]/40 text-[#8BA1B4] flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 fill-current ml-1 text-[#8BA1B4]" aria-hidden="true" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {activeItem.title}
                  </h4>
                  <p className="text-xs text-[#D5E1E9] max-w-sm mx-auto leading-relaxed">
                    {activeItem.caption}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-[11px] font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>{activeItem.todoLabel || 'TODO: Belum ada video terpasang'}</span>
                </div>
              </div>
            )
          ) : (
            <div className={`${adaptiveStageClass} relative flex items-center justify-center overflow-hidden rounded-2xl group`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeItem.src}
                alt={activeItem.title}
                width={1024}
                height={1024}
                className="max-h-[460px] w-full h-full object-contain rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
          )}
        </div>

        {/* Bottom Bar: Title & Social Source */}
        <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-t from-black/85 via-black/60 to-transparent border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-center sm:text-left space-y-0.5">
            <h4 className="font-bold text-white text-xs sm:text-sm">{activeItem.title}</h4>
            <p className="text-[#D5E1E9] text-[11px] max-w-md">{activeItem.caption}</p>
          </div>

          {activeItem.type === 'video' ? (
            <a
              href={
                ytInfo?.isYouTube
                  ? activeItem.src
                  : STRAVA_PRODUCT_CONFIG.sourceOfTruth.threadsUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8BA1B4] hover:text-white transition-colors underline underline-offset-4 flex-shrink-0 min-h-[36px]"
            >
              <span>
                {ytInfo?.isYouTube
                  ? 'Tonton di YouTube'
                  : 'Lihat di Threads @jaynrrrrr'}
              </span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          ) : (
            <a
              href="#variations"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8BA1B4] hover:text-white transition-colors underline underline-offset-4 flex-shrink-0 min-h-[36px]"
            >
              <span>Lihat Detail Varian</span>
            </a>
          )}
        </div>
      </div>

      {/* Thumbnail Selector Row */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2">
        {items.map((item, idx) => {
          const isSelected = activeIndex === idx;
          const thumbYt = item.type === 'video' ? parseYouTubeUrl(item.src) : null;
          const thumbRatio = resolveEffectiveAspectRatio(item);
          const videoThumbSrc = item.thumbnailUrl || thumbYt?.thumbnailUrl;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Tampilkan ${item.title}`}
              aria-pressed={isSelected}
              className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border overflow-hidden transition-all text-left group ${
                isSelected
                  ? 'border-[#5C7489] ring-2 ring-[#5C7489] shadow-lg'
                  : 'border-[#E8E2D7] bg-white opacity-75 hover:opacity-100 hover:border-[#8BA1B4]'
              }`}
            >
              {item.type === 'image' ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.title}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/70 text-white font-mono">
                    #{idx + 1}
                  </span>
                </>
              ) : videoThumbSrc && !item.isTodo ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={videoThumbSrc}
                    alt={item.title}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" aria-hidden="true" />
                  </div>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/75 text-white font-mono">
                    {thumbRatio === '9:16' ? 'Shorts' : thumbRatio}
                  </span>
                </>
              ) : (
                <div className="w-full h-full bg-[#182027] text-[#D5E1E9] p-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-[#8BA1B4]">#{idx + 1}</span>
                    <Video className="w-3 h-3 text-[#8BA1B4]" aria-hidden="true" />
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

      {/* Fullscreen Lightbox */}
      {fullscreenOpen && activeItem.type === 'image' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setFullscreenOpen(false)}
        >
          <button
            type="button"
            onClick={() => setFullscreenOpen(false)}
            aria-label="Tutup perbesar gambar"
            className="absolute top-4 right-4 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeItem.src}
              alt={activeItem.title}
              width={1024}
              height={1024}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-4 text-center text-white space-y-1">
              <p className="font-bold text-sm">{activeItem.title}</p>
              <p className="text-xs text-[#D5E1E9]">{activeItem.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
