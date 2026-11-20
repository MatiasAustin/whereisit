'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Plus, 
  FileSpreadsheet, 
  Settings, 
  Calendar, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Printer, 
  MessageCircle, 
  Filter,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { StravaPreOrder, ProductionBatch, StravaOrderStatus } from '@/types';
import { SheetImportModal } from '@/components/admin/production/SheetImportModal';
import { ManualOrderModal } from '@/components/admin/production/ManualOrderModal';
import { BatchManagerModal } from '@/components/admin/production/BatchManagerModal';
import { EditProductionCardModal } from '@/components/admin/production/EditProductionCardModal';
import { useToast } from '@/lib/toastContext';

type KanbanStageKey = 'QUEUE' | 'SCHEDULED' | 'PRINTING' | 'QC' | 'COMPLETED';

interface ColumnConfig {
  key: KanbanStageKey;
  title: string;
  subtitle: string;
  badgeColor: string;
  borderColor: string;
  nextStatus?: StravaOrderStatus;
  nextLabel?: string;
  prevStatus?: StravaOrderStatus;
}

const COLUMNS: ColumnConfig[] = [
  {
    key: 'QUEUE',
    title: 'Antrian & Review',
    subtitle: 'Data diterima / cek 3D',
    badgeColor: 'bg-amber-100 text-amber-800',
    borderColor: 'border-amber-200',
    nextStatus: 'Desain Dikonfirmasi',
    nextLabel: 'Siap Cetak →',
  },
  {
    key: 'SCHEDULED',
    title: 'Terjadwal & Siap Cetak',
    subtitle: 'Desain fix, masuk batch',
    badgeColor: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200',
    nextStatus: 'Produksi',
    nextLabel: 'Mulai Cetak →',
    prevStatus: 'Data Diterima — Menunggu Konfirmasi Desain',
  },
  {
    key: 'PRINTING',
    title: 'Sedang Dicetak',
    subtitle: 'Di mesin 3D printer',
    badgeColor: 'bg-purple-100 text-purple-800',
    borderColor: 'border-purple-200',
    nextStatus: 'QC / Finishing',
    nextLabel: 'Ke QC & Finish →',
    prevStatus: 'Desain Dikonfirmasi',
  },
  {
    key: 'QC',
    title: 'QC & Finishing',
    subtitle: 'Support remove & rakit ring',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    borderColor: 'border-indigo-200',
    nextStatus: 'Selesai',
    nextLabel: 'Selesai & Pack ✓',
    prevStatus: 'Produksi',
  },
  {
    key: 'COMPLETED',
    title: 'Selesai & Siap Kirim',
    subtitle: 'Siap dispatch / pickup',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    borderColor: 'border-emerald-200',
    prevStatus: 'QC / Finishing',
  },
];

function getStageForOrder(order: StravaPreOrder): KanbanStageKey {
  const status = order.status;
  if (['Menunggu Pembayaran', 'Dibayar — Data Belum Lengkap', 'Data Diterima — Menunggu Konfirmasi Desain'].includes(status)) {
    return 'QUEUE';
  }
  if (status === 'Desain Dikonfirmasi') {
    return 'SCHEDULED';
  }
  if (status === 'Produksi') {
    return 'PRINTING';
  }
  if (status === 'QC / Finishing') {
    return 'QC';
  }
  return 'COMPLETED';
}

