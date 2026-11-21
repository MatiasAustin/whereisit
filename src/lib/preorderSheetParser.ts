import * as XLSX from 'xlsx';
import { StravaOrderStatus, StravaPreOrder } from '@/types';

export const PREORDER_SHEET_COLUMNS = [
  { key: 'no', label: 'No.', aliases: ['no', 'no.'] },
  { key: 'tanggalOrder', label: 'Tanggal Order', aliases: ['tanggal order', 'tgl order', 'tanggal', 'date'] },
  { key: 'namaPemesan', label: 'Nama Pemesan', aliases: ['nama pemesan', 'nama', 'customer', 'pelanggan'] },
  { key: 'noWa', label: 'No. WA', aliases: ['no. wa', 'no wa', 'whatsapp', 'no hp', 'phone', 'wa'] },
  { key: 'produk', label: 'Produk', aliases: ['produk', 'product'] },
  { key: 'varian', label: 'Varian / Detail Custom', aliases: ['varian / detail custom', 'varian', 'variasi', 'detail custom'] },
  { key: 'qty', label: 'Qty', aliases: ['qty', 'jumlah', 'quantity'] },
  { key: 'hargaSatuan', label: 'Harga Satuan (Rp)', aliases: ['harga satuan (rp)', 'harga satuan', 'harga', 'price'] },
  { key: 'totalHarga', label: 'Total Harga (Rp)', aliases: ['total harga (rp)', 'total harga', 'total', 'subtotal'] },
  { key: 'dpDibayar', label: 'DP Dibayar (Rp)', aliases: ['dp dibayar (rp)', 'dp dibayar', 'dp', 'down payment'] },
  { key: 'sisaBayar', label: 'Sisa Bayar (Rp)', aliases: ['sisa bayar (rp)', 'sisa bayar', 'sisa'] },
  { key: 'statusPembayaran', label: 'Status Pembayaran', aliases: ['status pembayaran', 'pembayaran', 'status bayar'] },
  { key: 'statusOrder', label: 'Status Order / Produksi', aliases: ['status order / produksi', 'status order', 'status produksi', 'status'] },
  { key: 'estimasiSelesai', label: 'Estimasi Selesai', aliases: ['estimasi selesai', 'estimasi', 'est selesai'] },
  { key: 'alamatPengiriman', label: 'Alamat Pengiriman', aliases: ['alamat pengiriman', 'alamat', 'address'] },
  { key: 'metodePengiriman', label: 'Metode Pengiriman', aliases: ['metode pengiriman', 'kurir', 'pengiriman', 'shipping'] },
  { key: 'noResi', label: 'No. Resi', aliases: ['no. resi', 'no resi', 'resi', 'tracking'] },
  { key: 'catatan', label: 'Catatan', aliases: ['catatan', 'notes', 'keterangan'] },
  { key: 'detailStrava', label: 'Detail Strava', aliases: ['detail strava', 'strava', 'strava data'] },
  { key: 'channel', label: 'Channel', aliases: ['channel', 'saluran', 'sales channel'] },
  { key: 'tanggalKirim', label: 'Tanggal Kirim', aliases: ['tanggal kirim', 'tgl kirim', 'shipping date'] },
] as const;

export type SheetColumnKey = typeof PREORDER_SHEET_COLUMNS[number]['key'];

export const ALLOWED_PAYMENT_STATUSES = ['Belum Bayar', 'DP', 'Lunas', 'Batal'] as const;
export const ALLOWED_ORDER_STATUSES = [
  'Baru',
  'Antri Produksi',
  'Produksi',
  'QC / Finishing',
  'Siap Kirim',
  'Dikirim',
  'Selesai',
  'Batal',
] as const;

export const LIVE_VARIANTS = [
  { id: 'var-57x94', name: '5.7x9.4 cm', price: 119000, desc: 'Tanpa Kartu / Standard' },
  { id: 'var-emoney', name: '5.7x9.4 cm Emoney', price: 180000, desc: 'Termasuk E-Money' },
  { id: 'var-flazz', name: '5.7x9.4 cm Flazz', price: 220000, desc: 'Termasuk BCA Flazz' },
  { id: 'var-brizzi', name: '5.7x9.4 cm Brizzi', price: 190000, desc: 'Termasuk BRIZZI' },
  { id: 'var-slot-kosong', name: '5.7x9.4 cm Slot Kosong', price: 150000, desc: 'Tanpa Kartu / Slot Kosong' },
] as const;

