import { NextResponse } from 'next/server';

function extractMeta(html: string, property: string): string | undefined {
  // Try property="..." and name="..."
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, 'i'),
  ];

  for (const regex of patterns) {
    const match = html.match(regex);
    if (match && match[1]) {
      return decodeHtmlEntities(match[1].trim());
    }
  }
  return undefined;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = body.url?.trim();

    if (!rawUrl) {
      return NextResponse.json({ success: false, error: 'URL wajib diisi' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    } catch {
      return NextResponse.json({ success: false, error: 'Format URL tidak valid' }, { status: 400 });
    }

    const host = parsedUrl.hostname.toLowerCase();
    let platform: string = 'web';
    let title: string | undefined;
    let description: string | undefined;
    let imageUrl: string | undefined;
    let siteName: string = host.replace(/^www\./, '');

    // 1. YouTube Handler
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      platform = 'youtube';
      siteName = 'YouTube';
      let videoId = parsedUrl.searchParams.get('v');
      if (!videoId && host.includes('youtu.be')) {
        videoId = parsedUrl.pathname.replace(/^\//, '').split('/')[0];
      }
      if (!videoId && parsedUrl.pathname.includes('/shorts/')) {
        videoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0];
      }

      if (videoId) {
        imageUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        try {
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`, {
            signal: AbortSignal.timeout(4000),
          });
          if (oembedRes.ok) {
            const oembedData = await oembedRes.json();
            title = oembedData.title;
            siteName = oembedData.author_name ? `${oembedData.author_name} on YouTube` : 'YouTube';
          }
        } catch {}
      }
    }

    // 2. TikTok Handler
    else if (host.includes('tiktok.com')) {
      platform = 'tiktok';
      siteName = 'TikTok';
      try {
        const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(rawUrl)}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          title = oembedData.title || 'TikTok Video';
          imageUrl = oembedData.thumbnail_url;
          siteName = oembedData.author_name ? `@${oembedData.author_name} on TikTok` : 'TikTok';
        }
      } catch {}
    }

    // 3. Threads Handler
    else if (host.includes('threads.net')) {
      platform = 'threads';
      siteName = 'Threads';
      title = 'Threads Post';
    }

    // 4. Facebook Handler
    else if (host.includes('facebook.com') || host.includes('fb.watch')) {
      platform = 'facebook';
      siteName = 'Facebook';
      title = 'Facebook Video / Post';
    }

    // 5. Instagram Handler
    else if (host.includes('instagram.com')) {
      platform = 'instagram';
      siteName = 'Instagram';
      title = 'Instagram Post / Reel';
    }

    // 6. Pinterest Handler
    else if (host.includes('pinterest.com') || host.includes('pin.it')) {
      platform = 'pinterest';
      siteName = 'Pinterest';
      title = 'Pinterest Inspiration';
    }

    // 7. General Scraping / Meta extraction fallback
    if (!imageUrl || !title) {
      try {
        const fetchRes = await fetch(parsedUrl.toString(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
          },
          signal: AbortSignal.timeout(5000),
        });

        if (fetchRes.ok) {
          const html = await fetchRes.text();

          const ogImage = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image');
          if (ogImage && !imageUrl) {
            // Handle relative url
            if (ogImage.startsWith('http')) {
              imageUrl = ogImage;
            } else if (ogImage.startsWith('/')) {
              imageUrl = `${parsedUrl.origin}${ogImage}`;
            }
          }

          const ogTitle = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title');
          if (ogTitle && (!title || title.includes('Post'))) {
            title = ogTitle;
          } else if (!title) {
            const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
              title = decodeHtmlEntities(titleMatch[1].trim());
            }
          }

          const ogDesc = extractMeta(html, 'og:description') || extractMeta(html, 'description') || extractMeta(html, 'twitter:description');
          if (ogDesc) {
            description = ogDesc;
          }

          const ogSite = extractMeta(html, 'og:site_name');
          if (ogSite) {
            siteName = ogSite;
          }
        }
      } catch (scrapeErr) {
        console.warn('Scraping link preview timed out or failed:', scrapeErr);
      }
    }

    // Default title fallback
    if (!title) {
      title = `${siteName} Inspiration`;
    }

    const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;

    return NextResponse.json({
      success: true,
      data: {
        url: parsedUrl.toString(),
        title,
        description: description ? description.slice(0, 200) : undefined,
        imageUrl,
        platform,
        siteName,
        favicon,
      },
    });
  } catch (error: any) {
    console.error('Error fetching link preview:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengambil pratinjau tautan' }, { status: 500 });
  }
}
