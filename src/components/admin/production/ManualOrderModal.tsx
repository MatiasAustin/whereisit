'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle, Check } from 'lucide-react';
import { ProductionBatch } from '@/types';

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: ProductionBatch[];
  onOrderCreated: () => void;
}

export function ManualOrderModal({
  isOpen,
  onClose,
  batches,
  onOrderCreated,
}: ManualOrderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [stravaUrl, setStravaUrl] = useState('');
  const [pace, setPace] = useState('05:30 /km');
  const [engravedText, setEngravedText] = useState('');
  const [batchName, setBatchName] = useState(batches[0]?.name || 'Batch 1 — Reguler');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedMachine, setAssignedMachine] = useState('Bambu Lab X1C');
  const [notes, setNotes] = useState('');
  const [initialStatus, setInitialStatus] = useState('Desain Dikonfirmasi');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      setErrorMsg('Nama pemesan dan nomor WhatsApp wajib diisi');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_item',
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          email: email.trim(),
          stravaUrl: stravaUrl.trim(),
          pace: pace.trim(),
          engravedText: engravedText.trim() || customerName.trim(),
          batchName,
          scheduledDate,
          assignedMachine,
          notes: notes.trim(),
          status: initialStatus,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gagal menambahkan pesanan');
      }

      onOrderCreated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-[#ECE6DC] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#ECE6DC] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#14191F] text-white flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#14191F]">Tambah Pesanan Manual ke Produksi</h2>
              <p className="text-xs text-[#6C7E8E]">Input orderan custom/offline &amp; langsung jadwalkan cetak</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A8B99] hover:text-[#14191F] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Nama Pemesan / Alias *
              </label>
              <input
                type="text"
                required
                placeholder="cth: Endy Hardjono"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                WhatsApp Pelanggan *
              </label>
              <input
                type="text"
                required
                placeholder="cth: 085706494674"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Strava Activity Link
              </label>
              <input
                type="text"
                placeholder="https://strava.app.link/..."
                value={stravaUrl}
                onChange={(e) => setStravaUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Pace / Metrik / EG
              </label>
              <input
                type="text"
                placeholder="cth: Pace 05:30 /km atau 21.1 km"
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ECE6DC]">
            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Batch Produksi
              </label>
              <select
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold focus:outline-none focus:border-[#5C7489]"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Jadwal Cetak
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Mesin 3D Printer
              </label>
              <select
                value={assignedMachine}
                onChange={(e) => setAssignedMachine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold focus:outline-none focus:border-[#5C7489]"
              >
                <option value="Bambu Lab X1C">Bambu Lab X1C</option>
                <option value="Bambu Lab P1S">Bambu Lab P1S</option>
                <option value="Bambu Lab A1 Mini">Bambu Lab A1 Mini</option>
                <option value="Creality K1 Max">Creality K1 Max</option>
                <option value="Workshop Shared">Workshop Shared</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Teks Grafir / Plaque Text
              </label>
              <input
                type="text"
                placeholder="Teks pada bagian belakang keychain"
                value={engravedText}
                onChange={(e) => setEngravedText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Kolom Awal
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-medium focus:outline-none focus:border-[#5C7489]"
              >
                <option value="Desain Dikonfirmasi">Siap Cetak / Terjadwal</option>
                <option value="Data Diterima — Menunggu Konfirmasi Desain">Antrian — Review Desain</option>
                <option value="Produksi">Langsung Cetak</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
              Alamat Pengiriman (Opsional)
            </label>
            <input
              type="text"
              placeholder="Alamat lengkap penerima..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
              Catatan Khusus Produksi
            </label>
            <textarea
              rows={2}
              placeholder="cth: Warna filament khusus, ring warna hitam, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#ECE6DC] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#556473] hover:bg-[#FAF8F5] transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Tambahkan ke Antrian Produksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
