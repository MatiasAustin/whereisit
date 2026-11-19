'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { getWhatsAppAdminLink } from '@/data/stravaKeychainConfig';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Trash2, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  MessageCircle, 
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { StravaPreOrder } from '@/types';

function StravaDataFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [order, setOrder] = useState<StravaPreOrder | null>(null);

  // Form Fields
  const [stravaUrl, setStravaUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [distance, setDistance] = useState('');
  const [pace, setPace] = useState('');
  const [duration, setDuration] = useState('');
  const [engravedText, setEngravedText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check auth and fetch order
  const handleVerifyAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) return setError('Masukkan Order ID kamu.');
    if (!phone.trim()) return setError('Masukkan nomor WhatsApp yang kamu daftarkan saat pembayaran.');

    setAuthLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/strava-orders?orderId=${encodeURIComponent(orderId.trim())}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || 'Pesanan tidak ditemukan atau nomor WhatsApp tidak sesuai.');
      }

      const fetchedOrder: StravaPreOrder = data.data;
      setOrder(fetchedOrder);
      setIsAuth(true);

      // Restore existing submitted data if present
      if (fetchedOrder.stravaData) {
        setStravaUrl(fetchedOrder.stravaData.stravaUrl || '');
        setImages(fetchedOrder.stravaData.images || []);
        setEventName(fetchedOrder.stravaData.eventName || '');
        setEventDate(fetchedOrder.stravaData.eventDate || '');
        setDistance(fetchedOrder.stravaData.distance || '');
        setPace(fetchedOrder.stravaData.pace || '');
        setDuration(fetchedOrder.stravaData.duration || '');
        setEngravedText(fetchedOrder.stravaData.engravedText || '');
        setAdminNotes(fetchedOrder.stravaData.adminNotes || '');
        if (fetchedOrder.status !== 'Dibayar — Data Belum Lengkap' && fetchedOrder.status !== 'Menunggu Pembayaran') {
          setIsSubmitted(true);
        }
      } else {
        // Restore local draft if exists
        try {
          const draftRaw = localStorage.getItem(`strava_draft_${fetchedOrder.id}`);
          if (draftRaw) {
            const draft = JSON.parse(draftRaw);
            if (draft.stravaUrl) setStravaUrl(draft.stravaUrl);
            if (draft.images) setImages(draft.images);
            if (draft.eventName) setEventName(draft.eventName);
            if (draft.eventDate) setEventDate(draft.eventDate);
            if (draft.distance) setDistance(draft.distance);
            if (draft.pace) setPace(draft.pace);
            if (draft.duration) setDuration(draft.duration);
            if (draft.engravedText) setEngravedText(draft.engravedText);
            if (draft.adminNotes) setAdminNotes(draft.adminNotes);
          }
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || 'Verifikasi gagal');
    } finally {
      setAuthLoading(false);
    }
  };

  // Autosave draft to localStorage
  useEffect(() => {
    if (isAuth && order && !isSubmitted) {
      const draft = {
        stravaUrl,
        images,
        eventName,
        eventDate,
        distance,
        pace,
        duration,
        engravedText,
        adminNotes,
      };
      try {
        localStorage.setItem(`strava_draft_${order.id}`, JSON.stringify(draft));
      } catch {}
    }
  }, [isAuth, order, stravaUrl, images, eventName, eventDate, distance, pace, duration, engravedText, adminNotes, isSubmitted]);

  // Helper to optimize and compress screenshots client-side before upload
  const compressScreenshot = async (file: File): Promise<File> => {
    if (typeof window === 'undefined') return file;
    // If small enough (< 300KB) and already WebP/JPEG, upload directly
    if (file.size < 300 * 1024 && file.type !== 'image/png') return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 1600;
          let { width, height } = img;

          if (width > height && width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size >= file.size) {
                resolve(file);
              } else {
                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^.]+$/, '.webp'),
                  { type: 'image/webp' }
                );
                resolve(compressedFile);
              }
            },
            'image/webp',
            0.82
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  // Handle image upload (1 to 3 images)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 3) {
      setError('Maksimal 3 foto screenshot');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const rawFile = files[i];
        const fileToUpload = await compressScreenshot(rawFile);
        const formData = new FormData();
        formData.append('file', fileToUpload);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal mengunggah gambar');
        }

        setImages((prev) => [...prev, data.url]);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah file gambar');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle final form submit
  const handleSubmitData = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!stravaUrl.toLowerCase().includes('strava.com')) {
      return setError('URL Strava tidak valid. Tautan harus berisi domain strava.com.');
    }
    if (images.length === 0) {
      return setError('Wajib mengunggah minimal 1 gambar screenshot rute Strava kamu.');
    }
    if (!eventName.trim() || !eventDate.trim() || !distance.trim() || !pace.trim() || !duration.trim()) {
      return setError('Mohon lengkapi semua kolom wajib (Event, Tanggal, Jarak, Pace, Durasi).');
    }

    setLoading(true);

    try {
      const payload = {
        orderId: order?.id,
        phone,
        stravaUrl,
        images,
        eventName,
        eventDate,
        distance,
        pace,
        duration,
        engravedText,
        adminNotes,
      };

      const res = await fetch('/api/strava-orders/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan formulir data');
      }

      setIsSubmitted(true);
      // Clean up local draft
      if (order?.id) {
        try {
          localStorage.removeItem(`strava_draft_${order.id}`);
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      
      {/* Title & Stage Notice */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
          Step 2 / 4 — Formulir Wajib
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
          Lengkapi Data Rute Strava Kamu
        </h1>
        <p className="text-xs sm:text-sm text-[#556473] max-w-lg mx-auto leading-relaxed">
          Produksi gantungan kunci 3D dimulai setelah data rute divalidasi dan kamu menyetujui preview 3D yang dikirim admin via WhatsApp.
        </p>
      </div>

      {/* STEP 1: AUTHENTICATION WITH ORDER ID + WHATSAPP */}
      {!isAuth ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE6DC] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#F0EBE3]">
            <div className="w-10 h-10 rounded-2xl bg-[#EDF3F7] text-[#5C7489] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14191F]">Verifikasi Pesanan Kamu</h2>
              <p className="text-xs text-[#7A8B99]">Masukkan Order ID dan Nomor WhatsApp yang terdaftar saat checkout</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyAccess} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                Order ID *
              </label>
              <input
                type="text"
                required
                placeholder="WSI-YYYYMMDD-XXXX"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono focus:outline-none focus:border-[#5C7489]"
              />
              <span className="text-[10px] text-[#7A8B99] mt-1 block">
                Cek riwayat pesanan, WhatsApp, atau bukti invoice kamu untuk melihat Order ID.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                Nomor WhatsApp Terdaftar *
              </label>
              <input
                type="tel"
                required
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors shadow-md disabled:opacity-50"
            >
              {authLoading ? 'Memeriksa Data Pesanan...' : 'Buka Formulir Data Strava'}
            </button>
          </form>

          <div className="pt-4 border-t border-[#F0EBE3] flex items-center justify-between text-xs text-[#7A8B99]">
            <span>Belum pre-order?</span>
            <Link href="/preorder/keychain-strava" className="text-[#5C7489] font-bold hover:underline">
              Pre-Order Sekarang
            </Link>
          </div>
        </div>
      ) : isSubmitted ? (
        /* STEP 3: SUBMITTED CONFIRMATION */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ECE6DC] shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#5C7489]">
              Data Berhasil Diterima
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#14191F]">
              Terima Kasih, {order?.customer.fullName}!
            </h2>
            <p className="text-xs sm:text-sm text-[#556473] max-w-md mx-auto leading-relaxed">
              Data rute Strava untuk pesanan <strong>#{order?.id}</strong> telah masuk ke studio WhereIsIt.
            </p>
          </div>

          {/* Next steps timeline summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7] text-left space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#14191F] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5C7489]" />
              <span>Langkah Selanjutnya</span>
            </h3>
            <ul className="text-xs text-[#556473] space-y-2 list-disc pl-4">
              <li>
                <strong>Konfirmasi Desain via WhatsApp:</strong> Desainer kami akan memvalidasi jalur dan mengirimkan preview 3D rute kamu ke nomor <strong>{order?.customer.phone}</strong>.
              </li>
              <li>
                <strong>Persetujuan Cetak:</strong> Setelah kamu menyetujui layout 3D, pesanan akan langsung dijadwalkan ke antrian mesin 3D print mikron.
              </li>
              <li>
                <strong>Pantau Antrian:</strong> Kamu dapat melihat progres cetak dan estimasi siap di halaman pelacakan.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/track?orderId=${order?.id}&phone=${phone}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#14191F] hover:bg-[#5C7489] text-white text-xs font-bold transition-colors shadow-sm"
            >
              Pantau Progres di Lacak Pesanan
            </Link>

            <a
              href={getWhatsAppAdminLink(order?.id, 'Halo admin, saya baru saja mengirimkan formulir data rute Strava.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#FAF8F5] hover:bg-[#F2EDE4] text-[#14191F] border border-[#DDD5C7] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Hubungi Admin di WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        /* STEP 2: POST-PAYMENT DATA FORM */
        <form onSubmit={handleSubmitData} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE6DC] shadow-sm space-y-6">
          
          {/* Order Header Summary */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] text-[#7A8B99] uppercase font-bold tracking-wider">Order ID</span>
              <p className="font-mono font-bold text-[#14191F] text-sm">#{order?.id}</p>
              <span className="text-[#5C7489] font-medium">{order?.variationName}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-[#7A8B99] uppercase font-bold tracking-wider">Status Pembayaran</span>
              <p className="font-bold text-emerald-700 flex items-center gap-1 sm:justify-end">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{order?.paymentMethod === 'Clicky' ? 'Terverifikasi Studio' : 'Terverifikasi'}</span>
              </p>
              <span className="text-[11px] text-[#556473]">Pemesan: {order?.customer.fullName}</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. URL Strava */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#44505C] uppercase tracking-wider">
              1. URL / Tautan Aktivitas Strava *
            </label>
            <input
              type="url"
              required
              placeholder="https://www.strava.com/activities/12345678901"
              value={stravaUrl}
              onChange={(e) => setStravaUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
            <p className="text-[10px] text-[#7A8B99]">
              Buka aplikasi Strava &rarr; pilih aktivitas lari kamu &rarr; Bagikan (Share) &rarr; Salin Tautan (Copy link). Tautan publik maupun rute diterima.
            </p>
          </div>

          {/* 2. Upload Gambar Screenshot (1-3 files) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#44505C] uppercase tracking-wider">
              2. Upload Screenshot Rute Strava (1–3 Gambar) *
            </label>
            <p className="text-[10px] text-[#7A8B99]">
              Format JPG, PNG, atau WebP (maks. 10MB per foto). Screenshot peta rute dan summary data lari.
            </p>

            {/* Thumbnail Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-[#DDD5C7] bg-[#F2EDE4] group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors shadow-sm"
                      title="Hapus gambar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/60 text-white">
                      Foto #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* File Input */}
            {images.length < 3 && (
              <label className="border-2 border-dashed border-[#DDD5C7] hover:border-[#5C7489] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[#FAF8F5]">
                <Upload className="w-6 h-6 text-[#7A8B99]" />
                <span className="text-xs font-semibold text-[#14191F]">
                  {uploadingImage ? 'Mengunggah...' : 'Klik untuk mengunggah screenshot Strava'}
                </span>
                <span className="text-[10px] text-[#7A8B99]">
                  {3 - images.length} slot tersisa
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  disabled={uploadingImage}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 3. Event / Moment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F0EBE3]">
            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1 uppercase tracking-wider">
                3. Nama Event / Momen Lari *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BDO ULTRA, JRF 2026, First Marathon"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1 uppercase tracking-wider">
                4. Tanggal Event *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          {/* 4. Run Stats: Distance, Pace, Duration */}
          <div className="space-y-2 pt-2 border-t border-[#F0EBE3]">
            <label className="block text-xs font-bold text-[#44505C] uppercase tracking-wider">
              5. Data Statistik Lari (Sesuai Strava) *
            </label>
            <p className="text-[10px] text-[#7A8B99]">
              Isi sesuai data di Strava kamu, data ini akan dicetak pada plat ganci dan dikonfirmasi ulang oleh admin.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                  Jarak (Distance) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 21.1 km / 42.2 km"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                  Pace Rata-Rata *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 05:25 /km"
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                  Durasi Waktu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01:54:20"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>
          </div>

          {/* 5. Custom Engraved Text (if applicable) */}
          <div className="space-y-1.5 pt-2 border-t border-[#F0EBE3]">
            <label className="block text-xs font-bold text-[#44505C] uppercase tracking-wider">
              6. Teks Personalisasi Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="e.g. SUB-4 FINISHER / PB 2026 / BIB 1042"
              value={engravedText}
              onChange={(e) => setEngravedText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
            <p className="text-[10px] text-[#7A8B99]">
              Akan diukir di bagian plat samping/belakang sesuai variasi yang dipilih.
            </p>
          </div>

          {/* 6. Catatan untuk Admin */}
          <div className="space-y-1.5 pt-2 border-t border-[#F0EBE3]">
            <label className="block text-xs font-bold text-[#44505C] uppercase tracking-wider">
              7. Catatan Khusus untuk Admin (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan catatan khusus terkait rute, preferensi warna garis rute, atau detail race kamu..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-[#ECE6DC] space-y-3">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full py-4 rounded-2xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Menyimpan Data Rute...</span>
              ) : (
                <>
                  <span>Kirim Data Rute & Masuk Antrian Desain</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[11px] text-[#7A8B99] pt-1">
              <span>Data tersimpan otomatis di browser ini (draft)</span>
              <a
                href={getWhatsAppAdminLink(order?.id, 'Halo admin, saya butuh bantuan mengisi formulir data Strava.')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5C7489] font-semibold hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Butuh bantuan? Chat Admin</span>
              </a>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function StravaDataPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-xs text-[#7A8B99] font-medium">Memuat Formulir Data Strava...</div>
          </div>
        }>
          <StravaDataFormContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