export interface ParsedPreorderRow {
  rowNumber: number;
  no: string;
  tanggalOrderRaw: string;
  tanggalOrderIso: string;
  tanggalOrderFormatted: string;
  namaPemesan: string;
  noWa: string;
  produk: string;
  varianRaw: string;
  variationId: string;
  variationName: string;
  needsAdminConfirmation: boolean;
  qty: number;
  hargaSatuan: number | null;
  totalHarga: number | null;
  dpDibayar: number | null;
  sisaBayar: number | null;
  statusPembayaran: string;
  statusOrderSheet: string;
  adminStageMapped: StravaOrderStatus;
  estimasiSelesai: string;
  alamatPengiriman: string;
  metodePengiriman: string;
  noResi: string;
  catatan: string;
  detailStrava: string;
  channel: string;
  tanggalKirim: string;
  invoiceNo: string;
  stravaUrl: string;
  keychainName: string;
  eventName: string;
  distance: string;
  pace: string;
  duration: string;
  routeColor: string;
  errors: string[];
  isValid: boolean;
}

export function parseDateIndo(raw: any): { date: Date | null; iso: string; formatted: string; isValid: boolean } {
  if (raw === undefined || raw === null || raw === '') {
    return { date: null, iso: '', formatted: '', isValid: false };
  }

  // Handle excel numeric serial date
  if (typeof raw === 'number') {
    const epoch = new Date((raw - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(epoch.getTime())) {
      return {
        date: epoch,
        iso: epoch.toISOString(),
        formatted: formatDateIndo(epoch.toISOString()),
        isValid: true,
      };
    }
  }

  const str = String(raw).trim();
  if (!str) return { date: null, iso: '', formatted: '', isValid: false };

  // Month translation table (Indonesian to English)
  const monthMap: Record<string, number> = {
    jan: 0, januari: 0,
    feb: 1, februari: 1,
    mar: 2, maret: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5,
    jul: 6, juli: 6,
    agu: 7, ags: 7, agustus: 7, aug: 7,
    sep: 8, sept: 8, september: 8,
    okt: 9, oktober: 9, oct: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, dec: 11,
  };

  // Match "7 Nov 2026", "10 Nov 2026", "07 November 2026"
  const textDateMatch = str.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (textDateMatch) {
    const day = parseInt(textDateMatch[1], 10);
    const monthStr = textDateMatch[2].toLowerCase();
    const year = parseInt(textDateMatch[3], 10);
    if (monthMap[monthStr] !== undefined) {
      const d = new Date(Date.UTC(year, monthMap[monthStr], day, 12, 0, 0));
      return {
        date: d,
        iso: d.toISOString(),
        formatted: `${day} ${capitalize(monthStr.slice(0, 3))} ${year}`,
        isValid: true,
      };
    }
  }

  // Match DD/MM/YYYY or DD-MM-YYYY
  const slashMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    const year = parseInt(slashMatch[3], 10);
    const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
    if (!isNaN(d.getTime())) {
      return {
        date: d,
        iso: d.toISOString(),
        formatted: formatDateIndo(d.toISOString()),
        isValid: true,
      };
    }
  }

  // Standard date parsing fallback
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) {
    return {
      date: fallback,
      iso: fallback.toISOString(),
      formatted: formatDateIndo(fallback.toISOString()),
      isValid: true,
    };
  }

  return { date: null, iso: '', formatted: str, isValid: false };
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDateIndo(isoStr?: string | null): string {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatRupiah(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '-';
  return `Rp${Math.round(amount).toLocaleString('id-ID')}`;
}

export function mapSheetStatusToAdminStage(sheetStatus: string, paymentStatus: string): StravaOrderStatus {
  const normSheet = (sheetStatus || '').trim().toLowerCase();
  const normPay = (paymentStatus || '').trim().toLowerCase();

  if (normSheet === 'baru') {
    if (normPay === 'belum bayar') {
      return 'Menunggu Pembayaran';
    }
    return 'Dibayar — Data Belum Lengkap';
  }
  if (normSheet === 'antri produksi') return 'Antri Produksi';
  if (normSheet === 'produksi') return 'Produksi';
  if (normSheet === 'qc / finishing' || normSheet === 'qc' || normSheet === 'finishing') return 'QC / Finishing';
  if (normSheet === 'siap kirim') return 'Siap Kirim';
  if (normSheet === 'dikirim') return 'Dikirim';
  if (normSheet === 'selesai') return 'Selesai';
  if (normSheet === 'batal') return 'Batal';

  // Fallback
  return 'Baru';
}

export function matchLiveVariant(variantText: string): {
  variationId: string;
  variationName: string;
  isMatched: boolean;
  needsAdminConfirmation: boolean;
} {
  const text = (variantText || '').toLowerCase();

  // If explicitly ambiguous / unconfirmed (e.g. "Emoney/Flazz — varian belum dikonfirmasi" or "emoney/flazz")
  if (
    text.includes('belum dikonfirmasi') ||
    text.includes('emoney/flazz') ||
    text.includes('flazz/emoney') ||
    (text.includes('emoney') && text.includes('flazz'))
  ) {
    return {
      variationId: 'unconfirmed',
      variationName: 'Emoney/Flazz (Belum Dikonfirmasi)',
      isMatched: false,
      needsAdminConfirmation: true,
    };
  }

  // Exact or distinct matches
  if (text.includes('brizzi')) {
    return {
      variationId: 'var-brizzi',
      variationName: '5.7x9.4 cm Brizzi',
      isMatched: true,
      needsAdminConfirmation: false,
    };
  }

  if (text.includes('slot kosong') || text.includes('slot-kosong')) {
    return {
      variationId: 'var-slot-kosong',
      variationName: '5.7x9.4 cm Slot Kosong',
      isMatched: true,
      needsAdminConfirmation: false,
    };
  }

  if (text.includes('flazz')) {
    return {
      variationId: 'var-flazz',
      variationName: '5.7x9.4 cm Flazz',
      isMatched: true,
      needsAdminConfirmation: false,
    };
  }

  if (text.includes('emoney') || text.includes('e-money')) {
    return {
      variationId: 'var-emoney',
      variationName: '5.7x9.4 cm Emoney',
      isMatched: true,
      needsAdminConfirmation: false,
    };
  }

  if (text.includes('only') || text.includes('tanpa kartu') || text.includes('standard') || text.includes('5.7x9.4')) {
    return {
      variationId: 'var-57x94',
      variationName: '5.7x9.4 cm',
      isMatched: true,
      needsAdminConfirmation: false,
    };
  }

  // Fallback: Never guess variant for admin
  return {
    variationId: 'unconfirmed',
    variationName: variantText ? `${variantText} (Perlu Konfirmasi)` : 'Varian Belum Dikonfirmasi',
    isMatched: false,
    needsAdminConfirmation: true,
  };
}

export function detectPreorderSheetHeaders(firstRow: string[]): {
  isPreorderSheet: boolean;
  colMap: Record<SheetColumnKey, number>;
} {
  const colMap = {} as Record<SheetColumnKey, number>;
  let matchedCount = 0;

  const normalized = firstRow.map((c) => String(c || '').trim().toLowerCase());

  PREORDER_SHEET_COLUMNS.forEach(({ key, aliases }) => {
    const idx = normalized.findIndex((col) => {
      return aliases.some((alias) => col === alias || col.includes(alias));
    });
    if (idx !== -1) {
      colMap[key] = idx;
      matchedCount++;
    }
  });

  // If at least 3 distinctive columns match, it's definitely a preorder sheet
  const hasDistinctive =
    colMap['tanggalOrder'] !== undefined ||
    colMap['namaPemesan'] !== undefined ||
    colMap['dpDibayar'] !== undefined ||
    colMap['statusOrder'] !== undefined;

  return {
    isPreorderSheet: matchedCount >= 3 && hasDistinctive,
    colMap,
  };
}

export function parsePreorderSheetGrid(
  rows: string[][],
  customColMap?: Record<SheetColumnKey, number>
): {
  rows: ParsedPreorderRow[];
  detectedColMap: Record<SheetColumnKey, number>;
  hasHeader: boolean;
  totalValid: number;
  totalErrors: number;
  totalNeedsConfirmation: number;
} {
  if (rows.length === 0) {
    return {
      rows: [],
      detectedColMap: {} as Record<SheetColumnKey, number>,
      hasHeader: false,
      totalValid: 0,
      totalErrors: 0,
      totalNeedsConfirmation: 0,
    };
  }

  const { isPreorderSheet, colMap: autoColMap } = detectPreorderSheetHeaders(rows[0]);
  const hasHeader = isPreorderSheet || customColMap !== undefined;
  const colMap = customColMap || autoColMap;

  const startIndex = hasHeader ? 1 : 0;
  const parsedList: ParsedPreorderRow[] = [];

  for (let rIdx = startIndex; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx];
    if (!row || row.every((c) => !String(c || '').trim())) continue;

    const getVal = (key: SheetColumnKey, defaultIdx: number): string => {
      const idx = colMap[key] !== undefined ? colMap[key] : defaultIdx;
      return String(row[idx] ?? '').trim();
    };

    const no = getVal('no', 0);
    const tanggalOrderRaw = getVal('tanggalOrder', 1);
    const namaPemesan = getVal('namaPemesan', 2);
    const noWa = getVal('noWa', 3);
    const produk = getVal('produk', 4) || 'Keychain Strava Custom';
    const varianRaw = getVal('varian', 5);
    const qtyRaw = getVal('qty', 6);
    const hargaSatuanRaw = getVal('hargaSatuan', 7);
    const totalHargaRaw = getVal('totalHarga', 8);
    const dpDibayarRaw = getVal('dpDibayar', 9);
    const sisaBayarRaw = getVal('sisaBayar', 10);
    const statusPembayaranRaw = getVal('statusPembayaran', 11);
    const statusOrderRaw = getVal('statusOrder', 12);
    const estimasiSelesaiRaw = getVal('estimasiSelesai', 13);
    const alamatPengirimanRaw = getVal('alamatPengiriman', 14);
    const metodePengirimanRaw = getVal('metodePengiriman', 15);
    const noResiRaw = getVal('noResi', 16);
    const catatanRaw = getVal('catatan', 17);
    const detailStravaRaw = getVal('detailStrava', 18);
    const channelRaw = getVal('channel', 19);
    const tanggalKirimRaw = getVal('tanggalKirim', 20);

    const errors: string[] = [];

    // Validation 1: Tanggal Order must be valid date
    const dateParsed = parseDateIndo(tanggalOrderRaw);
    if (!tanggalOrderRaw) {
      errors.push('Tanggal Order wajib diisi');
    } else if (!dateParsed.isValid) {
      errors.push(`Tanggal Order '${tanggalOrderRaw}' tidak valid`);
    }

    // Validation 2: Qty must be whole number >= 1
    const qtyNum = parseInt(qtyRaw || '1', 10);
    if (isNaN(qtyNum) || qtyNum < 1) {
      errors.push(`Qty '${qtyRaw}' tidak valid, harus angka bulat >= 1`);
    }

    // Validation 3: Harga Satuan & DP Dibayar
    const parseMoney = (rawVal: string): number | null => {
      if (!rawVal || rawVal.toLowerCase().includes('kosong')) return null;
      const clean = rawVal.replace(/[^0-9]/g, '');
      if (!clean) return null;
      const num = parseInt(clean, 10);
      return isNaN(num) ? null : num;
    };

    const hargaSatuan = parseMoney(hargaSatuanRaw);
    const dpDibayar = parseMoney(dpDibayarRaw);

    if (hargaSatuan !== null && hargaSatuan < 0) {
      errors.push('Harga Satuan tidak boleh negatif');
    }
    if (dpDibayar !== null && dpDibayar < 0) {
      errors.push('DP Dibayar tidak boleh negatif');
    }

    // Automatic Total Harga = Qty x Harga Satuan (if Harga Satuan known)
    let totalHarga = parseMoney(totalHargaRaw);
    if (totalHarga === null && hargaSatuan !== null) {
      totalHarga = qtyNum * hargaSatuan;
    }

    // Automatic Sisa Bayar = Total Harga - DP Dibayar
    let sisaBayar = parseMoney(sisaBayarRaw);
    if (sisaBayar === null && totalHarga !== null && dpDibayar !== null) {
      sisaBayar = Math.max(0, totalHarga - dpDibayar);
    }

    // Validation 4: Status Pembayaran must be one of allowed values
    let matchedPayStatus = ALLOWED_PAYMENT_STATUSES.find(
      (s) => s.toLowerCase() === statusPembayaranRaw.toLowerCase()
    );
    if (!matchedPayStatus) {
      // Normalize common synonyms
      if (statusPembayaranRaw.toLowerCase().includes('lunas') || statusPembayaranRaw.toLowerCase().includes('paid')) {
        matchedPayStatus = 'Lunas';
      } else if (statusPembayaranRaw.toLowerCase().includes('dp')) {
        matchedPayStatus = 'DP';
      } else if (statusPembayaranRaw.toLowerCase().includes('belum') || statusPembayaranRaw.toLowerCase().includes('pending')) {
        matchedPayStatus = 'Belum Bayar';
      } else if (statusPembayaranRaw.toLowerCase().includes('batal') || statusPembayaranRaw.toLowerCase().includes('cancel')) {
        matchedPayStatus = 'Batal';
      } else if (!statusPembayaranRaw) {
        matchedPayStatus = 'Belum Bayar';
      } else {
        errors.push(`Status Pembayaran '${statusPembayaranRaw}' tidak valid (harus Belum Bayar / DP / Lunas / Batal)`);
      }
    }

    // Validation 5: Status Order / Produksi must be one of allowed values
    let matchedOrderStatus = ALLOWED_ORDER_STATUSES.find(
      (s) => s.toLowerCase() === statusOrderRaw.toLowerCase()
    );
    if (!matchedOrderStatus) {
      if (statusOrderRaw.toLowerCase().includes('selesai') || statusOrderRaw.toLowerCase().includes('complete')) {
        matchedOrderStatus = 'Selesai';
      } else if (statusOrderRaw.toLowerCase().includes('baru') || statusOrderRaw.toLowerCase().includes('new')) {
        matchedOrderStatus = 'Baru';
      } else if (statusOrderRaw.toLowerCase().includes('antri')) {
        matchedOrderStatus = 'Antri Produksi';
      } else if (statusOrderRaw.toLowerCase().includes('siap')) {
        matchedOrderStatus = 'Siap Kirim';
      } else if (statusOrderRaw.toLowerCase().includes('kirim')) {
        matchedOrderStatus = 'Dikirim';
      } else if (statusOrderRaw.toLowerCase().includes('produksi') || statusOrderRaw.toLowerCase().includes('cetak')) {
        matchedOrderStatus = 'Produksi';
      } else if (statusOrderRaw.toLowerCase().includes('qc') || statusOrderRaw.toLowerCase().includes('finishing')) {
        matchedOrderStatus = 'QC / Finishing';
      } else if (statusOrderRaw.toLowerCase().includes('batal')) {
        matchedOrderStatus = 'Batal';
      } else if (!statusOrderRaw) {
        matchedOrderStatus = 'Baru';
      } else {
        errors.push(`Status Order '${statusOrderRaw}' tidak valid (harus Baru / Antri Produksi / Produksi / QC / Finishing / Siap Kirim / Dikirim / Selesai / Batal)`);
      }
    }

    const adminStageMapped = mapSheetStatusToAdminStage(matchedOrderStatus || 'Baru', matchedPayStatus || 'Belum Bayar');

    // Variant Matching
    const variantMatch = matchLiveVariant(varianRaw);

    // Extract Invoice ID from Catatan or Invoice column
    let invoiceNo = '';
    const invMatch = (catatanRaw + ' ' + noResiRaw).match(/INV\/[A-Z0-9\/\-]+/i);
    if (invMatch) {
      invoiceNo = invMatch[0];
    } else {
      const clickyMatch = (catatanRaw + ' ' + noResiRaw).match(/[a-f0-9]{24}/i);
      if (clickyMatch) invoiceNo = clickyMatch[0];
    }

    // Extract Strava link if present in Catatan or Detail Strava
    let stravaUrl = '';
    const stravaUrlMatch = (catatanRaw + ' ' + detailStravaRaw).match(/https?:\/\/[^\s]+/i);
    if (stravaUrlMatch) {
      stravaUrl = stravaUrlMatch[0];
    }

    // Extract detail strava segments
    let keychainName = '';
    let eventName = '';
    let distance = '';
    let pace = '';
    let duration = '';
    let routeColor = '';

    const detailText = detailStravaRaw || varianRaw || catatanRaw;
    const nameMatch = detailText.match(/nama(?:\s*di\s*keychain)?:\s*([^,|]+)/i);
    if (nameMatch) keychainName = nameMatch[1].trim();

    const distMatch = detailText.match(/(\d+(?:[.,]\d+)?\s*(?:km|k))\b/i);
    if (distMatch) distance = distMatch[1].trim();

    const paceMatch = detailText.match(/pace\s*[:=]?\s*([0-9:]+\s*(?:\/km)?)/i);
    if (paceMatch) pace = paceMatch[1].trim();

    const colorMatch = detailText.match(/rute\s*([a-zA-Z\s]+)/i);
    if (colorMatch) routeColor = colorMatch[0].trim();

    parsedList.push({
      rowNumber: rIdx + 1,
      no: no || String(rIdx + 1),
      tanggalOrderRaw,
      tanggalOrderIso: dateParsed.iso,
      tanggalOrderFormatted: dateParsed.formatted,
      namaPemesan: namaPemesan || 'Pelanggan Sheet',
      noWa: noWa || '',
      produk,
      varianRaw,
      variationId: variantMatch.variationId,
      variationName: variantMatch.variationName,
      needsAdminConfirmation: variantMatch.needsAdminConfirmation,
      qty: qtyNum,
      hargaSatuan,
      totalHarga,
      dpDibayar,
      sisaBayar,
      statusPembayaran: matchedPayStatus || statusPembayaranRaw,
      statusOrderSheet: matchedOrderStatus || statusOrderRaw,
      adminStageMapped,
      estimasiSelesai: estimasiSelesaiRaw,
      alamatPengiriman: alamatPengirimanRaw,
      metodePengiriman: metodePengirimanRaw,
      noResi: noResiRaw,
      catatan: catatanRaw,
      detailStrava: detailStravaRaw,
      channel: channelRaw || (catatanRaw.toLowerCase().includes('shopee') ? 'Shopee' : catatanRaw.toLowerCase().includes('threads') ? 'Threads' : catatanRaw.toLowerCase().includes('clicky') ? 'Clicky' : 'Direct TF'),
      tanggalKirim: tanggalKirimRaw,
      invoiceNo,
      stravaUrl,
      keychainName,
      eventName,
      distance,
      pace,
      duration,
      routeColor,
      errors,
      isValid: errors.length === 0,
    });
  }

  const totalValid = parsedList.filter((r) => r.isValid).length;
  const totalErrors = parsedList.filter((r) => !r.isValid).length;
  const totalNeedsConfirmation = parsedList.filter((r) => r.needsAdminConfirmation).length;

  return {
    rows: parsedList,
    detectedColMap: colMap,
    hasHeader,
    totalValid,
    totalErrors,
    totalNeedsConfirmation,
  };
}

export function parseDelimitedText(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const firstLine = lines[0];
  const isTab = firstLine.includes('\t');
  const delimiter = isTab ? '\t' : firstLine.includes(';') ? ';' : ',';

  return lines.map((line) => {
    // Regex for handling quotes
    const pattern = new RegExp(`(?:^|${delimiter})("(?:[^"]|"")*"|[^"${delimiter}]*)`, 'g');
    const row: string[] = [];
    let match;
    while ((match = pattern.exec(line)) !== null) {
      let cell = match[1] || '';
      if (cell.startsWith('"') && cell.endsWith('"')) {
        cell = cell.slice(1, -1).replace(/""/g, '"');
      }
      row.push(cell.trim());
      if (pattern.lastIndex >= line.length) break;
    }
    return row;
  });
}

export async function parseExcelOrCsvFile(file: File): Promise<string[][]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'xlsx' || extension === 'xls') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawGrid = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false });
    return rawGrid.map((r) => r.map((c) => String(c ?? '').trim()));
  }

  const text = await file.text();
  return parseDelimitedText(text);
}
