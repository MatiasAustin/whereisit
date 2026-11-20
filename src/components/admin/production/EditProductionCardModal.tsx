'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle, ExternalLink, MessageCircle, Copy, Check } from 'lucide-react';
import { StravaPreOrder, ProductionBatch, StravaOrderStatus } from '@/types';

interface EditProductionCardModalProps {
  order: StravaPreOrder | null;
  isOpen: boolean;
  onClose: () => void;
  batches: ProductionBatch[];
  onSaved: () => void;
}

const ALL_STATUSES: StravaOrderStatus[] = [
  'Menunggu Pembayaran',
  'Dibayar — Data Belum Lengkap',
  'Data Diterima — Menunggu Konfirmasi Desain',
  'Desain Dikonfirmasi',
  'Produksi',
  'QC / Finishing',
  'Packing',
  'Dikirim',
  'Selesai',
];

export function EditProductionCardModal({
  order,
  isOpen,
  onClose,
  batches,
  onSaved,
}: EditProductionCardModalProps) {
  if (!isOpen || !order) return null;

  const [customerName, setCustomerName] = useState(order.customer.fullName);
  const [phone, setPhone] = useState(order.customer.phone);
  const [address, setAddress] = useState(order.customer.address);
  const [stravaUrl, setStravaUrl] = useState(order.stravaData?.stravaUrl || '');
  const [pace, setPace] = useState(order.stravaData?.pace || '');
  const [engravedText, setEngravedText] = useState(order.stravaData?.engravedText || '');
  const [batchName, setBatchName] = useState(order.production?.batchName || batches[0]?.name || 'Batch 1 — Reguler');
  const [scheduledDate, setScheduledDate] = useState(order.production?.scheduledDate || new Date().toISOString().split('T')[0]);
  const [assignedMachine, setAssignedMachine] = useState(order.production?.assignedMachine || 'Bambu Lab X1C');
  const [notes, setNotes] = useState(order.production?.internalAdminNotes || '');
  const [status, setStatus] = useState<StravaOrderStatus>(order.status);
  const [resiNumber, setResiNumber] = useState(order.production?.resiNumber || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    if (stravaUrl) {
      navigator.clipboard.writeText(stravaUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/production', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          status,
          batchName,
          scheduledDate,
          assignedMachine,
          internalAdminNotes: notes,
          productionUpdates: {
            resiNumber: resiNumber.trim(),
          },
          customer: {
            fullName: customerName.trim(),
            phone: phone.trim(),
            address: address.trim(),
          },
          stravaData: {
            stravaUrl: stravaUrl.trim(),
            pace: pace.trim(),
            engravedText: engravedText.trim(),
          },
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gagal menyimpan detail');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const waDigits = phone.replace(/\D/g, '');
  const waFormatted = waDigits.startsWith('0') ? '62' + waDigits.slice(1) : waDigits.startsWith('62') ? waDigits : '62' + waDigits;
  const waUrl = `https://wa.me/${waFormatted}?text=Halo%20${encodeURIComponent(customerName)},%20update%20pesanan%20Keychain%20Strava%20WhereIsIt%20kamu%20(${order.orderNumber}):%20`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-[#ECE6DC] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#ECE6DC] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#14191F]">#{order.orderNumber}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF3F7] text-[#5C7489]">
                {batchName}
              </span>
            </div>
            <p className="text-xs text-[#6C7E8E] mt-0.5">Detail Produksi &amp; Status Workshop</p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7A8B99] hover:text-[#14191F] hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Status selector */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ECE6DC]">
            <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1.5">
              Status Alur Produksi &amp; Order
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StravaOrderStatus)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#14191F] focus:outline-none focus:border-[#5C7489]"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Batch & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ECE6DC]">
            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Batch
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

          {/* Strava Link & Route Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#44505C] uppercase tracking-wider">
                Strava Route Link
              </label>
              {stravaUrl && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-[11px] text-[#5C7489] hover:underline flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
                  </button>
                  <a
                    href={stravaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#5C7489] hover:underline flex items-center gap-1"
                  >
                    <span>Buka Strava</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
            <input
              type="text"
              value={stravaUrl}
              onChange={(e) => setStravaUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono focus:outline-none focus:border-[#5C7489]"
              placeholder="https://strava.app.link/..."
            />
          </div>

          {/* Customer & Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Nama Pemesan / Alias
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-semibold focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Pace / EG / Metrik
              </label>
              <input
                type="text"
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Teks Grafir / Belakang
              </label>
              <input
                type="text"
                value={engravedText}
                onChange={(e) => setEngravedText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Nomor Resi Pengiriman
              </label>
              <input
                type="text"
                placeholder="cth: JP123456789"
                value={resiNumber}
                onChange={(e) => setResiNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Alamat Kirim
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
              Catatan Internal Produksi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#ECE6DC] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#556473] hover:bg-[#FAF8F5] transition-colors"
            >
              Tutup
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
