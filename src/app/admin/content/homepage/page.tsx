'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings, HomepageContent } from '@/types';
import { DEFAULT_HOMEPAGE_CONTENT } from '@/lib/studioDefaults';
import { Save, Eye, Layers, Sparkles, Building, Palette, Award, Phone } from 'lucide-react';
import ImageUploadWithCompress from '@/components/ui/ImageUploadWithCompress';
import { useToast } from '@/lib/toastContext';

type TabType = 'hero' | 'about' | 'custom' | 'standards' | 'contact';

export default function HomepageEditorPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetch('/api/settings')
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
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
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
    { id: 'hero', label: 'Hero & Shortcuts', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'about', label: '01/ About & Philosophy', icon: <Building className="w-4 h-4" /> },
    { id: 'custom', label: 'Bespoke Services', icon: <Palette className="w-4 h-4" /> },
    { id: 'standards', label: 'Studio Standards', icon: <Award className="w-4 h-4" /> },
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

            {/* Quick Navigation Cards */}
            <div className="pt-4 border-t border-[#ECE6DC]">
              <h3 className="text-xs font-black text-[#14191F] uppercase tracking-wider mb-4">
                Hero Floating Action Cards (Shortcuts)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-3">
                  <span className="text-[11px] font-bold text-[#5C7489] uppercase tracking-wider">Shortcut 1</span>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#44505C] mb-1">Judul Kartu</label>
                    <input
                      type="text"
                      value={content.heroShortcut1Title}
                      onChange={(e) => updateContent('heroShortcut1Title', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                    />
                  </div>
                  <div>
                    <ImageUploadWithCompress
                      label="Cover Foto Shortcut 1"
                      helperText="Auto-compress ke WebP/PNG"
                      value={content.heroShortcut1Image}
                      onChange={(url) => updateContent('heroShortcut1Image', url)}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-3">
                  <span className="text-[11px] font-bold text-[#5C7489] uppercase tracking-wider">Shortcut 2</span>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#44505C] mb-1">Judul Kartu</label>
                    <input
                      type="text"
                      value={content.heroShortcut2Title}
                      onChange={(e) => updateContent('heroShortcut2Title', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                    />
                  </div>
                  <div>
                    <ImageUploadWithCompress
                      label="Cover Foto Shortcut 2"
                      helperText="Auto-compress ke WebP/PNG"
                      value={content.heroShortcut2Image}
                      onChange={(url) => updateContent('heroShortcut2Image', url)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ABOUT & PHILOSOPHY */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-[#ECE6DC] pb-4">
              <h2 className="text-sm font-black text-[#14191F] uppercase tracking-wider">01/ Philosophy & Context</h2>
              <p className="text-xs text-[#7A8B99]">Bagian filosofi studio, ambience fisik showroom, dan foto taktil.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Tag Section
                </label>
                <input
                  type="text"
                  value={content.aboutSectionTag}
                  onChange={(e) => updateContent('aboutSectionTag', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Judul Utama
                </label>
                <input
                  type="text"
                  value={content.aboutTitle}
                  onChange={(e) => updateContent('aboutTitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                Lokasi / Studio Subtag
              </label>
              <input
                type="text"
                value={content.aboutLocationTag}
                onChange={(e) => updateContent('aboutLocationTag', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            {/* Photos Upload with Auto Compress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-3">
                <span className="text-[11px] font-bold text-[#5C7489] uppercase tracking-wider">
                  Showroom Architecture Photo
                </span>
                <ImageUploadWithCompress
                  label="Foto Fisik Studio & Storefront"
                  helperText="Format 4:3 direkomendasikan. Auto-compress aktif."
                  value={content.aboutStoreImage}
                  onChange={(url) => updateContent('aboutStoreImage', url)}
                />
                <div>
                  <label className="block text-[11px] font-semibold text-[#44505C] mb-1">Caption Foto Showroom</label>
                  <input
                    type="text"
                    value={content.aboutStoreCaption}
                    onChange={(e) => updateContent('aboutStoreCaption', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-3">
                <span className="text-[11px] font-bold text-[#5C7489] uppercase tracking-wider">
                  Tactile Detail Photo
                </span>
                <ImageUploadWithCompress
                  label="Foto Makro / Tekstur Layer Taktil"
                  helperText="Detail lapisan 0.12mm. Auto-compress aktif."
                  value={content.aboutDetailImage}
                  onChange={(url) => updateContent('aboutDetailImage', url)}
                />
                <div>
                  <label className="block text-[11px] font-semibold text-[#44505C] mb-1">Tag Spesifikasi Detail</label>
                  <input
                    type="text"
                    value={content.aboutDetailTag}
                    onChange={(e) => updateContent('aboutDetailTag', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>
            </div>

            {/* Editorial Story */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Paragraf Cerita 1
                </label>
                <textarea
                  rows={3}
                  value={content.aboutStoryP1}
                  onChange={(e) => updateContent('aboutStoryP1', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Paragraf Cerita 2
                </label>
                <textarea
                  rows={3}
                  value={content.aboutStoryP2}
                  onChange={(e) => updateContent('aboutStoryP2', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Core Pillars */}
            <div className="pt-4 border-t border-[#ECE6DC]">
              <h3 className="text-xs font-black text-[#14191F] uppercase tracking-wider mb-4">
                Pilar Nilai Studio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-2">
                  <label className="block text-[11px] font-bold text-[#44505C] uppercase">Pilar 1</label>
                  <input
                    type="text"
                    placeholder="Judul Pilar 1"
                    value={content.aboutPillar1Title}
                    onChange={(e) => updateContent('aboutPillar1Title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD5C7] text-xs font-bold focus:outline-none focus:border-[#5C7489]"
                  />
                  <input
                    type="text"
                    placeholder="Deskripsi Singkat"
                    value={content.aboutPillar1Desc}
                    onChange={(e) => updateContent('aboutPillar1Desc', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-2">
                  <label className="block text-[11px] font-bold text-[#44505C] uppercase">Pilar 2</label>
                  <input
                    type="text"
                    placeholder="Judul Pilar 2"
                    value={content.aboutPillar2Title}
                    onChange={(e) => updateContent('aboutPillar2Title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD5C7] text-xs font-bold focus:outline-none focus:border-[#5C7489]"
                  />
                  <input
                    type="text"
                    placeholder="Deskripsi Singkat"
                    value={content.aboutPillar2Desc}
                    onChange={(e) => updateContent('aboutPillar2Desc', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
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

        {/* TAB 4: STANDARDS & CRAFT */}
        {activeTab === 'standards' && (
          <div className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-[#ECE6DC] pb-4">
              <h2 className="text-sm font-black text-[#14191F] uppercase tracking-wider">Studio Craft & Infill Standards</h2>
              <p className="text-xs text-[#7A8B99]">Penjelasan standar teknis manufaktur presisi WhereIsIt.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Tag Section
                </label>
                <input
                  type="text"
                  value={content.studioStandardsTag}
                  onChange={(e) => updateContent('studioStandardsTag', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Judul Utama
                </label>
                <input
                  type="text"
                  value={content.studioStandardsTitle}
                  onChange={(e) => updateContent('studioStandardsTitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                Subjudul & Standar Craftsmanship
              </label>
              <textarea
                rows={3}
                value={content.studioStandardsSubtitle}
                onChange={(e) => updateContent('studioStandardsSubtitle', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT & IDENTITY */}
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
