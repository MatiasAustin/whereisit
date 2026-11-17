import { NextResponse } from 'next/server';
import { parseYouTubeUrl } from '@/lib/youtube';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url') || '';

  const parsed = parseYouTubeUrl(url);
  if (!parsed.isYouTube || !parsed.videoId) {
    return NextResponse.json({
      success: false,
      error: 'URL YouTube tidak valid. Gunakan link youtube.com/watch?v=..., youtu.be/..., atau youtube.com/shorts/...',
    }, { status: 400 });
  }

  let title = '';
  let thumbnailUrl = parsed.thumbnailUrl;
  let detectedFormat = parsed.detectedFormat;
  let detectedRatio: '9:16' | '16:9' | '4:5' | '1:1' = parsed.detectedRatio;
  let width: number | undefined;
  let height: number | undefined;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const meta = await res.json();
      title = meta.title || '';
      if (meta.thumbnail_url) thumbnailUrl = meta.thumbnail_url;
      if (typeof meta.width === 'number' && typeof meta.height === 'number') {
        width = meta.width;
        height = meta.height;
        if (meta.height > meta.width) {
          detectedFormat = 'short';
          detectedRatio = '9:16';
        } else if (meta.width === meta.height) {
          detectedRatio = '1:1';
        } else if (parsed.detectedFormat === 'short') {
          detectedRatio = '9:16';
        } else {
          detectedFormat = 'full';
          detectedRatio = '16:9';
        }
      }
    }
  } catch {
    // Fallback silently to URL-based detection
  }

  return NextResponse.json({
    success: true,
    data: {
      videoId: parsed.videoId,
      embedUrl: parsed.embedUrl,
      thumbnailUrl,
      title,
      width,
      height,
      detectedFormat,
      detectedRatio,
    },
  });
}
