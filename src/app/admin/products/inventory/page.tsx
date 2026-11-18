'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, StravaPreOrder, StravaOrderStatus } from '@/types';
import { useToast } from '@/lib/toastContext';
import ProductFormModal from '@/components/admin/ProductFormModal';
import { 
  Package, 
  Search, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Minus,
  Printer,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';

const ACTIVE_QUEUE_STATUSES: StravaOrderStatus[] = [
  'Data Diterima — Menunggu Konfirmasi Desain',
  'Desain Dikonfirmasi',
  'Produksi',
  'QC / Finishing',
  'Packing',
];

export default function InventoryPage() {
  const { showSuccess, showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stravaOrders, setStravaOrders] = useState<StravaPreOrder[]>([]);
  const [stockChanges, setStockChanges] = useState<{ [id: string]: number }>({});
  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);

  // Edit/Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resOrders] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/strava-orders'),
      ]);

      const prodData = await resProd.json();
      if (prodData.success) {
        setProducts(prodData.data);
      }

      if (resOrders.ok) {
        const orderData = await resOrders.json();
        if (orderData.success) {
          setStravaOrders(orderData.data || []);
        }
      }
    } catch (e) {
      console.error(e);
      showError('Gagal memuat data produk & antrian');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStock = (p: Product) => {
    if (stockChanges[p.id] !== undefined) return stockChanges[p.id];
    return p.stock;
  };

  const handleStockDelta = (id: string, delta: number, currentStock: number) => {
    const current = stockChanges[id] !== undefined ? stockChanges[id] : currentStock;
    const nextVal = Math.max(0, current + delta);
    setStockChanges((prev) => ({ ...prev, [id]: nextVal }));
  };

  const handleSaveStock = async (p: Product) => {
    const newStock = stockChanges[p.id];
    if (newStock === undefined) return;

    setSavingId(p.id);
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.map((item) => (item.id === p.id ? { ...item, stock: newStock } : item)));
        setStockChanges((prev) => {
          const next = { ...prev };
          delete next[p.id];
          return next;
        });
        showSuccess(`Stok "${p.name}" diperbarui menjadi ${newStock} unit.`);
      } else {
        showError('Gagal memperbarui stok.');
      }
    } catch (e) {
      showError('Gagal memperbarui stok produk.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}" dari sistem studio WhereIsIt? Tindakan ini akan menghapusnya dari database.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess(`Produk "${name}" berhasil dihapus.`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        showError(data.error || 'Gagal menghapus produk.');
      }
    } catch {
      showError('Gagal menghapus produk.');
    }
  };

  const handlePurgeLegacy = async () => {
    if (!confirm('Bersihkan semua produk placeholder furniture/mainan lama dari database Supabase?')) return;
    setPurging(true);
    try {
      const res = await fetch('/api/products?action=purge-legacy', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess(data.message || 'Pembersihan produk placeholder berhasil.');
        await fetchData();
      } else {
        showError(data.error || 'Gagal membersihkan.');
      }
    } catch {
      showError('Gagal membersihkan produk placeholder.');
    } finally {
      setPurging(false);
    }
  };

  // Compute live queue mapping per variation and product
  const queueStats = useMemo(() => {
    const totalActiveOrders = stravaOrders.filter((o) => ACTIVE_QUEUE_STATUSES.includes(o.status));
    const printingOrders = stravaOrders.filter((o) => o.status === 'Produksi');
    const completedOrders = stravaOrders.filter((o) => o.status === 'Dikirim' || o.status === 'Selesai');

    // Count per variation name (case insensitive)
    const variationCounts: Record<string, { active: number; printing: number; completed: number }> = {};

    totalActiveOrders.forEach((o) => {
      const v = (o.variationName || '').trim();
      if (!variationCounts[v]) variationCounts[v] = { active: 0, printing: 0, completed: 0 };
      variationCounts[v].active += 1;
      if (o.status === 'Produksi') {
        variationCounts[v].printing += 1;
      }
    });

    completedOrders.forEach((o) => {
      const v = (o.variationName || '').trim();
      if (!variationCounts[v]) variationCounts[v] = { active: 0, printing: 0, completed: 0 };
      variationCounts[v].completed += 1;
    });

    return {
      totalActive: totalActiveOrders.length,
      totalPrinting: printingOrders.length,
      totalCompleted: completedOrders.length,
      variationCounts,
    };
  }, [stravaOrders]);

  const filtered = products.filter((p) => {
    const current = getStock(p);
    if (filterStock === 'IN_STOCK' && current <= 0) return false;
    if (filterStock === 'LOW_STOCK' && (current <= 0 || current > 5)) return false;
    if (filterStock === 'OUT_OF_STOCK' && current > 0) return false;

    if (search.trim()) {
      return (
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.colorOptions && p.colorOptions.some((c) => c.toLowerCase().includes(search.toLowerCase())))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Supply &amp; Production Sync</span>
          <h1 className="text-2xl font-black text-[#14191F]">Inventory &amp; 3D Print Queue</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Sinkronisasi stok fisik objek 3D dengan antrian cetak live dari pesanan pembeli.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Real-Time Sync KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#ECE6DC] shadow-xs">
          <div className="flex items-center justify-between text-[#7A8B99] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Produk Aktif</span>
            <Package className="w-4 h-4 text-[#5C7489]" />
          </div>
          <div className="text-2xl font-black text-[#14191F]">{products.length}</div>
          <span className="text-[10px] text-[#556473]">Objek di katalog studio</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#EDF3F7] border border-[#C5D5E2] shadow-xs">
          <div className="flex items-center justify-between text-[#3E5161] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Antrian Cetak Aktif</span>
            <Layers className="w-4 h-4 text-[#5C7489]" />
          </div>
          <div className="text-2xl font-black text-[#3E5161]">{queueStats.totalActive} PO</div>
          <Link href="/admin/orders" className="text-[10px] font-bold text-[#5C7489] hover:underline flex items-center gap-0.5">
            <span>Buka Antrian Produksi</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ECE6DC] shadow-xs">
          <div className="flex items-center justify-between text-[#7A8B99] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sedang Dicetak</span>
            <Printer className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{queueStats.totalPrinting} unit</div>
          <span className="text-[10px] text-[#556473]">Di workshop Karawang</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ECE6DC] shadow-xs">
          <div className="flex items-center justify-between text-[#7A8B99] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Selesai / Dikirim</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{queueStats.totalCompleted} PO</div>
          <span className="text-[10px] text-[#556473]">Fulfillment sukses</span>
        </div>
      </div>

      {/* Main Inventory & Queue Table Card */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-[#ECE6DC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari produk, variasi, atau spek..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterStock(mode)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filterStock === mode
                    ? 'bg-[#14191F] text-white'
                    : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#ECE6DC]'
                }`}
              >
                {mode === 'ALL' ? 'Semua' : mode.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
              <tr>
                <th className="px-6 py-3.5">Produk &amp; Silhouette</th>
                <th className="px-6 py-3.5">Kategori &amp; Spek Layer</th>
                <th className="px-6 py-3.5">Buffer Stok</th>
                <th className="px-6 py-3.5">Penyesuaian Stok</th>
                <th className="px-6 py-3.5">Sinkronisasi Antrian Produksi</th>
                <th className="px-6 py-3.5 text-right">Kelola Produk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#7A8B99]">
                    Memuat inventaris dan antrian produksi...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#7A8B99]">
                    Tidak ada produk yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const currentStock = getStock(p);
                  const isModified = stockChanges[p.id] !== undefined;

                  // Calculate active orders in queue for this product's variations
                  const isKeychainProduct = p.slug === 'keychain-strava' || p.tags.includes('strava');
                  const productActiveQueue = isKeychainProduct ? queueStats.totalActive : 0;
                  const productPrinting = isKeychainProduct ? queueStats.totalPrinting : 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Product Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F2EDE4] shrink-0 border border-[#E5DFD4]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.images[0] || '/images/strava-keychain/keychain-04.jpg'}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-[#14191F] text-sm leading-snug">{p.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[#5C7489] font-bold">
                                Rp{p.price.toLocaleString('id-ID')}
                              </span>
                              <span className="text-[10px] text-[#7A8B99]">
                                • {p.weight || '45g'}
                              </span>
                              {p.badge && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#EDF3F7] text-[#5C7489] font-bold uppercase">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Breakdown of registered variations */}
                        {p.colorOptions && p.colorOptions.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-[#F0EBE3] flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E9FAA]">
                              Variasi ({p.colorOptions.length}):
                            </span>
                            {p.colorOptions.map((opt) => {
                              const varActiveCount = queueStats.variationCounts[opt]?.active || 0;
                              return (
                                <span
                                  key={opt}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#DDD5C7] text-[10px] text-[#44505C]"
                                >
                                  <strong>{opt}</strong>
                                  {varActiveCount > 0 && (
                                    <span className="px-1 rounded bg-[#5C7489] text-white text-[9px] font-bold" title="PO Aktif di antrian">
                                      {varActiveCount} PO
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Category & Layer Spec */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#DDD5C7] text-[10px] font-semibold text-[#44505C]">
                            {p.category}
                          </span>
                          <p className="font-mono text-[11px] text-[#5C7489] pt-1">
                            {p.layerResolution || '0.12mm Topografi 3D'}
                          </p>
                          <p className="text-[10px] text-[#7A8B99] truncate max-w-[180px]">
                            {p.materials}
                          </p>
                        </div>
                      </td>

                      {/* Available Stock */}
                      <td className="px-6 py-4 font-black">
                        <span className={currentStock <= 5 ? 'text-amber-600 font-bold text-sm' : 'text-[#14191F] text-sm'}>
                          {currentStock} units
                        </span>
                        <p className="text-[10px] text-[#7A8B99] font-normal">buffer siap rakit</p>
                      </td>

                      {/* Stock Stepper */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStockDelta(p.id, -1, p.stock)}
                            className="w-7 h-7 rounded-lg border border-[#DDD5C7] bg-white flex items-center justify-center font-bold text-[#44505C] hover:bg-[#FAF8F5]"
                            title="Kurang stok"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            value={currentStock}
                            onChange={(e) => setStockChanges({ ...stockChanges, [p.id]: Math.max(0, Number(e.target.value)) })}
                            className="w-14 text-center py-1 rounded-lg border border-[#DDD5C7] text-xs font-bold"
                          />

                          <button
                            onClick={() => handleStockDelta(p.id, 1, p.stock)}
                            className="w-7 h-7 rounded-lg border border-[#DDD5C7] bg-white flex items-center justify-center font-bold text-[#44505C] hover:bg-[#FAF8F5]"
                            title="Tambah stok"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isModified && (
                          <button
                            onClick={() => handleSaveStock(p)}
                            disabled={savingId === p.id}
                            className="mt-2 px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-xs inline-flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>{savingId === p.id ? 'Saving...' : 'Simpan Stok'}</span>
                          </button>
                        )}
                      </td>

                      {/* Live Antrian Produksi Sync Column */}
                      <td className="px-6 py-4">
                        {productActiveQueue > 0 ? (
                          <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDF3F7] border border-[#C5D5E2] text-[#3E5161] font-bold text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>{productActiveQueue} PO Dalam Antrian</span>
                            </div>
                            {productPrinting > 0 && (
                              <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                                <Printer className="w-3 h-3" />
                                <span>{productPrinting} unit sedang dicetak</span>
                              </p>
                            )}
                            <Link
                              href="/admin/orders"
                              className="text-[10px] font-bold text-[#5C7489] hover:underline flex items-center gap-1 pt-0.5"
                            >
                              <span>Buka Antrian Live</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Antrian Bersih (Siap Cetak)</span>
                            </span>
                            <p className="text-[10px] text-[#7A8B99]">Mesin standby untuk pesanan baru</p>
                          </div>
                        )}
                      </td>

                      {/* Action Column: Edit & Delete */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-white border border-[#DDD5C7] text-[#44505C] hover:text-[#14191F] hover:bg-[#FAF8F5] transition-colors"
                            title={`Edit "${p.name}"`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-2 rounded-xl bg-white border border-[#DDD5C7] text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title={`Hapus "${p.name}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Purge Helper */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#ECE6DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A8B99]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#5C7489] shrink-0" />
            <span>
              Perubahan stok atau status produk langsung tersinkronisasi dengan antrian produksi publik di <strong>/track</strong>.
            </span>
          </div>

          <button
            onClick={handlePurgeLegacy}
            disabled={purging}
            className="text-[11px] font-semibold text-[#5C7489] hover:text-red-600 transition-colors underline"
          >
            {purging ? 'Membersihkan...' : 'Bersihkan Produk Placeholder Lama'}
          </button>
        </div>

      </div>

      {/* Product Form Modal (For Edit and Add New Product) */}
      <ProductFormModal
        product={editingProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSaved={fetchData}
      />

    </div>
  );
}
