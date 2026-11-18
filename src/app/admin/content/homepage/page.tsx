'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings, HomepageContent } from '@/types';
import { DEFAULT_HOMEPAGE_CONTENT } from '@/lib/studioDefaults';
import { Save, Eye, Layers, Sparkles, Palette, Award, Phone } from 'lucide-react';
import ImageUploadWithCompress from '@/components/ui/ImageUploadWithCompress';
import { useToast } from '@/lib/toastContext';

type TabType = 'hero' | 'custom' | 'contact';

export default function HomepageEditorPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // 1. Instant hydration from client storage to prevent image flicker on refresh
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('whereisit_store_settings_override');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            const mergedSettings: StoreSettings = {
              ...parsed,
              homepageContent: {
                ...DEFAULT_HOMEPAGE_CONTENT,
                ...(parsed.homepageContent || {}),
              },
            };
            setSettings(mergedSettings);
          }
        }
      }
    } catch (e) {
      console.warn('Could not read cached store settings override:', e);
    }

    fetch(`/api/settings?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          const mergedSettings: StoreSettings = {
            ...d.data,
            homepageContent: {
              ...DEFAULT_HOMEPAGE_CONTENT,
              ...(d.data.homepageContent || {}),
            },
          };
          setSettings(mergedSettings);
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('whereisit_store_settings_override', JSON.stringify(mergedSettings));
            }
          } catch {}
        }
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        showError('Gagal memuat pengaturan homepage.');
      })
      .finally(() => setLoading(false));
  }, [showError]);

  const updateContent = <K extends keyof HomepageContent>(key: K, value: HomepageContent[K]) => {
    if (!settings) return;
    setSettings({
      ...settings,
      homepageContent: {
        ...(settings.homepageContent || DEFAULT_HOMEPAGE_CONTENT),
        [key]: value,
      },
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    // Instant optimistic save to local storage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('whereisit_store_settings_override', JSON.stringify(settings));
        // Cross-mirror hero image to strava media override if heroMainImage exists
        if (settings.homepageContent?.heroMainImage) {
          const stravaCached = localStorage.getItem('whereisit_strava_media_override');
          if (stravaCached) {
            const stravaParsed = JSON.parse(stravaCached);
            stravaParsed.heroImage = settings.homepageContent.heroMainImage;
            localStorage.setItem('whereisit_strava_media_override', JSON.stringify(stravaParsed));
          }
        }
      }
    } catch {}

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data) {
          setSettings(data.data);
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('whereisit_store_settings_override', JSON.stringify(data.data));
            }
          } catch {}
        }
        showSuccess('Konten homepage & storefront berhasil diperbarui!');
      } else {
        showError(data.error || 'Gagal menyimpan perubahan.');
      }
    } catch (e) {
      showError('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#5C7489] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#7A8B99] font-medium tracking-wide">Memuat editor CMS storefront...</p>
      </div>
    );
  }

  const content = settings.homepageContent || DEFAULT_HOMEPAGE_CONTENT;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'hero', label: 'Hero Section & Visuals', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'custom', label: 'Bespoke Services', icon: <Palette className="w-4 h-4" /> },
    { id: 'contact', label: 'Studio Identity', icon: <Phone className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Content Management System</span>
          <h1 className="text-2xl font-black text-[#14191F]">Homepage & Storefront CMS</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Kelola narasi, headline hero, foto showroom, dan teks editorial yang tampil di website WhereIsIt.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#5C7489] hover:bg-[#FAF8F5] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Website</span>
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#ECE6DC]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#14191F] text-white shadow-sm'
                  : 'text-[#6C7E8E] hover:text-[#14191F] hover:bg-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: HERO & SHORTCUTS */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-[#ECE6DC] pb-4">
              <h2 className="text-sm font-black text-[#14191F] uppercase tracking-wider">Hero Section Headlines</h2>
              <p className="text-xs text-[#7A8B99]">Pesan utama dan CTA yang pertama kali dilihat pengunjung.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Top Pill Tag
                </label>
                <input
                  type="text"
                  value={content.heroHeadlineTag}
                  onChange={(e) => updateContent('heroHeadlineTag', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Main Brand Title
                </label>
                <input
                  type="text"
                  value={content.heroHeadlineTitle}
                  onChange={(e) => updateContent('heroHeadlineTitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                Hero Brand Statement / Manifesto
              </label>
              <textarea
                rows={3}
                value={content.heroStatement}
                onChange={(e) => updateContent('heroStatement', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={content.heroCtaPrimary}
                  onChange={(e) => updateContent('heroCtaPrimary', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={content.heroCtaSecondary}
                  onChange={(e) => updateContent('heroCtaSecondary', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Technical Spec Pill 1 (Layering)
                </label>
                <input
                  type="text"
                  value={content.heroSpecLayer}
                  onChange={(e) => updateContent('heroSpecLayer', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Technical Spec Pill 2 (Materials)
                </label>
                <input
                  type="text"
                  value={content.heroSpecMaterial}
                  onChange={(e) => updateContent('heroSpecMaterial', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>

            {/* HERO VISUALS & MEDIA CARDS (Center Image + Shortcuts) */}
            <div className="pt-6 border-t border-[#ECE6DC] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#ECE6DC]">
                <div>
                  <h3 className="text-sm font-black text-[#14191F] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#5C7489]" />
                    <span>Hero Visuals &amp; Media (Foto Utama &amp; Floating Cards)</span>
                  </h3>
                  <p className="text-xs text-[#7A8B99]">
                    Ganti dan upload foto produk utama di tengah serta dua kartu floating di kanan hero homepage.
                  </p>
                </div>
              </div>

              {/* 1. Center Main Hero Product Visual */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#ECE6DC]">
                  <div>
                    <span className="text-xs font-black text-[#14191F] uppercase tracking-wider">
                      1. Foto Produk Utama di Tengah (Center Hero Visual)
                    </span>
                    <p className="text-[11px] text-[#7A8B99]">
                      Foto hero besar di tengah dengan badge harga dan nama produk.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#14191F] text-white uppercase tracking-wider">
                    Center Display
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-6 space-y-3">
                    <ImageUploadWithCompress
                      label="Upload / Ganti Foto Hero Utama"
                      helperText="Otomatis dikompresi ke WebP resolusi tinggi (Rekomendasi rasio 1:1 square)"
                      value={content.heroMainImage || '/images/strava-keychain/keychain-04.jpg'}
                      onChange={(url) => updateContent('heroMainImage', url)}
                    />

                    {/* Quick Studio Presets */}
                    <div>
                      <span className="block text-[11px] font-bold text-[#5C7489] uppercase tracking-wider mb-1.5">
                        Pilih Cepat dari Preset Studio:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '04: Depan Printer 3D (Default)', url: '/images/strava-keychain/keychain-04.jpg' },
                          { label: '05: Saku Celana (Varian 2)', url: '/images/strava-keychain/keychain-05.jpg' },
                          { label: '06: Stasiun MRT (Varian 3)', url: '/images/strava-keychain/keychain-06.jpg' },
                          { label: 'Smart Cube Concept', url: '/images/coming-soon/smart-cube.jpg' },
                          { label: 'Sleep Lamp Pro Infographic', url: '/images/coming-soon/sleep-lamp-pro-infographic.jpg' },
                          { label: 'Strava Lamp Concept', url: '/images/coming-soon/strava-route-lamp.jpg' },
                        ].map((preset) => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => updateContent('heroMainImage', preset.url)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                              (content.heroMainImage || '/images/strava-keychain/keychain-04.jpg') === preset.url
                                ? 'bg-[#14191F] text-white border-[#14191F]'
                                : 'bg-white text-[#556473] border-[#DDD5C7] hover:border-[#5C7489]'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#44505C] mb-1">
                        Label Badge Produk (Pill Bawah)
                      </label>
                      <input
                        type="text"
                        value={content.heroMainLabel || 'Keychain Custom Data Strava x Where Is It? 3D print Custom'}
                        onChange={(e) => updateContent('heroMainLabel', e.target.value)}
                        placeholder="Keychain Custom Data Strava x Where Is It? 3D print Custom"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#44505C] mb-1">
                          Harga / Badge Kanan
                        </label>
                        <input
                          type="text"
                          value={content.heroMainPrice || 'Rp119.000'}
                          onChange={(e) => updateContent('heroMainPrice', e.target.value)}
                          placeholder="Rp119.000"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#44505C] mb-1">
                          Link Target Klik
                        </label>
                        <input
                          type="text"
                          value={content.heroMainLink || '/preorder/keychain-strava'}
                          onChange={(e) => updateContent('heroMainLink', e.target.value)}
                          placeholder="/preorder/keychain-strava"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Floating Action Cards (Shortcuts) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shortcut 1 */}
                <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ECE6DC]">
                    <span className="text-xs font-black text-[#14191F] uppercase tracking-wider">
                      Kartu Kanan Atas (Shortcut 1)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#14191F] text-white">
                      Top Right
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#44505C] mb-1">Judul Kartu</label>
                    <input
                      type="text"
                      value={content.heroShortcut1Title}
                      onChange={(e) => updateContent('heroShortcut1Title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                    />
                  </div>

                  <ImageUploadWithCompress
                    label="Upload / Ganti Foto Kartu 1"
                    helperText="Rekomendasi rasio 4:3"
                    value={content.heroShortcut1Image}
                    onChange={(url) => updateContent('heroShortcut1Image', url)}
                  />

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      { label: '05: Saku Celana (Default)', url: '/images/strava-keychain/keychain-05.jpg' },
                      { label: '04: 3D Printer', url: '/images/strava-keychain/keychain-04.jpg' },
                      { label: '06: Stasiun MRT', url: '/images/strava-keychain/keychain-06.jpg' },
                    ].map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => updateContent('heroShortcut1Image', p.url)}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                          content.heroShortcut1Image === p.url
                            ? 'bg-[#14191F] text-white border-[#14191F]'
                            : 'bg-white text-[#556473] border-[#DDD5C7] hover:border-[#5C7489]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shortcut 2 */}
                <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ECE6DC]">
                    <span className="text-xs font-black text-[#14191F] uppercase tracking-wider">
                      Kartu Kanan Bawah (Shortcut 2)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#14191F] text-white">
                      Bottom Right
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#44505C] mb-1">Judul Kartu</label>
                    <input
                      type="text"
                      value={content.heroShortcut2Title}
                      onChange={(e) => updateContent('heroShortcut2Title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                    />
                  </div>

                  <ImageUploadWithCompress
                    label="Upload / Ganti Foto Kartu 2"
                    helperText="Rekomendasi rasio 4:3"
                    value={content.heroShortcut2Image}
                    onChange={(url) => updateContent('heroShortcut2Image', url)}
                  />

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      { label: '06: Stasiun MRT (Default)', url: '/images/strava-keychain/keychain-06.jpg' },
                      { label: 'Smart Cube Concept', url: '/images/coming-soon/smart-cube.jpg' },
                      { label: 'Sleep Lamp Infographic', url: '/images/coming-soon/sleep-lamp-pro-infographic.jpg' },
                      { label: 'Strava Lamp Concept', url: '/images/coming-soon/strava-route-lamp.jpg' },
                    ].map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => updateContent('heroShortcut2Image', p.url)}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                          content.heroShortcut2Image === p.url
                            ? 'bg-[#14191F] text-white border-[#14191F]'
                            : 'bg-white text-[#556473] border-[#DDD5C7] hover:border-[#5C7489]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* LIVE HERO VISUAL PREVIEW */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#14191F] text-white border border-[#232D37] shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#232D37]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8E9FAA]">
                    Live Visual Preview (Simulasi Tampilan Hero Homepage)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                    Real-time
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
                  {/* Center Main Preview */}
                  <div className="md:col-span-7 relative">
                    <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black shadow-xl border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={content.heroMainImage || '/images/strava-keychain/keychain-04.jpg'}
                        alt="Hero Main Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#14191F]/90 backdrop-blur-md text-white text-[10px] px-2.5 py-1.5 rounded-xl font-medium flex items-center justify-between border border-white/10">
                        <span className="truncate max-w-[160px]">
                          {content.heroMainLabel || 'Keychain Custom Data Strava x Where Is It? 3D print Custom'}
                        </span>
                        <span className="text-[#8BA1B4] font-mono shrink-0">
                          {content.heroMainPrice || 'Rp119.000'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Cards Preview */}
                  <div className="md:col-span-5 space-y-2.5">
                    <div className="p-2 rounded-xl bg-[#1E2630] border border-[#2B3743]">
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-1.5 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={content.heroShortcut1Image || '/images/strava-keychain/keychain-05.jpg'}
                          alt="Shortcut 1 Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-white px-1">
                        <span>{content.heroShortcut1Title || '3 Varian Pre-Order'}</span>
                        <span>→</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#1E2630] border border-[#2B3743]">
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-1.5 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={content.heroShortcut2Image || '/images/strava-keychain/keychain-06.jpg'}
                          alt="Shortcut 2 Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-white px-1">
                        <span>{content.heroShortcut2Title || 'Produk Segera Hadir'}</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* TAB 3: BESPOKE & CUSTOM */}
        {activeTab === 'custom' && (
          <div className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-8">
            <div className="border-b border-[#ECE6DC] pb-4">
              <h2 className="text-sm font-black text-[#14191F] uppercase tracking-wider">Layanan Kustom Studio</h2>
              <p className="text-xs text-[#7A8B99]">Atur judul dan penjelasan untuk Custom Design dan Keepsake Character.</p>
            </div>

            {/* Custom Design Consultation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5C7489]" />
                <h3 className="text-xs font-black text-[#14191F] uppercase tracking-wider">
                  01. Custom Design Consultation Section
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                    Tag Section
                  </label>
                  <input
                    type="text"
                    value={content.customDesignTag}
                    onChange={(e) => updateContent('customDesignTag', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                    Judul Section
                  </label>
                  <input
                    type="text"
                    value={content.customDesignTitle}
                    onChange={(e) => updateContent('customDesignTitle', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Deskripsi / Callout
                </label>
                <textarea
                  rows={3}
                  value={content.customDesignDescription}
                  onChange={(e) => updateContent('customDesignDescription', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] resize-none leading-relaxed"
                />
              </div>
            </div>

            <hr className="border-[#ECE6DC]" />

            {/* Custom Character Keepsakes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <h3 className="text-xs font-black text-[#14191F] uppercase tracking-wider">
                  02. Custom Keepsake Characters Section
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                    Tag Section
                  </label>
                  <input
                    type="text"
                    value={content.customCharacterTag}
                    onChange={(e) => updateContent('customCharacterTag', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                    Judul Section
                  </label>
                  <input
                    type="text"
                    value={content.customCharacterTitle}
                    onChange={(e) => updateContent('customCharacterTitle', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Deskripsi / Callout
                </label>
                <textarea
                  rows={3}
                  value={content.customCharacterDescription}
                  onChange={(e) => updateContent('customCharacterDescription', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT & IDENTITY */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-[#ECE6DC] pb-4">
              <h2 className="text-sm font-black text-[#14191F] uppercase tracking-wider">Studio Identity & Contact</h2>
              <p className="text-xs text-[#7A8B99]">Data kontak yang tampil pada Footer dan modul checkout.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                Tagline Toko
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                Alamat Fisik Studio / Workshop
              </label>
              <input
                type="text"
                value={settings.studioAddress}
                onChange={(e) => setSettings({ ...settings, studioAddress: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Email Kontak Studio
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Nomor WhatsApp Hotline
                </label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="bg-[#FAF8F5] rounded-2xl border border-[#ECE6DC] p-4 flex items-center justify-between">
          <p className="text-xs text-[#6C7E8E]">
            Semua perubahan konten disimpan ke database Supabase dan langsung terbit di website.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