export default function ProductionPage() {
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<StravaPreOrder[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Mobile active column selector
  const [mobileActiveColumn, setMobileActiveColumn] = useState<KanbanStageKey>('SCHEDULED');

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<StravaPreOrder | null>(null);

  // Copy tracking state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/production');
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data.stravaOrders || []);
        setBatches(json.data.batches || []);
      }
    } catch (e) {
      console.error(e);
      showError('Gagal memuat data antrian produksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Batch filter
      if (selectedBatchFilter !== 'ALL') {
        const orderBatch = order.production?.batchName || 'Batch 1 — Reguler';
        if (orderBatch !== selectedBatchFilter) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (order.customer?.fullName || '').toLowerCase();
        const phone = (order.customer?.phone || '').toLowerCase();
        const id = (order.id || '').toLowerCase();
        const orderNum = (order.orderNumber || '').toLowerCase();
        const invoice = (order.paymentDetails?.invoiceId || '').toLowerCase();
        const pace = (order.stravaData?.pace || '').toLowerCase();
        return (
          name.includes(q) ||
          phone.includes(q) ||
          id.includes(q) ||
          orderNum.includes(q) ||
          invoice.includes(q) ||
          pace.includes(q)
        );
      }

      return true;
    });
  }, [orders, selectedBatchFilter, searchQuery]);

  // Group by Stage
  const groupedOrders = useMemo(() => {
    const map: Record<KanbanStageKey, StravaPreOrder[]> = {
      QUEUE: [],
      SCHEDULED: [],
      PRINTING: [],
      QC: [],
      COMPLETED: [],
    };

    filteredOrders.forEach((o) => {
      const stage = getStageForOrder(o);
      map[stage].push(o);
    });

    return map;
  }, [filteredOrders]);

  // Counts by batch
  const orderCountsByBatch = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const bName = o.production?.batchName || 'Batch 1 — Reguler';
      counts[bName] = (counts[bName] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Quick 1-click status advance or back
  const handleMoveStatus = async (order: StravaPreOrder, targetStatus: StravaOrderStatus) => {
    setUpdatingId(order.id);
    try {
      const res = await fetch('/api/production', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          status: targetStatus,
          productionUpdates: {
            assignedMachine: order.production?.assignedMachine || 'Bambu Lab X1C',
          },
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gagal mengubah status');
      }

      // Optimistic local update
      setOrders((prev) =>
        prev.map((item) => (item.id === order.id ? { ...item, status: targetStatus } : item))
      );
      showSuccess(`Status ${order.customer.fullName} diupdate ke: ${targetStatus}`);
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Gagal mengubah status pesanan');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToColumn = (key: KanbanStageKey) => {
    setMobileActiveColumn(key);
    const el = columnRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Workshop Management</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Orders Sync Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
            3D Production Board
          </h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Atur antrian cetak 3D Keychain Strava, atur batch &amp; jadwal produksi, serta update status pesanan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBatchModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-[#5C7489]" />
            <span>Atur Batch &amp; Jadwal</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import Sheet</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Manual</span>
          </button>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-white border border-[#DDD5C7] text-[#7A8B99] hover:text-[#14191F] transition-colors shadow-xs"
            title="Refresh Antrian"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Batch Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE6DC] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Batch Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[11px] font-bold text-[#7A8B99] uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#5C7489]" />
              <span>Batch:</span>
            </span>

            <button
              onClick={() => setSelectedBatchFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                selectedBatchFilter === 'ALL'
                  ? 'bg-[#14191F] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#EFE9DF]'
              }`}
            >
              Semua Batch ({orders.length})
            </button>

            {batches.map((batch) => {
              const count = orderCountsByBatch[batch.name] || 0;
              const isSelected = selectedBatchFilter === batch.name;
              return (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatchFilter(batch.name)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#5C7489] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#EFE9DF]'
                  }`}
                >
                  <span>{batch.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#E5DFD4] text-[#14191F]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#7A8B99] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, WA, invoice, strava..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>
        </div>
      </div>

      {/* Mobile Column Quick Switcher */}
      <div className="flex md:hidden overflow-x-auto no-scrollbar gap-1.5 p-1 bg-white rounded-2xl border border-[#ECE6DC] sticky top-16 z-10 shadow-xs">
        {COLUMNS.map((col) => {
          const count = groupedOrders[col.key]?.length || 0;
          const isActive = mobileActiveColumn === col.key;
          return (
            <button
              key={col.key}
              onClick={() => scrollToColumn(col.key)}
              className={`flex-1 min-w-[100px] py-1.5 px-2 rounded-xl text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-[#14191F] text-white shadow-xs'
                  : 'text-[#6C7E8E] hover:bg-[#FAF8F5]'
              }`}
            >
              <span className="truncate">{col.title.split('&')[0]}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#14191F]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board Canvas */}
      <div className="overflow-x-auto pb-6 -mx-3 sm:mx-0 px-3 sm:px-0">
        <div className="flex gap-4 min-w-[1200px] snap-x snap-mandatory">
          {COLUMNS.map((col) => {
            const items = groupedOrders[col.key];

            return (
              <div
                key={col.key}
                ref={(el) => {
                  columnRefs.current[col.key] = el;
                }}
                className="flex-1 min-w-[280px] max-w-[340px] flex flex-col bg-[#F8F6F1] rounded-3xl border border-[#ECE6DC] shadow-xs snap-start"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-[#ECE6DC] bg-white rounded-t-3xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-[#14191F] tracking-tight">{col.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                        {items.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A8B99]">{col.subtitle}</p>
                  </div>
                </div>

                {/* Column Body / Cards List */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[72vh] min-h-[200px]">
                  {items.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-[#DDD5C7] text-xs text-[#7A8B99] flex flex-col items-center justify-center space-y-1">
                      <Inbox className="w-5 h-5 text-[#DDD5C7]" />
                      <span>Tidak ada pesanan di tahap ini</span>
                    </div>
                  ) : (
                    items.map((order) => {
                      const isUpdating = updatingId === order.id;
                      const waDigits = order.customer.phone.replace(/\D/g, '');
                      const waFormatted = waDigits.startsWith('0') ? '62' + waDigits.slice(1) : waDigits.startsWith('62') ? waDigits : '62' + waDigits;
                      const waUrl = `https://wa.me/${waFormatted}?text=Halo%20${encodeURIComponent(order.customer.fullName)},%20update%20pesanan%20whereisit%20kamu%20(${order.orderNumber}):%20`;
                      const stravaUrl = order.stravaData?.stravaUrl;

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl p-3.5 border border-[#ECE6DC] shadow-xs hover:shadow-md transition-all space-y-2.5 relative group"
                        >
                          {/* Card Header: Order ID & Batch Tag */}
                          <div className="flex items-center justify-between text-xs">
                            <button
                              onClick={() => handleCopyText(order.orderNumber || order.id, order.id)}
                              className="font-mono font-bold text-[11px] text-[#5C7489] hover:underline flex items-center gap-1"
                              title="Klik untuk salin Order ID"
                            >
                              <span>#{order.orderNumber}</span>
                              {copiedId === order.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-[#7A8B99]" />
                              )}
                            </button>

                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#ECE6DC] text-[#44505C]">
                                {order.production?.batchName || 'Batch 1'}
                              </span>
                            </div>
                          </div>

                          {/* Customer Name & WhatsApp */}
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-sm text-[#14191F] line-clamp-1 leading-snug">
                                {order.customer.fullName}
                              </h4>
                              {order.customer.phone && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 p-1 rounded-lg hover:bg-emerald-50 shrink-0"
                                  title="Chat via WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] text-[#7A8B99] line-clamp-1">
                              {order.customer.city || order.customer.address || 'Indonesia'}
                            </p>
                          </div>

                          {/* Strava Route & Metric Specs */}
                          <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#ECE6DC] text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#556473]">
                                {order.stravaData?.pace || 'Pace'}
                              </span>
                              {stravaUrl ? (
                                <div className="flex items-center gap-1.5 font-semibold text-[#5C7489]">
                                  <a
                                    href={stravaUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:underline flex items-center gap-0.5"
                                  >
                                    <span>Strava Link</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              ) : (
                                <span className="text-[10px] text-amber-600">No Link</span>
                              )}
                            </div>

                            {order.stravaData?.engravedText && (
                              <p className="text-[10px] text-[#7A8B99] font-mono truncate">
                                Grafir: &quot;{order.stravaData.engravedText}&quot;
                              </p>
                            )}

                            {order.paymentDetails?.invoiceId && (
                              <p className="text-[10px] text-[#7A8B99] font-mono truncate">
                                Inv: {order.paymentDetails.invoiceId}
                              </p>
                            )}
                          </div>

                          {/* Machine & Schedule Badge */}
                          <div className="flex items-center justify-between text-[10px] text-[#7A8B99] pt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-[#5C7489]" />
                              <span>{order.production?.scheduledDate || 'Jadwal -'}</span>
                            </span>
                            <span className="flex items-center gap-1 font-medium text-[#44505C]">
                              <Printer className="w-3 h-3 text-[#5C7489]" />
                              <span className="truncate max-w-[100px]">
                                {order.production?.assignedMachine || 'Bambu Lab'}
                              </span>
                            </span>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="pt-2 border-t border-[#F0EBE3] flex items-center justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingOrder(order)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#5C7489] hover:bg-[#FAF8F5] transition-colors"
                            >
                              Edit Detail
                            </button>

                            <div className="flex items-center gap-1">
                              {/* Move Back button */}
                              {col.prevStatus && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleMoveStatus(order, col.prevStatus!)}
                                  className="p-1 rounded-lg text-[#7A8B99] hover:text-[#14191F] hover:bg-[#FAF8F5] transition-colors disabled:opacity-50"
                                  title="Pindahkan ke kolom sebelumnya"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Advance Next button */}
                              {col.nextStatus && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleMoveStatus(order, col.nextStatus!)}
                                  className="px-3 py-1 rounded-lg bg-[#14191F] text-white text-[11px] font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50"
                                >
                                  {isUpdating ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <span>{col.nextLabel}</span>
                                  )}
                                </button>
                              )}

                              {col.key === 'COMPLETED' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Selesai</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub-modals */}
      <SheetImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        batches={batches}
        onImportSuccess={() => {
          showSuccess('Pesanan dari spreadsheet berhasil diimport ke antrian!');
          fetchData();
        }}
      />

      <ManualOrderModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        batches={batches}
        onOrderCreated={() => {
          showSuccess('Pesanan manual berhasil ditambahkan ke antrian!');
          fetchData();
        }}
      />

      <BatchManagerModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        batches={batches}
        orderCountsByBatch={orderCountsByBatch}
        onBatchUpdated={() => {
          showSuccess('Batch produksi berhasil diperbarui!');
          fetchData();
        }}
      />

      <EditProductionCardModal
        order={editingOrder}
        isOpen={Boolean(editingOrder)}
        onClose={() => setEditingOrder(null)}
        batches={batches}
        onSaved={() => {
          showSuccess('Detail produksi berhasil disimpan!');
          fetchData();
        }}
      />
    </div>
  );
}
