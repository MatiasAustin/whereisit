import { StravaGalleryMediaItem, VideoRatioOption } from '@/types';

export interface ParsedYouTubeInfo {
  isYouTube: boolean;
  videoId: string | null;
  detectedFormat: 'short' | 'full';
  detectedRatio: '9:16' | '16:9';
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

/**
 * Extracts YouTube Video ID and infers Short (9:16) vs Full Video (16:9) from any YouTube URL.
 */
export function parseYouTubeUrl(url: string): ParsedYouTubeInfo {
  const empty: ParsedYouTubeInfo = {
    isYouTube: false,
    videoId: null,
    detectedFormat: 'full',
    detectedRatio: '16:9',
    embedUrl: null,
    thumbnailUrl: null,
  };

  if (!url || typeof url !== 'string') return empty;
  const trimmed = url.trim();
  if (!trimmed) return empty;

  // Match youtube.com/shorts/<id>
  const shortsMatch = trimmed.match(/(?:youtube\.com|m\.youtube\.com)\/shorts\/([A-Za-z0-9_-]{11})/i);
  if (shortsMatch?.[1]) {
    const id = shortsMatch[1];
    return {
      isYouTube: true,
      videoId: id,
      detectedFormat: 'short',
      detectedRatio: '9:16',
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // Match youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/embed/<id>, youtube.com/live/<id>
  const standardMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|live\/))([A-Za-z0-9_-]{11})/i
  );
  if (standardMatch?.[1]) {
    const id = standardMatch[1];
    return {
      isYouTube: true,
      videoId: id,
      detectedFormat: 'full',
      detectedRatio: '16:9',
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  return empty;
}

/**
 * Resolves the effective display aspect ratio of a gallery item:
 * 1. Explicit aspectRatio (if set and not 'auto')
 * 2. Video format override ('short' -> '9:16', 'full' -> '16:9')
 * 3. URL auto-detection (Shorts vs regular YouTube) or default image ratio ('1:1')
 */
export function resolveEffectiveAspectRatio(item: StravaGalleryMediaItem): Exclude<VideoRatioOption, 'auto'> {
  if (item.aspectRatio && item.aspectRatio !== 'auto') {
    return item.aspectRatio;
  }

  if (item.type === 'video') {
    if (item.videoFormat === 'short') return '9:16';
    if (item.videoFormat === 'full') return '16:9';
    const yt = parseYouTubeUrl(item.src);
    return yt.isYouTube ? yt.detectedRatio : '16:9';
  }

  return '1:1';
}

/**
 * Maps an aspect ratio option to responsive Tailwind classes so the container
 * cleanly matches YouTube Shorts (9:16), IG vertical (4:5), Square (1:1), or Full Video (16:9).
 */
export function getGalleryStageContainerClass(ratio: Exclude<VideoRatioOption, 'auto'>): string {
  switch (ratio) {
    case '9:16':
      return 'aspect-[9/16] w-full max-w-[330px] sm:max-w-[360px] mx-auto';
    case '4:5':
      return 'aspect-[4/5] w-full max-w-[400px] sm:max-w-[440px] mx-auto';
    case '1:1':
      return 'aspect-square w-full max-w-[480px] sm:max-w-[520px] mx-auto';
    case '16:9':
    default:
      return 'aspect-video w-full';
  }
}
