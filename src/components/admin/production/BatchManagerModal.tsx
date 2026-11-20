'use client';

import React, { useState } from 'react';
import { X, Layers, Plus, Calendar, Check, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { ProductionBatch } from '@/types';

interface BatchManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: ProductionBatch[];
  orderCountsByBatch: Record<string, number>;
  onBatchUpdated: () => void;
}

export function BatchManagerModal({
  isOpen,
  onClose,
  batches,
  orderCountsByBatch,
  onBatchUpdated,
}: BatchManagerModalProps) {
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchDate, setNewBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBatchNotes, setNewBatchNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_batch',
          name: newBatchName.trim(),
          scheduledDate: newBatchDate,
          notes: newBatchNotes.trim(),
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gagal membuat batch');
      }

      setNewBatchName('');
      setNewBatchNotes('');
      onBatchUpdated();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_batch',
          id,
          updates: { status },
        }),
      });
      onBatchUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!confirm('Yakin ingin menghapus batch ini? (Pesanan dalam batch tetap aman)')) return;
    try {
      await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_batch',
          id,
        }),
      });
      onBatchUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-[#ECE6DC] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#ECE6DC] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDF3F7] text-[#5C7489] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#14191F]">Kelola Batch &amp; Jadwal Produksi</h2>
              <p className="text-xs text-[#6C7E8E]">Atur grup pencetakan 3D per hari / kloter mesin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A8B99] hover:text-[#14191F] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Buat Batch Baru */}
          <form onSubmit={handleCreateBatch} className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ECE6DC] space-y-3">
            <span className="text-xs font-bold text-[#14191F] uppercase tracking-wider block">
              + Tambah Batch Baru
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#44505C] mb-1">Nama Batch *</label>
                <input
                  type="text"
                  required
                  placeholder="cth: Batch 2 — 21 Nov 2026"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#44505C] mb-1">Target Tanggal Cetak</label>
                <input
                  type="date"
                  value={newBatchDate}
                  onChange={(e) => setNewBatchDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-medium focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                placeholder="Catatan batch (opsional, cth: Kloter Marathon Jakarta)"
                value={newBatchNotes}
                onChange={(e) => setNewBatchNotes(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />

              <button
                type="submit"
                disabled={loading || !newBatchName.trim()}
                className="px-5 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Batch</span>
              </button>
            </div>
          </form>

          {/* List of Batches */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#14191F] uppercase tracking-wider block">
              Daftar Batch Aktif ({batches.length})
            </span>

            <div className="space-y-2">
              {batches.map((batch) => {
                const count = orderCountsByBatch[batch.name] || 0;
                return (
                  <div
                    key={batch.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#ECE6DC] hover:border-[#DDD5C7] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#14191F]">{batch.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF3F7] text-[#5C7489]">
                          {count} item pesanan
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[#7A8B99]">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-[#5C7489]" />
                          <span>{batch.scheduledDate || 'Belum dijadwalkan'}</span>
                        </span>
                        {batch.notes && <span>• {batch.notes}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={batch.status}
                        onChange={(e) => handleUpdateStatus(batch.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-colors ${
                          batch.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : batch.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="PLANNED">Terjadwal</option>
                        <option value="IN_PROGRESS">Sedang Berjalan</option>
                        <option value="COMPLETED">Selesai</option>
                      </select>

                      <button
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="p-1.5 rounded-lg text-[#7A8B99] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#ECE6DC] bg-[#FAF8F5] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
