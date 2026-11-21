'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, Check, AlertCircle, Upload, Info, AlertTriangle } from 'lucide-react';
import { ProductionBatch, StravaPreOrder, StravaOrderStatus } from '@/types';
import { 
  parseExcelOrCsvFile, 
  parseDelimitedText, 
  parsePreorderSheetGrid,
  ParsedPreorderRow,
  formatRupiah
} from '@/lib/preorderSheetParser';

interface SheetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: ProductionBatch[];
  onImportSuccess: () => void;
}

interface ParsedPostPaymentRow {
  name: string;
  stravaLink: string;
  paceEg: string;
  address: string;
  email: string;
  whatsapp: string;
  formSubmittedAt: string;
  invoiceNo: string;
  paymentStatus: string;
  paidAt: string;
}

export function SheetImportModal({
  isOpen,
  onClose,
  batches,
  onImportSuccess,
}: SheetImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>(
    batches[0]?.name || 'Batch 1 — Reguler'
  );
  const [newBatchName, setNewBatchName] = useState('');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [initialStatus, setInitialStatus] = useState<string>('Desain Dikonfirmasi');
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Format detection
  const [detectedFormat, setDetectedFormat] = useState<'PREORDER_21' | 'POST_PAYMENT_10' | 'UNKNOWN'>('UNKNOWN');
  const [postPaymentRows, setPostPaymentRows] = useState<ParsedPostPaymentRow[]>([]);
  const [preorderRows, setPreorderRows] = useState<ParsedPreorderRow[]>([]);
  const [skippedNonProductionCount, setSkippedNonProductionCount] = useState(0);

  if (!isOpen) return null;

  const processGridData = (grid: string[][]) => {
    if (!grid || grid.length === 0) {
      setPostPaymentRows([]);
      setPreorderRows([]);
      setDetectedFormat('UNKNOWN');
      setSkippedNonProductionCount(0);
      return;
    }

    const firstRow = grid[0] || [];
    const headerStr = firstRow.join(' ').toLowerCase();

    // Check if 21-column Preorder Sheet format
    const isPreorder21 = 
      headerStr.includes('tanggal order') || 
      headerStr.includes('dp dibayar') || 
      headerStr.includes('sisa bayar') ||
      headerStr.includes('varian / detail custom') ||
      firstRow.length >= 15;

    if (isPreorder21) {
      setDetectedFormat('PREORDER_21');
      const parsed = parsePreorderSheetGrid(grid);
      
      // CRITICAL PRODUCTION GUARD:
      // Orders on the Production page must enter production ONLY if their Status Order / Produksi 
      // is one of the production stages: Antri Produksi, Produksi, QC / Finishing, Siap Kirim, Dikirim, Selesai.
      // Orders with status 'Dibayar — Data Belum Lengkap' or 'Baru' must NEVER enter production!
      const PRODUCTION_ELIGIBLE_STATUSES = [
        'antri produksi',
        'produksi',
        'qc / finishing',
        'qc',
        'finishing',
        'siap kirim',
        'dikirim',
        'selesai'
      ];

      const eligible: ParsedPreorderRow[] = [];
      let skippedCount = 0;

      for (const row of parsed.rows) {
        const orderStatusLower = (row.statusOrderSheet || '').toLowerCase();
        const stageMappedLower = (row.adminStageMapped || '').toLowerCase();

        const isEligible = 
          PRODUCTION_ELIGIBLE_STATUSES.some((s) => orderStatusLower.includes(s)) &&
          stageMappedLower !== 'baru' &&
          stageMappedLower !== 'dibayar — data belum lengkap' &&
          stageMappedLower !== 'menunggu pembayaran';

        if (isEligible) {
          eligible.push(row);
        } else {
          skippedCount++;
        }
      }

      setPreorderRows(eligible);
      setSkippedNonProductionCount(skippedCount);
      setPostPaymentRows([]);
    } else {
      // 10-column Post-Payment form
      setDetectedFormat('POST_PAYMENT_10');
      setSkippedNonProductionCount(0);
      setPreorderRows([]);

      // Process post-payment rows
      let colMap: Record<string, number> = {};
      const hasHeader = firstRow.some(
        (c) =>
          c.toLowerCase().includes('name') ||
          c.toLowerCase().includes('alias') ||
          c.toLowerCase().includes('strava') ||
          c.toLowerCase().includes('pace') ||
          c.toLowerCase().includes('address') ||
          c.toLowerCase().includes('invoice') ||
          c.toLowerCase().includes('whatsapp')
      );

      let startIndex = 0;
      if (hasHeader) {
        startIndex = 1;
        firstRow.forEach((col, idx) => {
          const c = col.toLowerCase();
          if (c.includes('name') || c.includes('alias') || c.includes('pemesan')) colMap['name'] = idx;
          else if (c.includes('strava') || c.includes('link')) colMap['stravaLink'] = idx;
          else if (c.includes('pace') || c.includes('eg') || c.includes('race')) colMap['paceEg'] = idx;
          else if (c.includes('address') || c.includes('alamat')) colMap['address'] = idx;
          else if (c.includes('email')) colMap['email'] = idx;
          else if (c.includes('whatsapp') || c.includes('no hp') || c.includes('phone') || c.includes('wa')) colMap['whatsapp'] = idx;
          else if (c.includes('form') || c.includes('submit')) colMap['formSubmittedAt'] = idx;
          else if (c.includes('invoice') || c.includes('inv')) colMap['invoiceNo'] = idx;
          else if (c.includes('payment') || c.includes('bayar') || c.includes('status')) colMap['paymentStatus'] = idx;
          else if (c.includes('paid')) colMap['paidAt'] = idx;
        });
      }

      const rows: ParsedPostPaymentRow[] = [];
      for (let i = startIndex; i < grid.length; i++) {
        const parts = grid[i];
        if (!parts || parts.length === 0 || !parts.some((p) => p.trim())) continue;

        const name = colMap['name'] !== undefined ? parts[colMap['name']] : parts[0];
        const stravaLink = colMap['stravaLink'] !== undefined ? parts[colMap['stravaLink']] : parts[1];
        const paceEg = colMap['paceEg'] !== undefined ? parts[colMap['paceEg']] : parts[2];
        const address = colMap['address'] !== undefined ? parts[colMap['address']] : parts[3];
        const email = colMap['email'] !== undefined ? parts[colMap['email']] : parts[4];
        const whatsapp = colMap['whatsapp'] !== undefined ? parts[colMap['whatsapp']] : parts[5];
        const formSubmittedAt = colMap['formSubmittedAt'] !== undefined ? parts[colMap['formSubmittedAt']] : parts[6];
        const invoiceNo = colMap['invoiceNo'] !== undefined ? parts[colMap['invoiceNo']] : parts[7];
        const paymentStatus = colMap['paymentStatus'] !== undefined ? parts[colMap['paymentStatus']] : parts[8];
        const paidAt = colMap['paidAt'] !== undefined ? parts[colMap['paidAt']] : parts[9];

        if (name || whatsapp || stravaLink) {
          rows.push({
            name: name || 'Pelanggan Sheet',
            stravaLink: stravaLink || '',
            paceEg: paceEg || 'Pace',
            address: address || '',
            email: email || '',
            whatsapp: whatsapp || '',
            formSubmittedAt: formSubmittedAt || new Date().toISOString(),
            invoiceNo: invoiceNo || '',
            paymentStatus: paymentStatus || 'paid',
            paidAt: paidAt || new Date().toISOString(),
          });
        }
      }
      setPostPaymentRows(rows);
    }
  };

  const parsePastedData = (text: string) => {
    setRawText(text);
    setErrorMsg('');
    if (!text.trim()) {
      setPostPaymentRows([]);
      setPreorderRows([]);
      setDetectedFormat('UNKNOWN');
      setSkippedNonProductionCount(0);
      return;
    }
    const grid = parseDelimitedText(text);
    processGridData(grid);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    try {
      const grid = await parseExcelOrCsvFile(file);
      processGridData(grid);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membaca file spreadsheet.');
    }
  };

  const totalReadyCount = detectedFormat === 'PREORDER_21' ? preorderRows.length : postPaymentRows.length;

  const handleExecuteImport = async () => {
    if (totalReadyCount === 0) {
      setErrorMsg('Tidak ada baris yang valid untuk masuk produksi.');
      return;
    }

    setImporting(true);
    setErrorMsg('');

    const finalBatchName = (newBatchName.trim() || selectedBatch).trim();

    try {
      let ordersPayload: any[] = [];

      if (detectedFormat === 'PREORDER_21') {
        ordersPayload = preorderRows.map((row) => ({
          customer: {
            fullName: row.namaPemesan,
            phone: row.noWa,
            email: row.noWa ? `${row.noWa.replace(/\D/g, '')}@sheet.order` : 'order@whereisitofc.store',
            address: row.alamatPengiriman || 'Alamat dari spreadsheet',
            city: 'Indonesia',
          },
          variationId: row.variationId || 'var-57x94',
          variationName: row.variationName || row.varianRaw,
          qty: row.qty,
          unitPrice: row.hargaSatuan ?? 0,
          dpPaid: row.dpDibayar ?? 0,
          remainingBalance: row.sisaBayar ?? 0,
          price: row.hargaSatuan ?? 0,
          subtotal: row.totalHarga ?? 0,
          shippingFee: 0,
          total: row.totalHarga ?? 0,
          status: row.adminStageMapped as StravaOrderStatus,
          paymentMethod: row.channel || 'Spreadsheet Preorder',
          paymentVerified: row.statusPembayaran === 'Lunas',
          paymentDetails: {
            channel: row.channel,
            invoiceId: row.invoiceNo || undefined,
            paymentStatus: row.statusPembayaran,
            paidAt: row.statusPembayaran === 'Lunas' ? (row.tanggalOrderIso || new Date().toISOString()) : undefined,
          },
          stravaData: {
            stravaUrl: row.stravaUrl || '',
            images: ['/images/strava-keychain/keychain-04.jpg'],
            eventName: row.eventName || 'Strava Keychain Run',
            eventDate: row.tanggalOrderIso ? row.tanggalOrderIso.split('T')[0] : new Date().toISOString().split('T')[0],
            distance: row.distance || '10.0 km',
            pace: row.pace || 'Pace',
            duration: row.duration || '00:50:00',
            engravedText: row.keychainName || row.namaPemesan || '',
            adminNotes: row.catatan ? `Preorder Sheet: ${row.catatan}` : '',
            submittedAt: row.tanggalOrderIso || new Date().toISOString(),
          },
          production: {
            batchName: finalBatchName,
            scheduledDate,
            assignedMachine: 'Bambu Lab X1C',
            courier: row.metodePengiriman || 'JNE',
            trackingNumber: row.noResi || '',
            estimatedCompletionDate: row.estimasiSelesai || '',
            shippedAt: row.tanggalKirim || '',
            internalAdminNotes: `Imported to production from sheet. ${row.catatan || ''}`,
            confirmedAt: new Date().toISOString(),
          },
        }));
      } else {
        ordersPayload = postPaymentRows.map((row) => {
          const isPaid = (row.paymentStatus || '').toLowerCase().includes('paid');
          return {
            customer: {
              fullName: row.name,
              phone: row.whatsapp,
              email: row.email || `${row.whatsapp.replace(/\D/g, '')}@sheet.order`,
              address: row.address || 'Alamat dari spreadsheet',
              city: 'Indonesia',
            },
            stravaData: {
              stravaUrl: row.stravaLink,
              images: ['/images/strava-keychain/keychain-04.jpg'],
              eventName: 'Strava Keychain Run',
              eventDate: new Date().toISOString().split('T')[0],
              distance: '10.0 km',
              pace: row.paceEg || 'Pace',
              duration: '00:50:00',
              engravedText: row.name,
              adminNotes: `Sheet Import | Form: ${row.formSubmittedAt || '-'}`,
              submittedAt: row.formSubmittedAt || new Date().toISOString(),
            },
            price: 119000,
            subtotal: 119000,
            shippingFee: 0,
            total: 119000,
            status: initialStatus,
            paymentMethod: 'Sheet Import',
            paymentVerified: isPaid,
            paymentDetails: {
              channel: 'Google Sheet / Excel',
              invoiceId: row.invoiceNo || undefined,
              paidAt: row.paidAt || undefined,
            },
            production: {
              batchName: finalBatchName,
              scheduledDate,
              assignedMachine: 'Bambu Lab X1C',
              internalAdminNotes: `Imported from sheet. Invoice: ${row.invoiceNo || '-'}`,
              confirmedAt: new Date().toISOString(),
            },
          };
        });
      }

      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_sheet',
          orders: ordersPayload,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gagal mengimport pesanan ke antrian produksi');
      }

      onImportSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat import data produksi.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl border border-[#ECE6DC] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#ECE6DC] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDF3F7] text-[#5C7489] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C7489]">
                  Workshop Fulfillment
                </span>
                {detectedFormat === 'PREORDER_21' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Format Preorder Sheet (21 Kolom)
                  </span>
                )}
                {detectedFormat === 'POST_PAYMENT_10' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Format Post-Payment Form (10 Kolom)
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-[#14191F]">Import Orderan ke Jadwal Produksi</h2>
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Batch & Schedule Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#ECE6DC]">
            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1.5">
                Pilih Batch Produksi
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-medium focus:outline-none focus:border-[#5C7489]"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
                <option value="__NEW__">+ Buat Batch Baru...</option>
              </select>

              {selectedBatch === '__NEW__' && (
                <input
                  type="text"
                  placeholder="Nama batch baru..."
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="mt-2 w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1.5">
                Target Jadwal Produksi
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-medium focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1.5">
                Masuk ke Kolom Status
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-medium focus:outline-none focus:border-[#5C7489]"
              >
                <option value="Desain Dikonfirmasi">Siap Cetak / Terjadwal</option>
                <option value="Data Diterima — Menunggu Konfirmasi Desain">Antrian — Review Desain</option>
                <option value="Produksi">Langsung ke Sedang Dicetak</option>
              </select>
            </div>
          </div>

          {/* Paste Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#14191F]">
                Paste Baris Google Sheets / Excel atau Upload File:
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-[11px] font-semibold text-[#5C7489] hover:underline flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .xlsx / .csv</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.tsv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            <textarea
              rows={5}
              placeholder={`Contoh copy-paste dari Google Sheets:\nBisa format 21 kolom "Daftar Preorder" atau format 10 kolom post-payment:\nName/Alias\tStrava Link\tPace/EG\tAddress\tEmail\tWhatsapp\tForm submitted at\tInvoice no\tPayment status\tPaid at`}
              value={rawText}
              onChange={(e) => parsePastedData(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] font-mono text-[11px] focus:outline-none focus:border-[#5C7489] resize-y"
            />
            <p className="text-[10px] text-[#7A8B99]">
              Mendukung format 21-kolom Daftar Preorder Keychain dan format 10-kolom post-payment form.
            </p>
          </div>

          {/* Production Guard Notice when non-production rows were skipped */}
          {skippedNonProductionCount > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-900">
                <p className="font-bold">
                  {skippedNonProductionCount} Pesanan Status Baru / Data Belum Lengkap Dilewati
                </p>
                <p className="mt-0.5">
                  Sesuai aturan operasional studio, pesanan dengan status <em>Baru</em> atau <em>Dibayar — Data Belum Lengkap</em> belum boleh masuk jadwal mesin produksi. Hanya pesanan dengan status Antri Produksi, Produksi, QC, Siap Kirim, atau Selesai yang dimasukkan ke batch.
                </p>
              </div>
            </div>
          )}

          {/* Preview: Preorder 21 Format */}
          {detectedFormat === 'PREORDER_21' && preorderRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#14191F]">
                  Pratinjau Pesanan Pre-Order ({preorderRows.length} pesanan siap masuk produksi):
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Siap dijadwalkan
                </span>
              </div>

              <div className="border border-[#ECE6DC] rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] sticky top-0 border-b border-[#ECE6DC]">
                    <tr>
                      <th className="px-3 py-2">No</th>
                      <th className="px-3 py-2">Pemesan</th>
                      <th className="px-3 py-2">WhatsApp</th>
                      <th className="px-3 py-2">Varian</th>
                      <th className="px-3 py-2">Tahap Produksi</th>
                      <th className="px-3 py-2">Total Harga</th>
                      <th className="px-3 py-2">Status Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {preorderRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F5]">
                        <td className="px-3 py-2 font-mono font-bold text-[#14191F]">{r.no}</td>
                        <td className="px-3 py-2 font-bold text-[#14191F]">{r.namaPemesan}</td>
                        <td className="px-3 py-2 font-mono text-[#5C7489]">{r.noWa || '-'}</td>
                        <td className="px-3 py-2 font-semibold text-[#14191F]">{r.variationName || r.varianRaw}</td>
                        <td className="px-3 py-2">
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {r.statusOrderSheet}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono">{r.totalHarga ? formatRupiah(r.totalHarga) : '-'}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                            {r.statusPembayaran}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Preview: Post-Payment 10 Format */}
          {detectedFormat === 'POST_PAYMENT_10' && postPaymentRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#14191F]">
                  Pratinjau Data Post-Payment ({postPaymentRows.length} pesanan terdeteksi):
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Siap diimport
                </span>
              </div>

              <div className="border border-[#ECE6DC] rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] sticky top-0 border-b border-[#ECE6DC]">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Nama / Alias</th>
                      <th className="px-3 py-2">WhatsApp</th>
                      <th className="px-3 py-2">Strava Link</th>
                      <th className="px-3 py-2">Pace / EG</th>
                      <th className="px-3 py-2">Invoice</th>
                      <th className="px-3 py-2">Status Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {postPaymentRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F5]">
                        <td className="px-3 py-2 text-[#7A8B99] font-mono">{idx + 1}</td>
                        <td className="px-3 py-2 font-bold text-[#14191F] max-w-[120px] truncate">
                          {row.name}
                        </td>
                        <td className="px-3 py-2 font-mono text-[#5C7489]">{row.whatsapp || '-'}</td>
                        <td className="px-3 py-2 max-w-[150px] truncate font-mono text-[#7A8B99]">
                          {row.stravaLink ? (
                            <a
                              href={row.stravaLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#5C7489] hover:underline"
                            >
                              {row.stravaLink}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-3 py-2">{row.paceEg || '-'}</td>
                        <td className="px-3 py-2 font-mono text-[10px] text-[#7A8B99]">
                          {row.invoiceNo ? row.invoiceNo.slice(0, 10) + '...' : '-'}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              (row.paymentStatus || '').toLowerCase().includes('paid')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {row.paymentStatus || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#ECE6DC] bg-[#FAF8F5] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#556473] hover:bg-white transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={importing || totalReadyCount === 0}
            onClick={handleExecuteImport}
            className="px-6 py-2.5 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {importing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mengimport ke Antrian...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Import {totalReadyCount} Pesanan ke Produksi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
