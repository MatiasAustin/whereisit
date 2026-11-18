'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  StravaGalleryMediaItem,
  StravaMediaConfig,
  VideoFormatOption,
  VideoRatioOption,
} from '@/types';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import ImageUploadWithCompress from '@/components/ui/ImageUploadWithCompress';
import {
  parseYouTubeUrl,
  resolveEffectiveAspectRatio,
  getGalleryStageContainerClass,
} from '@/lib/youtube';
import { useToast } from '@/lib/toastContext';
import {
  Save,
  Eye,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Video,
  Image as ImageIcon,
  Wand2,
  RotateCcw,
  PlayCircle,
  ExternalLink,
} from 'lucide-react';

export default function KeychainMediaAdminPage() {
  const { showSuccess, showError } = useToast();
  const [config, setConfig] = useState<StravaMediaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detectingId, setDetectingId] = useState<string | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/strava-media');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch {
      showError('Gagal memuat konfigurasi media Keychain.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch('/api/strava-media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan');
      }
      setConfig(data.data);
      showSuccess('Media gambar & video YouTube berhasil disimpan & dipublikasikan!');
    } catch (err: any) {
      showError(err.message || 'Gagal menyimpan perubahan media.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = async () => {
    if (!confirm('Kembalikan galeri & foto varian ke konfigurasi standar Shopee?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/strava-media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        showSuccess('Konfigurasi media dikembalikan ke default Shopee.');
      }
    } catch {
      showError('Gagal mereset media.');
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (id: string, patch: Partial<StravaGalleryMediaItem>) => {
    if (!config) return;
    setConfig({
      ...config,
      gallery: config.gallery.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    if (!config) return;
    const target = index + direction;
    if (target < 0 || target >= config.gallery.length) return;
    const copy = [...config.gallery];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    setConfig({ ...config, gallery: copy });
  };

  const removeItem = (id: string) => {
    if (!config) return;
    if (!confirm('Hapus item ini dari galeri?')) return;
    setConfig({
      ...config,
      gallery: config.gallery.filter((i) => i.id !== id),
    });
  };

  const addImageSlot = () => {
    if (!config) return;
    const newItem: StravaGalleryMediaItem = {
      id: `img-${Date.now()}`,
      type: 'image',
      title: 'Foto Baru Produk Keychain Strava',
      caption: 'Foto studio Keychain Custom Data Strava x Where Is It?',
      src: '',
      badge: 'Foto Studio',
      aspectRatio: '1:1',
    };
    setConfig({ ...config, gallery: [...config.gallery, newItem] });
  };

  const addYouTubeSlot = () => {
    if (!config) return;
    const newItem: StravaGalleryMediaItem = {
      id: `vid-${Date.now()}`,
      type: 'video',
      title: 'Video Bukti Keychain Strava',
      caption: 'Tempel tautan YouTube Shorts atau Full Video di bawah ini.',
      src: '',
      highlightBadge: 'Video YouTube',
      videoFormat: 'auto',
      aspectRatio: 'auto',
      isTodo: false,
    };
    setConfig({ ...config, gallery: [...config.gallery, newItem] });
  };

  const detectYouTubeMeta = async (item: StravaGalleryMediaItem, urlOverride?: string) => {
    const rawUrl = (urlOverride ?? item.src).trim();
    if (!rawUrl) return;

    const quick = parseYouTubeUrl(rawUrl);
    if (!quick.isYouTube) {
      updateItem(item.id, { src: rawUrl, isTodo: false });
      return;
    }

    setDetectingId(item.id);
    try {
      const res = await fetch(`/api/media/youtube-meta?url=${encodeURIComponent(rawUrl)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const meta = json.data;
        updateItem(item.id, {
          src: rawUrl,
          title:
            !item.title || item.title.startsWith('Video Bukti') || item.isTodo
              ? meta.title || item.title
              : item.title,
          thumbnailUrl: meta.thumbnailUrl,
          videoFormat: meta.detectedFormat,
          aspectRatio: meta.detectedRatio,
          isTodo: false,
          todoLabel: undefined,
        });
        showSuccess(
          `YouTube terdeteksi: ${meta.detectedFormat === 'short' ? 'Shorts (9:16)' : 'Full Video (16:9)'} • Rasio ${meta.detectedRatio}`
        );
      } else {
        updateItem(item.id, {
          src: rawUrl,
          thumbnailUrl: quick.thumbnailUrl || undefined,
          videoFormat: quick.detectedFormat,
          aspectRatio: quick.detectedRatio,
          isTodo: false,
        });
      }
    } catch {
      updateItem(item.id, {
        src: rawUrl,
        thumbnailUrl: quick.thumbnailUrl || undefined,
        videoFormat: quick.detectedFormat,
        aspectRatio: quick.detectedRatio,
        isTodo: false,
      });
    } finally {
      setDetectingId(null);
    }
  };

  if (loading || !config) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#5C7489] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#7A8B99] font-medium">Memuat pengelola media &amp; YouTube...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
            Media &amp; Video Manager
          </span>
          <h1 className="text-2xl font-black text-[#14191F]">
            Keychain Strava: Foto (Auto-Compress) &amp; Video YouTube
          </h1>
          <p className="text-xs text-[#556473] mt-0.5">
            Upload foto dengan kompresi WebP otomatis, atau sematkan link YouTube Shorts (9:16) maupun Full Video (16:9). Rasio bingkai mengikuti video.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefault}
            disabled={saving}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#556473] hover:text-[#14191F] flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <Link
            href="/preorder/keychain-strava"
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#5C7489] hover:bg-[#FAF8F5] flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Halaman PO</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan & Publikasikan'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: HERO IMAGE & 3 VARIATION THUMBNAILS (AUTO-COMPRESS) */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-[#F0EBE3] pb-4">
          <h2 className="text-base font-black text-[#14191F]">
            1. Foto Utama Hero &amp; 3 Foto Variasi Shopee (Auto-Compress WebP)
          </h2>
          <p className="text-xs text-[#556473]">
            Setiap gambar yang diunggah otomatis diperkecil dan dikompres menjadi WebP agar halaman mobile 390px tetap ringan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Hero Showcase Image */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-2">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#14191F] text-white">
              Hero Showcase
            </span>
            <ImageUploadWithCompress
              label="Foto Utama Hero"
              value={config.heroImage}
              onChange={(url) => setConfig({ ...config, heroImage: url })}
              aspectRatio="square"
              compressionOptions={{ maxWidth: 1200, maxHeight: 1200, quality: 0.82, preserveAlpha: false }}
            />
          </div>

          {/* 3 Variation Thumbnails */}
          {STRAVA_PRODUCT_CONFIG.variations.map((v) => (
            <div key={v.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-3">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDF3F7] text-[#3E5161]">
                {v.badge || v.name}
              </span>
              <ImageUploadWithCompress
                label={`Foto Varian: ${v.name}`}
                value={config.variationImages[v.id] ?? v.image ?? ''}
                onChange={(url) =>
                  setConfig({
                    ...config,
                    variationImages: { ...config.variationImages, [v.id]: url },
                  })
                }
                aspectRatio="square"
                compressionOptions={{ maxWidth: 1000, maxHeight: 1000, quality: 0.82, preserveAlpha: false }}
              />

              <div className="pt-2 border-t border-[#ECE6DC]">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#44505C] mb-1">
                  Harga Varian (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A8B99]">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={config.variationPrices?.[v.id] ?? v.price}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        variationPrices: {
                          ...(config.variationPrices || {}),
                          [v.id]: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#14191F] focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: GALERI PRODUK & YOUTUBE SHORTS / FULL VIDEO */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EBE3] pb-4">
          <div>
            <h2 className="text-base font-black text-[#14191F]">
              2. Galeri Foto &amp; Video YouTube (Shorts / Full Video)
            </h2>
            <p className="text-xs text-[#556473]">
              Tempel link YouTube Shorts (`youtube.com/shorts/...`) atau Full Video (`youtube.com/watch?v=...` / `youtu.be/...`). Rasio bingkai galeri otomatis menyesuaikan.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={addImageSlot}
              className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#ECE6DC] border border-[#DDD5C7] text-xs font-bold text-[#14191F] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Foto</span>
            </button>
            <button
              type="button"
              onClick={addYouTubeSlot}
              className="px-3.5 py-2 rounded-xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs font-bold flex items-center gap-1.5"
            >
              <PlayCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Attach Video YouTube</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {config.gallery.map((item, idx) => {
            const yt = item.type === 'video' ? parseYouTubeUrl(item.src) : null;
            const effectiveRatio = resolveEffectiveAspectRatio(item);
            const stageClass = getGalleryStageContainerClass(effectiveRatio);

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-4"
              >
                {/* Item Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E2D7]">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#14191F] text-white">
                      Slot #{idx + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white border border-[#DDD5C7] text-[#3E5161]">
                      {item.type === 'video' ? (
                        <>
                          <Video className="w-3 h-3 text-[#5C7489]" />
                          <span>
                            Video ({item.isTodo ? 'TODO Placeholder' : effectiveRatio})
                          </span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3 text-[#5C7489]" />
                          <span>Foto Produk ({effectiveRatio})</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white border border-[#DDD5C7] text-[#44505C] disabled:opacity-30"
                      title="Pindah ke atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === config.gallery.length - 1}
                      className="p-1.5 rounded-lg bg-white border border-[#DDD5C7] text-[#44505C] disabled:opacity-30"
                      title="Pindah ke bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50"
                      title="Hapus slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Controls */}
                  <div className="lg:col-span-7 space-y-4 text-xs">
                    {item.type === 'image' ? (
                      <ImageUploadWithCompress
                        label="Ganti / Upload Gambar Baru (Auto-Compress WebP)"
                        value={item.src}
                        onChange={(url) => updateItem(item.id, { src: url, isTodo: false })}
                        aspectRatio="auto"
                        compressionOptions={{ maxWidth: 1400, maxHeight: 1400, quality: 0.82, preserveAlpha: false }}
                      />
                    ) : (
                      <div className="space-y-3 p-4 rounded-2xl bg-white border border-[#DDD5C7]">
                        <label className="block font-bold text-[#14191F]">
                          Link Video YouTube (Shorts / Full Video) atau File MP4
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="url"
                            placeholder="https://youtube.com/shorts/... atau https://youtu.be/..."
                            value={item.isTodo ? '' : item.src}
                            onChange={(e) => {
                              const val = e.target.value;
                              const parsed = parseYouTubeUrl(val);
                              updateItem(item.id, {
                                src: val,
                                isTodo: !val.trim(),
                                ...(parsed.isYouTube
                                  ? {
                                      thumbnailUrl: parsed.thumbnailUrl || undefined,
                                      videoFormat: parsed.detectedFormat,
                                      aspectRatio: parsed.detectedRatio,
                                    }
                                  : {}),
                              });
                            }}
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono focus:outline-none focus:border-[#5C7489]"
                          />
                          <button
                            type="button"
                            onClick={() => detectYouTubeMeta(item)}
                            disabled={detectingId === item.id || !item.src}
                            className="px-4 py-2.5 rounded-xl bg-[#EDF3F7] hover:bg-[#DCE7F0] text-[#3E5161] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#C5D5E2] disabled:opacity-50"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>{detectingId === item.id ? 'Mendeteksi...' : 'Deteksi Rasio'}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-bold text-[#556473] mb-1">
                              Format Video YouTube
                            </label>
                            <select
                              value={item.videoFormat || 'auto'}
                              onChange={(e) => {
                                const fmt = e.target.value as VideoFormatOption;
                                updateItem(item.id, {
                                  videoFormat: fmt,
                                  aspectRatio: fmt === 'short' ? '9:16' : fmt === 'full' ? '16:9' : 'auto',
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-semibold"
                            >
                              <option value="auto">Auto Deteksi dari Link</option>
                              <option value="short">YouTube Shorts (Vertical 9:16)</option>
                              <option value="full">Full Video (Widescreen 16:9)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#556473] mb-1">
                              Rasio Bingkai Galeri
                            </label>
                            <select
                              value={item.aspectRatio || 'auto'}
                              onChange={(e) =>
                                updateItem(item.id, { aspectRatio: e.target.value as VideoRatioOption })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-semibold"
                            >
                              <option value="auto">Menyesuaikan Video (Auto)</option>
                              <option value="9:16">9:16 Portrait (Shorts)</option>
                              <option value="16:9">16:9 Landscape (Full Video)</option>
                              <option value="4:5">4:5 Vertical Feed</option>
                              <option value="1:1">1:1 Square</option>
                            </select>
                          </div>
                        </div>

                        {item.isTodo && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                            Slot ini masih TODO. Tempel URL YouTube di atas untuk langsung mengaktifkannya di halaman pre-order.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Title & Caption & Aspect selector for image */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#556473] mb-1">Judul Tampilan</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItem(item.id, { title: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#556473] mb-1">Badge Label</label>
                        <input
                          type="text"
                          placeholder="Foto Produk 1 / Shorts"
                          value={item.type === 'video' ? item.highlightBadge || '' : item.badge || ''}
                          onChange={(e) =>
                            item.type === 'video'
                              ? updateItem(item.id, { highlightBadge: e.target.value })
                              : updateItem(item.id, { badge: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-[#556473] mb-1">Deskripsi Singkat</label>
                        <textarea
                          rows={2}
                          value={item.caption}
                          onChange={(e) => updateItem(item.id, { caption: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Ratio-Adaptive Preview */}
                  <div className="lg:col-span-5 bg-[#14191F] rounded-2xl p-4 border border-[#26333E] text-white space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#8BA1B4] font-mono">
                      <span>LIVE RATIO PREVIEW</span>
                      <span className="px-2 py-0.5 rounded bg-[#5C7489] text-white font-bold">
                        {effectiveRatio}
                      </span>
                    </div>

                    <div className="w-full flex items-center justify-center py-2">
                      {item.type === 'image' ? (
                        item.src ? (
                          <div className="relative aspect-square w-full max-w-[260px] rounded-xl overflow-hidden bg-black/40 border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="aspect-square w-full max-w-[260px] rounded-xl border border-dashed border-white/20 flex items-center justify-center text-xs text-[#8E9FAA]">
                            Belum ada gambar
                          </div>
                        )
                      ) : yt?.embedUrl && !item.isTodo ? (
                        <div className={`${stageClass} max-h-[340px] rounded-xl overflow-hidden border border-white/10 bg-black`}>
                          <iframe
                            src={yt.embedUrl}
                            title={item.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : item.src && !item.isTodo ? (
                        <video
                          src={item.src}
                          controls
                          className={`${stageClass} max-h-[340px] rounded-xl border border-white/10 bg-black`}
                        />
                      ) : (
                        <div className="aspect-video w-full rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-center p-4 text-xs text-[#8E9FAA]">
                          <PlayCircle className="w-8 h-8 text-red-400 mb-2" />
                          <span>Tempel URL YouTube Shorts atau Full Video untuk melihat preview rasio {effectiveRatio}.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
