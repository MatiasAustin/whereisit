'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { JournalArticle } from '@/types';
import { FileText, Plus, Edit2, Trash2, BookOpen, X, Check, Eye, ExternalLink } from 'lucide-react';
import ImageUploadWithCompress from '@/components/ui/ImageUploadWithCompress';
import { useToast } from '@/lib/toastContext';

export default function BlogAdminPage() {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<JournalArticle | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'WhereIsIt Studio',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
  });

  const { showSuccess, showError } = useToast();

  const loadArticles = () => {
    fetch('/api/journal')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setArticles(d.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load articles:', err);
        showError('Gagal memuat artikel studio journal.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const openCreateModal = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: 'Austin Matias, Design Lead',
      coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
      status: 'PUBLISHED',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (article: JournalArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      coverImage: article.coverImage,
      status: article.status,
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingArticle ? prev.slug : slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.excerpt.trim()) {
      showError('Judul dan ringkasan artikel wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      if (editingArticle) {
        // Update existing article
        const res = await fetch('/api/journal', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingArticle.id,
            ...formData,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showSuccess(`Artikel "${formData.title}" berhasil diperbarui!`);
          setIsModalOpen(false);
          loadArticles();
        } else {
          showError(data.error || 'Gagal memperbarui artikel.');
        }
      } else {
        // Create new article
        const res = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showSuccess(`Artikel baru "${formData.title}" berhasil dipublikasikan!`);
          setIsModalOpen(false);
          loadArticles();
        } else {
          showError(data.error || 'Gagal menambahkan artikel.');
        }
      }
    } catch (err) {
      showError('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"?`)) return;

    try {
      const res = await fetch(`/api/journal?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(`Artikel "${title}" telah dihapus.`);
        loadArticles();
      } else {
        showError(data.error || 'Gagal menghapus artikel.');
      }
    } catch (err) {
      showError('Terjadi kesalahan saat menghapus.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Editorial Publications</span>
          <h1 className="text-2xl font-black text-[#14191F]">Studio Journal & Stories</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Publikasikan riset bio-polimer, computational design, dan behind-the-scenes pembuatan karya 3D.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-all flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Artikel Baru</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#5C7489] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#7A8B99] font-medium">Memuat artikel journal...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#ECE6DC] p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-[#5C7489] mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-[#14191F]">Belum ada artikel yang dipublikasikan</h3>
          <p className="text-xs text-[#7A8B99] max-w-sm mx-auto">
            Mulai tulis esai desain industri dan dokumentasi material studio untuk pengunjung storefront.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-all"
          >
            Tulis Artikel Pertama
          </button>
        </div>
      ) : (
        /* Articles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-3xl border border-[#ECE6DC] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#F2EDE4] mb-4 border border-[#E5DFD4]">
                  <Image src={art.coverImage} alt={art.title} fill className="object-cover" />
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      art.status === 'PUBLISHED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {art.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#7A8B99] mb-1.5">
                  <span className="font-semibold text-[#5C7489]">{art.author}</span>
                  <span>•</span>
                  <span>{new Date(art.publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>

                <h3 className="text-base font-bold text-[#14191F] leading-snug line-clamp-2">{art.title}</h3>
                <p className="text-xs text-[#556473] mt-2 leading-relaxed line-clamp-3">
                  {art.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#ECE6DC] flex items-center justify-between text-xs">
                <span className="text-[#7A8B99] font-mono text-[11px]">slug: /{art.slug}</span>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEditModal(art)}
                    className="font-bold text-[#5C7489] hover:text-[#14191F] flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(art.id, art.title)}
                    className="font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#ECE6DC] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#ECE6DC] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C7489]">
                  {editingArticle ? 'Edit Article' : 'Create Article'}
                </span>
                <h2 className="text-xl font-black text-[#14191F]">
                  {editingArticle ? 'Edit Studio Journal' : 'Tulis Artikel Baru'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#7A8B99] hover:text-[#14191F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Judul Artikel *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Contoh: The Tactility of Bio-Polymers in High-End Living Spaces"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-medium focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="tactility-bio-polymers"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                    Penulis (Author)
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Austin Matias, Design Lead"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Status Publikasi
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'PUBLISHED' | 'DRAFT' })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                >
                  <option value="PUBLISHED">PUBLISHED (Tampil di storefront)</option>
                  <option value="DRAFT">DRAFT (Disimpan sementara)</option>
                </select>
              </div>

              <div>
                <ImageUploadWithCompress
                  label="Cover Foto Artikel (Auto-Compress)"
                  helperText="Format 16:9 disarankan. Otomatis dikompresi sebelum disimpan."
                  value={formData.coverImage}
                  onChange={(url) => setFormData({ ...formData, coverImage: url })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Ringkasan / Excerpt *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu preview di halaman depan..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                  Konten Lengkap Artikel
                </label>
                <textarea
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tulis narasi lengkap, metodologi cetak, atau filosofi studio..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-[#ECE6DC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] text-xs font-bold text-[#556473] hover:bg-[#FAF8F5]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Menyimpan...' : editingArticle ? 'Perbarui Artikel' : 'Publikasikan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
