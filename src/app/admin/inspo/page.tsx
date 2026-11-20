'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Lightbulb, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  Film, 
  MessageSquare, 
  Link2, 
  RefreshCw,
  AlertCircle,
  Share2,
  Bookmark
} from 'lucide-react';
import { InspoItem, InspoPlatform } from '@/types';
import { useToast } from '@/lib/toastContext';

const PLATFORM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  facebook: { bg: 'bg-[#1877F2]/10', text: 'text-[#1877F2]', label: 'Facebook' },
  threads: { bg: 'bg-black/10', text: 'text-black', label: 'Threads' },
  instagram: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Instagram' },
  youtube: { bg: 'bg-red-100', text: 'text-red-700', label: 'YouTube' },
  tiktok: { bg: 'bg-black/10', text: 'text-[#14191F]', label: 'TikTok' },
  pinterest: { bg: 'bg-red-50', text: 'text-red-600', label: 'Pinterest' },
  twitter: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'X / Twitter' },
  web: { bg: 'bg-[#EDF3F7]', text: 'text-[#5C7489]', label: 'Website' },
};

export default function InspoPage() {
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<InspoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state: ONLY Link and Notes
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [livePreview, setLivePreview] = useState<any>(null);

  // Filters & Search
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing notes state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotesText, setEditNotesText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInspo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inspo');
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data);
      }
    } catch (e) {
      console.error(e);
      showError('Gagal memuat daftar inspirasi produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspo();
  }, []);

  // When user pastes/types link, auto-fetch live preview
  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed || !trimmed.startsWith('http')) {
      setLivePreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      setFetchingPreview(true);
      try {
        const res = await fetch('/api/inspo/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setLivePreview(json.data);
        }
      } catch (err) {
        console.warn('Live preview fetch failed:', err);
      } finally {
        setFetchingPreview(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        url: url.trim(),
        notes: notes.trim(),
      };

      if (livePreview) {
        payload.title = livePreview.title;
        payload.description = livePreview.description;
        payload.imageUrl = livePreview.imageUrl;
        payload.platform = livePreview.platform;
        payload.favicon = livePreview.favicon;
        payload.siteName = livePreview.siteName;
      }

      const res = await fetch('/api/inspo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gagal menyimpan inspirasi');
      }

      showSuccess('Inspirasi produk berhasil disimpan!');
      setUrl('');
      setNotes('');
      setLivePreview(null);
      fetchInspo();
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus inspirasi ini dari katalog INSPO?')) return;
    try {
      const res = await fetch(`/api/inspo?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showSuccess('Inspirasi dihapus');
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      showError(err.message || 'Gagal menghapus');
    }
  };

  const handleSaveEditNotes = async (id: string) => {
    try {
      const res = await fetch('/api/inspo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          notes: editNotesText,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showSuccess('Catatan diperbarui');
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, notes: editNotesText } : i))
        );
        setEditingId(null);
      }
    } catch (err) {
      showError('Gagal memperbarui catatan');
    }
  };

  const handleCopyLink = (linkUrl: string, id: string) => {
    navigator.clipboard.writeText(linkUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedPlatform !== 'ALL' && item.platform !== selectedPlatform) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const noteMatch = (item.notes || '').toLowerCase().includes(q);
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const urlMatch = (item.url || '').toLowerCase().includes(q);
        return noteMatch || titleMatch || urlMatch;
      }
      return true;
    });
  }, [items, selectedPlatform, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Research &amp; R&amp;D</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Future Lineup
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
            INSPO — Ide Produk WhereIsIt
          </h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Simpan link inspirasi produk dari Facebook video, Threads, YouTube, Instagram, dan web untuk riset 3D print.
          </p>
        </div>

        <button
          onClick={fetchInspo}
          className="p-2 rounded-xl bg-white border border-[#DDD5C7] text-[#7A8B99] hover:text-[#14191F] transition-colors shadow-xs self-start sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick Add Form: Link & Notes Only */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE6DC] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#14191F]">
          <Sparkles className="w-4 h-4 text-[#5C7489]" />
          <span>Tambah Inspirasi Baru</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field 1: LINK */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider">
                1. Link Produk / Video *
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  required
                  placeholder="Paste link Facebook video, Threads post, YouTube, Instagram..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] transition-colors"
                />
              </div>
              <p className="text-[10px] text-[#7A8B99]">
                Mendukung Facebook video, Threads, YouTube Shorts, Instagram Reels, TikTok, Pinterest, web.
              </p>
            </div>

            {/* Field 2: NOTES */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider">
                2. Notes / Catatan Ide *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Tulis ide: misal 'Keychain model ini bisa dicetak multicolor dengan PETG, cocok buat pelari trail'..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Live Preview Snippet (if available) */}
          {fetchingPreview && (
            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#ECE6DC] flex items-center gap-2 text-xs text-[#7A8B99]">
              <div className="w-3.5 h-3.5 border-2 border-[#5C7489] border-t-transparent rounded-full animate-spin"></div>
              <span>Mengambil pratinjau thumbnail dari tautan...</span>
            </div>
          )}

          {livePreview && (
            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#ECE6DC] flex items-center gap-3 text-xs">
              {livePreview.imageUrl ? (
                <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-[#ECE6DC] shrink-0">
                  <Image src={livePreview.imageUrl} alt={livePreview.title || 'Preview'} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white border border-[#DDD5C7] flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5 text-[#5C7489]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C7489]">
                  Pratinjau {livePreview.platform?.toUpperCase()}
                </span>
                <p className="font-bold text-[#14191F] truncate">{livePreview.title}</p>
                {livePreview.description && (
                  <p className="text-[11px] text-[#7A8B99] line-clamp-1">{livePreview.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !url.trim()}
              className="px-6 py-3 rounded-2xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan Inspo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Simpan Inspo ke Koleksi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Platform Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#ECE6DC] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setSelectedPlatform('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedPlatform === 'ALL'
                ? 'bg-[#14191F] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#EFE9DF]'
            }`}
          >
            Semua ({items.length})
          </button>

          {['facebook', 'threads', 'youtube', 'instagram', 'tiktok', 'web'].map((p) => {
            const count = items.filter((i) => i.platform === p).length;
            if (count === 0 && selectedPlatform !== p) return null;
            const meta = PLATFORM_COLORS[p] || PLATFORM_COLORS.web;
            const isSelected = selectedPlatform === p;

            return (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#5C7489] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#EFE9DF]'
                }`}
              >
                <span>{meta.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#E5DFD4] text-[#14191F]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#7A8B99] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ide &amp; catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
          />
        </div>
      </div>

      {/* Inspo Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#ECE6DC] space-y-3">
          <Lightbulb className="w-10 h-10 mx-auto text-[#DDD5C7]" />
          <h3 className="text-base font-bold text-[#14191F]">Belum Ada Inspirasi yang Disimpan</h3>
          <p className="text-xs text-[#7A8B99] max-w-md mx-auto">
            Temukan produk menarik di Facebook, Threads, YouTube, atau Instagram, lalu paste tautannya di atas beserta catatan ide produk!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const platformMeta = PLATFORM_COLORS[item.platform] || PLATFORM_COLORS.web;
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#ECE6DC] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Media Thumbnail */}
                  <div className="relative w-full h-44 bg-[#FAF8F5] border-b border-[#ECE6DC] overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title || 'Inspiration preview'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#7A8B99] bg-radial from-[#F4F5F7] to-[#FAF8F5]">
                        <Film className="w-8 h-8 text-[#DDD5C7] mb-2" />
                        <span className="text-xs font-semibold">{item.siteName || platformMeta.label}</span>
                      </div>
                    )}

                    {/* Platform Badge overlay */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs ${platformMeta.bg} ${platformMeta.text} border border-white/40`}>
                        {platformMeta.label}
                      </span>
                    </div>

                    {/* Video play icon overlay for video platforms */}
                    {['facebook', 'youtube', 'tiktok', 'instagram'].includes(item.platform) && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/25 transition-colors group-hover:opacity-100"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/90 text-[#14191F] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <Film className="w-4 h-4 ml-0.5 text-[#5C7489]" />
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    {/* Title & Domain */}
                    <div>
                      <h4 className="font-bold text-xs text-[#14191F] line-clamp-1">
                        {item.title || 'Inspirasi Produk'}
                      </h4>
                      <p className="text-[10px] text-[#7A8B99] truncate font-mono mt-0.5">
                        {item.siteName || item.url.replace(/^https?:\/\//, '').split('/')[0]}
                      </p>
                    </div>

                    {/* Prominent Notes Box */}
                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-1">
                      <span className="text-[10px] font-bold text-[#5C7489] uppercase tracking-wider block">
                        Catatan Ide:
                      </span>
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={editNotesText}
                            onChange={(e) => setEditNotesText(e.target.value)}
                            className="w-full p-2 bg-white rounded-xl border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 text-[11px] font-semibold text-[#7A8B99]"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditNotes(item.id)}
                              className="px-3 py-1 bg-[#14191F] text-white rounded-lg text-[11px] font-bold"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#14191F] font-medium leading-relaxed">
                          {item.notes || 'Belum ada catatan.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-4 py-3 border-t border-[#ECE6DC] bg-[#FAF8F5] flex items-center justify-between text-xs">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[11px] text-[#5C7489] hover:underline flex items-center gap-1"
                  >
                    <span>Buka Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyLink(item.url, item.id)}
                      className="p-1.5 rounded-lg text-[#7A8B99] hover:text-[#14191F] hover:bg-white transition-colors"
                      title="Salin Link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditNotesText(item.notes);
                      }}
                      className="p-1.5 rounded-lg text-[#7A8B99] hover:text-[#14191F] hover:bg-white transition-colors"
                      title="Edit Catatan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-[#7A8B99] hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus Inspo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
