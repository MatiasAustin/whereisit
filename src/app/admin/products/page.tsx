'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, ProductCategory } from '@/types';
import { formatRupiah, formatUSD } from '@/lib/utils';
import ProductFormModal from '@/components/admin/ProductFormModal';
import { useToast } from '@/lib/toastContext';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star,
  ExternalLink,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Eye,
  RefreshCw
} from 'lucide-react';

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Small Furniture',
  'Desk Objects',
  'Home & Decor',
  'Character & Collectibles',
];

type StatusFilter = 'ALL' | 'ACTIVE' | 'DRAFT' | 'FEATURED' | 'LOW_STOCK';

export default function AdminProductsPage() {
  const { showSuccess, showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<'All' | ProductCategory>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus "${name}" dari katalog studio WhereIsIt?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showSuccess(`Produk "${name}" berhasil dihapus.`);
      } else {
        showError('Gagal menghapus produk.');
      }
    } catch (e) {
      showError('Gagal menghapus produk.');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showSuccess(`Status "${product.name}" diubah menjadi ${nextStatus}. ${nextStatus === 'ACTIVE' ? 'Kini tampil di website!' : 'Kini disembunyikan dari publik.'}`);
        fetchProducts();
      } else {
        showError('Gagal mengubah status produk.');
      }
    } catch (e) {
      showError('Gagal mengubah status produk.');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    const nextFeatured = !product.featured;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: nextFeatured }),
      });
      if (res.ok) {
        showSuccess(
          nextFeatured
            ? `★ "${product.name}" kini menjadi objek featured di Hero Section halaman utama!`
            : `Objek "${product.name}" dicopot dari featured hero.`
        );
        fetchProducts();
      } else {
        showError('Gagal memperbarui status featured.');
      }
    } catch (e) {
      showError('Gagal memperbarui status featured.');
    }
  };

  // KPI Calculations
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === 'ACTIVE').length;
  const draftCount = products.filter((p) => p.status !== 'ACTIVE').length;
  const featuredProduct = products.find((p) => p.featured && p.status === 'ACTIVE') || products.find((p) => p.featured);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  // Filtered List
  const filtered = products.filter((p) => {
    // Category match
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;

    // Status match
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = p.status === 'ACTIVE';
    if (statusFilter === 'DRAFT') matchesStatus = p.status !== 'ACTIVE';
    if (statusFilter === 'FEATURED') matchesStatus = Boolean(p.featured);
    if (statusFilter === 'LOW_STOCK') matchesStatus = p.stock <= 5;

    // Search match
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.materials.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Catalog Management</span>
          <h1 className="text-2xl font-black text-[#14191F]">All 3D Products</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Kelola katalog objek 3D printed, resep material, harga, dan integrasi tampilan website publik.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#5C7489] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat Website</span>
            <ExternalLink className="w-3 h-3 text-[#7A8B99]" />
          </Link>

          <Link
            href="/admin/products/inventory"
            className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors"
          >
            Manage Inventory
          </Link>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Card 1: Total */}
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'ALL' ? 'bg-white border-[#5C7489] shadow-sm' : 'bg-[#FAF8F5] border-[#E8E2D7] hover:bg-white'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-[#7A8B99]">Total Catalog</span>
          <div className="text-2xl font-black text-[#14191F] mt-1">{totalCount}</div>
          <span className="text-[10px] text-[#556473]">All studio items</span>
        </div>

        {/* Card 2: Active */}
        <div 
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'ACTIVE' ? 'bg-white border-emerald-500 shadow-sm' : 'bg-[#FAF8F5] border-[#E8E2D7] hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800">Active Live</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</div>
          <span className="text-[10px] text-[#556473]">Tampil di website</span>
        </div>

        {/* Card 3: Draft */}
        <div 
          onClick={() => setStatusFilter('DRAFT')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'DRAFT' ? 'bg-white border-amber-500 shadow-sm' : 'bg-[#FAF8F5] border-[#E8E2D7] hover:bg-white'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-amber-800">Drafts</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{draftCount}</div>
          <span className="text-[10px] text-[#556473]">Disembunyikan</span>
        </div>

        {/* Card 4: Hero Featured */}
        <div 
          onClick={() => setStatusFilter('FEATURED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'FEATURED' ? 'bg-white border-[#5C7489] shadow-sm' : 'bg-[#FAF8F5] border-[#E8E2D7] hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#5C7489]">Hero Centerpiece</span>
            <Sparkles className="w-3 h-3 text-[#5C7489]" />
          </div>
          <div className="text-sm font-bold text-[#14191F] mt-1.5 truncate" title={featuredProduct?.name}>
            {featuredProduct?.name || 'Belum dipilih'}
          </div>
          <span className="text-[10px] text-[#556473]">Visual utama depan</span>
        </div>

        {/* Card 5: Low Stock */}
        <div 
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'LOW_STOCK' ? 'bg-white border-red-500 shadow-sm' : 'bg-[#FAF8F5] border-[#E8E2D7] hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-red-700">Low Stock</span>
            <AlertTriangle className="w-3 h-3 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 mt-1">{lowStockCount}</div>
          <span className="text-[10px] text-[#556473]">≤ 5 unit tersisa</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
        
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#ECE6DC] space-y-3">
          {/* Top row: Status Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'ALL' ? 'bg-[#14191F] text-white shadow-xs' : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#ECE6DC]'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'ACTIVE' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-[#FAF8F5] text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('DRAFT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'DRAFT' ? 'bg-amber-600 text-white shadow-xs' : 'bg-[#FAF8F5] text-amber-800 hover:bg-amber-50'
                }`}
              >
                Drafts ({draftCount})
              </button>
              <button
                onClick={() => setStatusFilter('FEATURED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'FEATURED' ? 'bg-[#5C7489] text-white shadow-xs' : 'bg-[#FAF8F5] text-[#5C7489] hover:bg-[#EDF3F7]'
                }`}
              >
                ★ Hero Featured
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by title, material, slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          {/* Bottom row: Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-[#F0EBE3]">
            <span className="text-[11px] font-bold text-[#7A8B99] mr-1 shrink-0">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCat === cat
                    ? 'bg-[#5C7489] text-white'
                    : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#ECE6DC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
              <tr>
                <th className="px-5 py-3.5">Object & Silhouette</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Badge</th>
                <th className="px-5 py-3.5">Stock</th>
                <th className="px-5 py-3.5 text-center">Hero Star</th>
                <th className="px-5 py-3.5">Storefront Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  {/* Silhouette + Title */}
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F2EDE4] shrink-0 border border-[#E5DFD4]">
                      <Image src={p.images?.[0] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80'} alt={p.name} fill className="object-cover" />
                      {p.images && p.images.length > 1 && (
                        <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                          {p.images.length}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                      <p className="font-bold text-[#14191F] truncate">{p.name}</p>
                      <p className="text-[11px] text-[#7A8B99] truncate font-mono">slug: /{p.slug}</p>
                      <p className="text-[10px] text-[#8E9FAA] truncate">{p.materials}</p>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3.5 font-medium text-[#44505C]">
                    <span className="px-2.5 py-1 rounded-md bg-[#F2EDE4] text-[#14191F] text-[11px] font-semibold">
                      {p.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-3.5 font-black text-[#14191F]">
                    {formatRupiah(p.price)}
                    {p.compareAtPrice && (
                      <span className="block text-[10px] font-normal text-[#8E9FAA] line-through">
                        {formatRupiah(p.compareAtPrice)}
                      </span>
                    )}
                    <span className="block text-[10px] font-normal text-[#7A8B99]">{formatUSD(p.price)}</span>
                  </td>

                  {/* Badge */}
                  <td className="px-5 py-3.5">
                    {p.badge ? (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#EDF3F7] text-[#5C7489] border border-[#D5E1E9]">
                        {p.badge}
                      </span>
                    ) : (
                      <span className="text-[#8E9FAA]">-</span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-5 py-3.5 font-medium">
                    {p.stock <= 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span>0 (Sold Out)</span>
                      </span>
                    ) : p.stock <= 5 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>{p.stock} units</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#44505C]">
                        <span>{p.stock} units</span>
                      </span>
                    )}
                  </td>

                  {/* Hero Star Button */}
                  <td className="px-5 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(p)}
                      title={p.featured ? 'Featured on Hero (Click to remove)' : 'Click to set as Hero Centerpiece'}
                      className={`p-1.5 rounded-lg transition-all ${
                        p.featured
                          ? 'bg-amber-100 text-amber-600 shadow-xs ring-1 ring-amber-300'
                          : 'text-[#C4BDB0] hover:text-amber-500 hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggleStatus(p)}
                      title="Klik untuk mengubah status tampil di website"
                      className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all border ${
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {p.status === 'ACTIVE' ? '✓ ACTIVE (Live)' : 'DRAFT (Hidden)'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right space-x-1">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-[#5C7489] hover:bg-[#EDF3F7] transition-colors"
                      title="Edit Product Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-[#7A8B99] space-y-2">
              <Package className="w-8 h-8 text-[#DDD5C7] mx-auto mb-1" />
              <p className="font-semibold text-xs text-[#14191F]">No products found</p>
              <p className="text-[11px] text-[#8E9FAA]">Tidak ada produk yang cocok dengan filter atau kata kunci pencarian.</p>
            </div>
          )}
        </div>

      </div>

      {/* Edit/Add Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchProducts}
      />

    </div>
  );
}
