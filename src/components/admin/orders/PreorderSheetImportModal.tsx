'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Upload, 
  Check, 
  AlertCircle, 
  AlertTriangle,
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { 
  PREORDER_SHEET_COLUMNS, 
  LIVE_VARIANTS, 
  ParsedPreorderRow, 
  parseExcelOrCsvFile, 
  parseDelimitedText, 
  parsePreorderSheetGrid,
  formatRupiah
} from '@/lib/preorderSheetParser';
import { StravaPreOrder } from '@/types';

interface PreorderSheetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (msg: string) => void;
}

export function PreorderSheetImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: PreorderSheetImportModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [gridData, setGridData] = useState<string[][]>([]);
  const [colMap, setColMap] = useState<Record<string, number>>({});
  const [showMapping, setShowMapping] = useState(false);
  const [parsedResult, setParsedResult] = useState<{
    rows: ParsedPreorderRow[];
    totalValid: number;
    totalErrors: number;
    totalNeedsConfirmation: number;
  } | null>(null);
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'VALID' | 'ERROR' | 'CONFIRM'>('ALL');
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessGrid = (grid: string[][], customMap?: Record<string, number>) => {
    if (!grid || grid.length === 0) {
      setParsedResult(null);
      return;
    }
    const res = parsePreorderSheetGrid(grid, customMap);
    setColMap(res.detectedColMap);
    setParsedResult({
      rows: res.rows,
      totalValid: res.totalValid,
      totalErrors: res.totalErrors,
      totalNeedsConfirmation: res.totalNeedsConfirmation,
    });
    // If auto-detection didn't match most columns, open mapping automatically
    const mappedCount = Object.keys(res.detectedColMap).length;
    if (mappedCount < 10 && !customMap) {
      setShowMapping(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setFileName(file.name);
    try {
      const grid = await parseExcelOrCsvFile(file);
      setGridData(grid);
      handleProcessGrid(grid);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membaca file spreadsheet.');
    }
  };

  const handlePasteChange = (text: string) => {
    setRawText(text);
    setErrorMsg('');
    if (!text.trim()) {
      setGridData([]);
      setParsedResult(null);
      return;
    }
    const grid = parseDelimitedText(text);
    setGridData(grid);
    handleProcessGrid(grid);
  };

  const handleColumnMapChange = (key: string, colIdx: number) => {
    const updated = { ...colMap };
    if (colIdx < 0) {
      delete updated[key];
    } else {
      updated[key] = colIdx;
    }
    setColMap(updated);
    if (gridData.length > 0) {
      handleProcessGrid(gridData, updated);
    }
  };

  const handleConfirmRowVariant = (rowIdx: number, variantId: string) => {
    if (!parsedResult) return;
    const v = LIVE_VARIANTS.find((lv) => lv.id === variantId);
    if (!v) return;

    const updatedRows = [...parsedResult.rows];
    updatedRows[rowIdx] = {
      ...updatedRows[rowIdx],
      variationId: v.id,
      variationName: v.name,
      needsAdminConfirmation: false,
    };

    setParsedResult({
      ...parsedResult,
      rows: updatedRows,
      totalNeedsConfirmation: updatedRows.filter((r) => r.needsAdminConfirmation).length,
    });
  };

  const handleExecuteImport = async () => {
    if (!parsedResult || parsedResult.rows.length === 0) {
      setErrorMsg('Tidak ada baris pesanan yang dapat diimport.');
      return;
    }

    if (parsedResult.totalErrors > 0) {
      setErrorMsg(
        `Masih ada ${parsedResult.totalErrors} baris dengan kesalahan validasi. Harap perbaiki sebelum melanjutkan atau pastikan data sesuai format.`
      );
      return;
    }

    setImporting(true);
    setErrorMsg('');

    try {
      // Build order payloads
      const payloadOrders: Array<Partial<StravaPreOrder>> = parsedResult.rows.map((row) => {
        const orderId = row.invoiceNo && !row.invoiceNo.startsWith('INV') 
          ? `WSI-${row.invoiceNo.slice(0, 10).toUpperCase()}` 
          : `WSI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        return {
          id: orderId,
          orderNumber: orderId,
          productType: 'keychain-strava',
          variationId: row.variationId || 'var-57x94',
          variationName: row.variationName || row.varianRaw || '5.7x9.4 cm',
          qty: row.qty,
          unitPrice: row.hargaSatuan ?? 0,
          dpPaid: row.dpDibayar ?? 0,
          remainingBalance: row.sisaBayar ?? 0,
          paymentStatus: row.statusPembayaran as any,
          channel: row.channel || 'Direct TF',
          shippingCourier: row.metodePengiriman || 'JNE',
          trackingNumber: row.noResi || '',
          shippedAt: row.tanggalKirim || '',
          estimatedCompletionDate: row.estimasiSelesai || '',
          invoiceNo: row.invoiceNo || '',
          needsAdminConfirmation: row.needsAdminConfirmation,
          createdAt: row.tanggalOrderIso || new Date().toISOString(),
          customer: {
            fullName: row.namaPemesan || 'Pelanggan Sheet',
            phone: row.noWa || '',
            email: row.noWa ? `${row.noWa.replace(/\D/g, '')}@sheet.order` : 'order@whereisitofc.store',
            address: row.alamatPengiriman || 'Alamat dari spreadsheet',
            city: 'Indonesia',
          },
          price: row.hargaSatuan ?? 0,
          subtotal: row.totalHarga ?? 0,
          shippingFee: 0,
          total: row.totalHarga ?? 0,
          status: row.adminStageMapped,
          paymentMethod: row.channel || 'Spreadsheet Import',
          paymentVerified: row.statusPembayaran === 'Lunas',
          paymentVerifiedAt: row.statusPembayaran === 'Lunas' ? (row.tanggalOrderIso || new Date().toISOString()) : null,
          paymentDetails: {
            channel: row.channel,
            invoiceId: row.invoiceNo || undefined,
            invoiceNo: row.invoiceNo || undefined,
            paymentStatus: row.statusPembayaran,
            unitPrice: row.hargaSatuan ?? 0,
            qty: row.qty,
            dpPaid: row.dpDibayar ?? 0,
            remainingBalance: row.sisaBayar ?? 0,
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
            adminNotes: row.catatan ? `Catatan Sheet: ${row.catatan}` : '',
            submittedAt: row.tanggalOrderIso || new Date().toISOString(),
          },
          production: {
            courier: row.metodePengiriman || 'JNE',
            courierName: row.metodePengiriman || 'JNE',
            trackingNumber: row.noResi || '',
            resiNumber: row.noResi || '',
            estimatedCompletionDate: row.estimasiSelesai || '',
            shippedAt: row.tanggalKirim || '',
            internalAdminNotes: `Imported from sheet. ${row.catatan || ''}`,
          },
        };
      });

      const res = await fetch('/api/strava-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_sheet',
          orders: payloadOrders,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengimport pesanan.');
      }

      const msg = json.message || `${json.count || 0} baru, ${json.skippedCount || 0} duplikat dilewati`;
      onImportSuccess(msg);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses import.');
    } finally {
      setImporting(false);
    }
  };

  const filteredPreviewRows = parsedResult?.rows.filter((r) => {
    if (previewFilter === 'VALID') return r.isValid && !r.needsAdminConfirmation;
    if (previewFilter === 'ERROR') return !r.isValid;
    if (previewFilter === 'CONFIRM') return r.needsAdminConfirmation;
    return true;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl border border-[#ECE6DC] shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#ECE6DC] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#14191F] text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-[#8BA1B4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C7489]">
                  Spreadsheet Pre-Order Sync
                </span>
                <span className="text-[10px] font-semibold bg-[#EDF3F7] text-[#3E5161] px-2 py-0.5 rounded-full">
                  21 Kolom Format Resmi
                </span>
              </div>
              <h2 className="text-lg font-black text-[#14191F]">
                Import Sheet Daftar Preorder Keychain
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A8B99] hover:text-[#14191F] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Terjadi Kesalahan</p>
                <p className="text-[11px] mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Mode Switcher: Upload File vs Paste Text */}
          <div className="flex items-center gap-2 border-b border-[#ECE6DC] pb-3">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-[#14191F] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#ECE6DC]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File (.xlsx / .csv)</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 ${
                activeTab === 'paste'
                  ? 'bg-[#14191F] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#ECE6DC]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Paste Baris Teks (TSV/CSV)</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-[#DDD5C7] rounded-3xl p-6 text-center bg-[#FAF8F5] hover:bg-[#F2EDE4]/60 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDD5C7] flex items-center justify-center text-[#5C7489] shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-bold text-[#14191F] underline hover:text-[#5C7489]"
                  >
                    Klik untuk memilih file
                  </button>
                  <span className="text-[#7A8B99]"> atau drag file ke sini</span>
                </div>
                <p className="text-[11px] text-[#7A8B99]">
                  Mendukung .xlsx (Google Sheet export), .csv, atau .tsv
                </p>
                {fileName && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Paste Text */}
          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#44505C]">
                Copy & Paste Baris dari Spreadsheet (Termasuk Header atau Tanpa Header)
              </label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="Paste baris dari tab 'Daftar Preorder' di sini (Ctrl+V)..."
                className="w-full p-3 font-mono text-[11px] rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] focus:outline-none focus:border-[#5C7489]"
              />
              <p className="text-[10px] text-[#7A8B99]">
                Format 21 kolom: No., Tanggal Order, Nama Pemesan, No. WA, Produk, Varian, Qty, Harga Satuan, Total, DP, Sisa, Status Bayar, Status Order, Estimasi Selesai, Alamat, Kurir, Resi, Catatan, Detail Strava, Channel, Tanggal Kirim.
              </p>
            </div>
          )}

          {/* Column Mapping Accordion */}
          {gridData.length > 0 && (
            <div className="border border-[#ECE6DC] rounded-2xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowMapping(!showMapping)}
                className="w-full p-3.5 bg-[#FAF8F5] flex items-center justify-between text-left hover:bg-[#F2EDE4]/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#14191F]">
                    Pemetaan Kolom ({Object.keys(colMap).length} / 21 kolom terdeteksi)
                  </span>
                  <span className="text-[10px] text-[#7A8B99]">
                    Klik untuk melihat atau mengubah pemetaan manual jika header berbeda
                  </span>
                </div>
                {showMapping ? <ChevronUp className="w-4 h-4 text-[#556473]" /> : <ChevronDown className="w-4 h-4 text-[#556473]" />}
              </button>

              {showMapping && (
                <div className="p-4 bg-white border-t border-[#ECE6DC] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {PREORDER_SHEET_COLUMNS.map((col) => {
                    const currentIdx = colMap[col.key] !== undefined ? colMap[col.key] : -1;
                    const headerRow = gridData[0] || [];

                    return (
                      <div key={col.key} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-[#14191F] truncate" title={col.label}>
                            {col.label}
                          </span>
                          {currentIdx >= 0 ? (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Kolom {currentIdx + 1}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Belum Dipetakan
                            </span>
                          )}
                        </div>
                        <select
                          value={currentIdx}
                          onChange={(e) => handleColumnMapChange(col.key, Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#DDD5C7] text-[11px] font-medium"
                        >
                          <option value={-1}>-- Tidak Dipetakan --</option>
                          {headerRow.map((h, i) => (
                            <option key={i} value={i}>
                              Kolom {i + 1}: {h ? `"${h.slice(0, 24)}"` : `(Kosong)`}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Validation Metrics & Confirmation Banners */}
          {parsedResult && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC]">
                  <span className="text-[10px] uppercase font-bold text-[#7A8B99]">Total Baris</span>
                  <div className="text-xl font-black text-[#14191F] mt-0.5">
                    {parsedResult.rows.length}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Valid &amp; Siap</span>
                  <div className="text-xl font-black text-emerald-900 mt-0.5">
                    {parsedResult.totalValid}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  parsedResult.totalErrors > 0 ? 'bg-red-50 border-red-200' : 'bg-[#FAF8F5] border-[#ECE6DC]'
                }`}>
                  <span className={`text-[10px] uppercase font-bold ${
                    parsedResult.totalErrors > 0 ? 'text-red-700' : 'text-[#7A8B99]'
                  }`}>Kesalahan Validasi</span>
                  <div className={`text-xl font-black mt-0.5 ${
                    parsedResult.totalErrors > 0 ? 'text-red-800' : 'text-[#14191F]'
                  }`}>
                    {parsedResult.totalErrors}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  parsedResult.totalNeedsConfirmation > 0 ? 'bg-amber-50 border-amber-200' : 'bg-[#FAF8F5] border-[#ECE6DC]'
                }`}>
                  <span className={`text-[10px] uppercase font-bold ${
                    parsedResult.totalNeedsConfirmation > 0 ? 'text-amber-800' : 'text-[#7A8B99]'
                  }`}>Perlu Konfirmasi Admin</span>
                  <div className={`text-xl font-black mt-0.5 ${
                    parsedResult.totalNeedsConfirmation > 0 ? 'text-amber-900' : 'text-[#14191F]'
                  }`}>
                    {parsedResult.totalNeedsConfirmation}
                  </div>
                </div>
              </div>

              {/* Notice: Historical Prices Preserved */}
              <div className="p-3 bg-[#FAF8F5] border border-[#ECE6DC] rounded-2xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#5C7489] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#556473]">
                  <strong>Catatan Harga Historis:</strong> Harga Satuan yang diimport adalah riwayat pembayaran pesanan tersebut saja. Data harga varian live resmi (Rp119.000, Rp180.000, Rp220.000, Rp190.000, Rp150.000) tidak akan pernah ditimpa oleh harga lama di spreadsheet.
                </p>
              </div>

              {/* Warning Banner: Needs Admin Confirmation */}
              {parsedResult.totalNeedsConfirmation > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-900">
                    <p className="font-bold">
                      {parsedResult.totalNeedsConfirmation} Pesanan Memerlukan Konfirmasi Varian Admin
                    </p>
                    <p className="mt-0.5">
                      Varian pesanan (misalnya order Clicky &quot;Emoney/Flazz — varian belum dikonfirmasi&quot;) belum dapat dicocokkan otomatis. Sistem tidak akan pernah menebak varian untuk admin. Anda dapat memilih varian pada tabel preview di bawah atau mengonfirmasinya nanti di detail pesanan.
                    </p>
                  </div>
                </div>
              )}

              {/* Filter Tabs for Preview */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-1.5">
                  {(['ALL', 'VALID', 'ERROR', 'CONFIRM'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPreviewFilter(mode)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        previewFilter === mode
                          ? 'bg-[#14191F] text-white'
                          : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#ECE6DC]'
                      }`}
                    >
                      {mode === 'ALL' && `Semua (${parsedResult.rows.length})`}
                      {mode === 'VALID' && `Valid (${parsedResult.totalValid})`}
                      {mode === 'ERROR' && `Error (${parsedResult.totalErrors})`}
                      {mode === 'CONFIRM' && `Perlu Konfirmasi (${parsedResult.totalNeedsConfirmation})`}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-[#7A8B99]">
                  Menampilkan {filteredPreviewRows.length} baris
                </span>
              </div>

              {/* Preview Table */}
              <div className="border border-[#ECE6DC] rounded-2xl overflow-x-auto max-h-80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC] sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2.5">No</th>
                      <th className="px-3 py-2.5">Tanggal</th>
                      <th className="px-3 py-2.5">Pemesan</th>
                      <th className="px-3 py-2.5">WhatsApp</th>
                      <th className="px-3 py-2.5">Varian Terpilih</th>
                      <th className="px-3 py-2.5">Qty</th>
                      <th className="px-3 py-2.5">Harga</th>
                      <th className="px-3 py-2.5">Total</th>
                      <th className="px-3 py-2.5">DP</th>
                      <th className="px-3 py-2.5">Sisa</th>
                      <th className="px-3 py-2.5">Bayar</th>
                      <th className="px-3 py-2.5">Status Order</th>
                      <th className="px-3 py-2.5">Channel</th>
                      <th className="px-3 py-2.5">Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {filteredPreviewRows.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="px-4 py-8 text-center text-[#7A8B99]">
                          Tidak ada baris pada filter ini.
                        </td>
                      </tr>
                    ) : (
                      filteredPreviewRows.map((r, idx) => (
                        <tr 
                          key={idx} 
                          className={`hover:bg-[#FAF8F5] transition-colors ${
                            !r.isValid ? 'bg-red-50/40' : r.needsAdminConfirmation ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <td className="px-3 py-2 font-mono font-bold text-[#14191F]">
                            {r.no}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-[#556473]">
                            {r.tanggalOrderFormatted}
                          </td>
                          <td className="px-3 py-2 font-bold text-[#14191F] whitespace-nowrap">
                            {r.namaPemesan}
                          </td>
                          <td className="px-3 py-2 font-mono text-[#5C7489] whitespace-nowrap">
                            {r.noWa || '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {r.needsAdminConfirmation ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Perlu Konfirmasi</span>
                                </span>
                                <select
                                  value={r.variationId || ''}
                                  onChange={(e) => handleConfirmRowVariant(r.rowNumber - 1, e.target.value)}
                                  className="block w-full text-[10px] px-2 py-1 rounded bg-white border border-amber-300 font-semibold"
                                >
                                  <option value="">-- Pilih Varian --</option>
                                  {LIVE_VARIANTS.map((v) => (
                                    <option key={v.id} value={v.id}>
                                      {v.name} ({formatRupiah(v.price)})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div>
                                <span className="font-semibold text-[#14191F]">{r.variationName}</span>
                                <span className="block text-[10px] text-[#7A8B99]">{r.varianRaw}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 font-bold text-center">
                            {r.qty}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-mono text-[11px]">
                            {r.hargaSatuan !== null ? formatRupiah(r.hargaSatuan) : '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-mono text-[11px] font-bold">
                            {r.totalHarga !== null ? formatRupiah(r.totalHarga) : '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-mono text-[11px]">
                            {r.dpDibayar !== null ? formatRupiah(r.dpDibayar) : '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-mono text-[11px]">
                            {r.sisaBayar !== null ? formatRupiah(r.sisaBayar) : '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.statusPembayaran === 'Lunas' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : r.statusPembayaran === 'DP'
                                ? 'bg-blue-100 text-blue-800'
                                : r.statusPembayaran === 'Batal'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {r.statusPembayaran}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="font-semibold text-[#14191F] text-[11px]">
                              {r.statusOrderSheet}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-medium text-[#5C7489]">
                            {r.channel}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {r.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>OK</span>
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                {r.errors.map((err, eIdx) => (
                                  <span key={eIdx} className="block text-[9px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                                    {err}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#ECE6DC] bg-[#FAF8F5] flex items-center justify-between gap-3">
          <div className="text-[11px] text-[#7A8B99]">
            {parsedResult && (
              <span>
                {parsedResult.rows.length} baris terdeteksi • Sistem otomatis menduplikasi pesanan lama agar tidak terjadi entri ganda.
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={importing}
              className="px-4 py-2 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#556473] hover:bg-white"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={importing || !parsedResult || parsedResult.rows.length === 0 || parsedResult.totalErrors > 0}
              className="px-6 py-2 rounded-xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-40 flex items-center gap-1.5"
            >
              {importing ? (
                <span>Mengimport Data...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    Import {parsedResult?.totalValid ? `${parsedResult.totalValid} Pesanan` : 'ke Database'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
