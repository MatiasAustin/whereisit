'use client';

import React, { useEffect, useState } from 'react';
import { PublicQueueItem, StravaOrderStatus } from '@/types';
import { Clock, Cpu, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface QueueStats {
  inQueue: number;
  inProduction: number;
  totalCompleted: number;
  avgLeadDays: number;
  defaultEstimatedDate: string;
  customNote: string;
}

interface ProductionQueueWidgetProps {
  currentOrderId?: string;
  showFullList?: boolean;
}

const STATUS_BADGES: Record<StravaOrderStatus, { label: string; bg: string; text: string; border: string }> = {
  'Menunggu Pembayaran': {
    label: 'Menunggu Bayar',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  'Dibayar — Data Belum Lengkap': {
    label: 'Data Belum Lengkap',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  'Data Diterima — Menunggu Konfirmasi Desain': {
    label: 'Review Desain 3D',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  'Desain Dikonfirmasi': {
    label: 'Siap Cetak',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
  },
  'Produksi': {
    label: 'Sedang Dicetak 3D',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
  },
  'QC / Finishing': {
    label: 'QC & Finishing',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
  },
  'Packing': {
    label: 'Packing',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  'Dikirim': {
    label: 'Dalam Pengiriman',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
  },
  'Selesai': {
    label: 'Selesai',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
  },
};

export default function ProductionQueueWidget({ currentOrderId, showFullList = true }: ProductionQueueWidgetProps) {
  const [queue, setQueue] = useState<PublicQueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/strava-orders/queue');
      const data = await res.json();
      if (data.success && data.data) {
        setQueue(data.data.queue);
        setStats(data.data.stats);
      }
    } catch (e) {
      console.error('Failed to load queue:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div className="w-full bg-white rounded-3xl border border-[#ECE6DC] shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EBE3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Live Studio Stream</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#14191F] tracking-tight">
            Antrian Produksi Saat Ini
          </h3>
          <p className="text-xs text-[#556473]">
            Transparansi proses cetak 3D di workshop WhereIsIt. Diperbarui setiap perubahan status.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EDE4] text-[#44505C] text-xs font-semibold border border-[#E8E2D7] transition-colors self-start sm:self-auto"
          title="Refresh Antrian"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7]">
          <div className="flex items-center justify-between text-[#7A8B99] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total PO Antrian</span>
            <Layers className="w-4 h-4 text-[#5C7489]" />
          </div>
          <div className="text-2xl font-black text-[#14191F]">
            {stats?.inQueue ?? (loading ? '...' : 0)}
          </div>
          <span className="text-[10px] text-[#7A8B99]">pesanan aktif</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#EDF3F7] border border-[#C5D5E2]">
          <div className="flex items-center justify-between text-[#5C7489] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sedang Dicetak 3D</span>
            <Cpu className="w-4 h-4 text-[#5C7489]" />
          </div>
          <div className="text-2xl font-black text-[#3E5161]">
            {stats?.inProduction ?? (loading ? '...' : 0)}
          </div>
          <span className="text-[10px] text-[#5C7489]">di mesin print saat ini</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7]">
          <div className="flex items-center justify-between text-[#7A8B99] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Estimasi Siap</span>
            <Clock className="w-4 h-4 text-[#5C7489]" />
          </div>
          <div className="text-sm font-bold text-[#14191F] truncate">
            {stats?.defaultEstimatedDate ?? '5-7 hari kerja'}
          </div>
          <span className="text-[10px] text-[#7A8B99]">tergantung antrian</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7]">
          <div className="flex items-center justify-between text-[#7A8B99] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Standar PO</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-[#14191F]">
            Maks. 10 Hari
          </div>
          <span className="text-[10px] text-[#7A8B99]">sesuai batas Shopee</span>
        </div>
      </div>

      {/* Note about admin editable lead time */}
      {stats?.customNote && (
        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D7] text-xs text-[#556473] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#5C7489] flex-shrink-0" />
          <span><strong>Catatan Studio:</strong> {stats.customNote}</span>
        </div>
      )}

      {/* Queue Table */}
      {showFullList && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-[#7A8B99] px-1 font-medium">
            <span>Daftar Pesanan dalam Proses</span>
            <span className="text-[11px] text-[#8E9FAA]">Data pribadi & rute disembunyikan demi privasi</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#ECE6DC]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
                <tr>
                  <th className="px-4 py-3">Posisi</th>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Pemesan</th>
                  <th className="px-4 py-3">Variasi</th>
                  <th className="px-4 py-3">Tahap Produksi</th>
                  <th className="px-4 py-3 text-right">Target Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE3]">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#7A8B99]">
                      Belum ada pesanan aktif dalam antrian cetak saat ini.
                    </td>
                  </tr>
                ) : (
                  queue.map((item, idx) => {
                    const badge = STATUS_BADGES[item.status] || {
                      label: item.status,
                      bg: 'bg-gray-100',
                      text: 'text-gray-800',
                      border: 'border-gray-200',
                    };

                    const isTargetOrder = currentOrderId && item.id.includes(currentOrderId.slice(-4));

                    return (
                      <tr
                        key={item.id + idx}
                        className={`transition-colors ${
                          isTargetOrder ? 'bg-[#EDF3F7] font-semibold' : 'hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <td className="px-4 py-3.5 font-bold text-[#5C7489]">
                          #{item.queuePosition || idx + 1}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-[#14191F]">
                          {item.id}
                          {item.isExample && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-sans font-bold">
                              Contoh Uji Coba
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-[#14191F]">
                          {item.maskedName}
                        </td>

                        <td className="px-4 py-3.5 text-[#556473]">
                          {item.variationName}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right text-[#7A8B99] font-medium">
                          {item.estimatedDate || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
