'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, Check, AlertCircle, Upload, ArrowRight, Sparkles } from 'lucide-react';
import { ProductionBatch, StravaPreOrder } from '@/types';

interface SheetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: ProductionBatch[];
  onImportSuccess: () => void;
}

interface ParsedRow {
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
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const parsePastedData = (text: string) => {
    setRawText(text);
    setErrorMsg('');
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Determine delimiter: tab vs comma vs semicolon
    const firstLine = lines[0];
    const isTab = firstLine.includes('\t');
    const delimiter = isTab ? '\t' : firstLine.includes(';') ? ';' : ',';

    let startIndex = 0;
    const headerCols = firstLine.split(delimiter).map((c) => c.trim().toLowerCase());
    
    // Check if first line is header
    const hasHeader = headerCols.some(
      (c) =>
        c.includes('name') ||
        c.includes('alias') ||
        c.includes('strava') ||
        c.includes('pace') ||
        c.includes('address') ||
        c.includes('invoice') ||
        c.includes('whatsapp')
    );

    let colMap: Record<string, number> = {};

    if (hasHeader) {
      startIndex = 1;
      headerCols.forEach((col, idx) => {
        if (col.includes('name') || col.includes('alias') || col.includes('pemesan')) colMap['name'] = idx;
        else if (col.includes('strava') || col.includes('link')) colMap['stravaLink'] = idx;
        else if (col.includes('pace') || col.includes('eg') || col.includes('race')) colMap['paceEg'] = idx;
        else if (col.includes('address') || col.includes('alamat')) colMap['address'] = idx;
        else if (col.includes('email')) colMap['email'] = idx;
        else if (col.includes('whatsapp') || col.includes('no hp') || col.includes('phone') || col.includes('wa')) colMap['whatsapp'] = idx;
        else if (col.includes('form') || col.includes('submit')) colMap['formSubmittedAt'] = idx;
        else if (col.includes('invoice') || col.includes('inv')) colMap['invoiceNo'] = idx;
        else if (col.includes('payment') || col.includes('bayar') || col.includes('status')) colMap['paymentStatus'] = idx;
        else if (col.includes('paid')) colMap['paidAt'] = idx;
      });
    }

    const rows: ParsedRow[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(delimiter).map((p) => p.trim());

      // If mapped by header, use map; otherwise fallback to default sheet column positions
      // 0: Name/Alias, 1: Strava Link, 2: Pace/EG, 3: Address, 4: Email, 5: Whatsapp, 6: Form submitted at, 7: Invoice no, 8: Payment status, 9: Paid at
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

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        parsePastedData(text);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) {
      setErrorMsg('Tidak ada baris yang valid untuk diimport.');
      return;
    }

    setImporting(true);
    setErrorMsg('');

    const finalBatchName = (newBatchName.trim() || selectedBatch).trim();

    try {
      const ordersPayload = parsedRows.map((row) => {
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
        throw new Error(json.error || 'Gagal mengimport pesanan');
      }

      onImportSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat import data');
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
              <h2 className="text-lg font-black text-[#14191F]">Import Orderan dari Spreadsheet</h2>
              <p className="text-xs text-[#6C7E8E]">
                Copy-paste dari Google Sheets / Excel atau upload file CSV/TSV
              </p>
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
                Paste Baris Google Sheets / Excel di sini:
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-[11px] font-semibold text-[#5C7489] hover:underline flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .CSV</span>
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            <textarea
              rows={5}
              placeholder={`Contoh copy-paste dari Google Sheets:\nName/Alias\tStrava Link\tPace/EG\tAddress\tEmail\tWhatsapp\tForm submitted at\tInvoice no\tPayment status\tPaid at\nEndy Hardjono\thttps://strava.app.link/Vr8bBtLteeb\tPace\tPOLRESTA SIDOARJO\tendy@gmail.com\t085706494674\t26-11-18 15:37:29\t6afd6ee059e032\tpaid\t26-11-18 16:07:44`}
              value={rawText}
              onChange={(e) => parsePastedData(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] font-mono text-[11px] focus:outline-none focus:border-[#5C7489] resize-y"
            />
            <p className="text-[10px] text-[#7A8B99]">
              Format otomatis mendeteksi kolom: Name/Alias, Strava Link, Pace/EG, Address, Email, Whatsapp, Form Submitted, Invoice No, Payment Status, Paid At.
            </p>
          </div>

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#14191F]">
                  Pratinjau Data ({parsedRows.length} pesanan terdeteksi):
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
                    {parsedRows.map((row, idx) => (
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
            disabled={importing || parsedRows.length === 0}
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
                <span>Import {parsedRows.length} Pesanan ke Produksi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
