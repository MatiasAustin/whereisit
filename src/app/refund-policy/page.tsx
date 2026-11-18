'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { StoreSettings } from '@/types';
import { INITIAL_SETTINGS } from '@/lib/studioDefaults';
import { 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';

export default function RefundPolicyPage() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const contactPhone = settings.contactPhone || '+62 851-2806-6354';
  const contactEmail = settings.contactEmail || 'whereisit26@gmail.com';
  const studioAddress = settings.studioAddress || 'Kab. Karawang & Jakarta, Indonesia';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Navbar storeSettings={settings} />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDF3F7] text-[#5C7489] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#D5E1E9]">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Jaminan Kepuasan & Perlindungan Konsumen</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#14191F] tracking-tight">
              Kebijakan Pengembalian Dana & Retur (Refund Policy)
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#6C7E8E] leading-relaxed">
              Terakhir diperbarui: 18 November 2026. Di WhereIsIt Studio, integritas material dan kepuasan pelanggan adalah prioritas utama kami.
            </p>
          </div>

          {/* Quick Summary Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-white p-5 rounded-xl border border-[#ECE6DC] shadow-sm flex items-start gap-3.5">
              <Clock className="w-5 h-5 text-[#5C7489] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#14191F]">Masa Klaim</h4>
                <p className="text-xs text-[#7A8B99] mt-1">Maksimal 2x24 jam sejak pesanan dinyatakan tiba oleh ekspedisi.</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#ECE6DC] shadow-sm flex items-start gap-3.5">
              <FileCheck className="w-5 h-5 text-[#5C7489] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#14191F]">Syarat Video Unboxing</h4>
                <p className="text-xs text-[#7A8B99] mt-1">Rekaman video utuh tanpa jeda saat membuka segel paket pertama kali.</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#ECE6DC] shadow-sm flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-[#5C7489] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#14191F]">Garansi Cetak Ulang</h4>
                <p className="text-xs text-[#7A8B99] mt-1">Barang rusak saat transit diganti baru gratis atau refund penuh.</p>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white border border-[#ECE6DC] rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 text-[#333E48] text-sm leading-relaxed">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">1</span>
                <span>Ketentuan Umum Pengembalian (Eligibility)</span>
              </h2>
              <p>
                Kami berkomitmen memastikan setiap objek 3D yang dikirimkan memenuhi standar manufaktur dan finishing tertinggi. Pengajuan pengembalian dana (refund) atau penggantian barang (replacement) hanya dapat diproses apabila memenuhi ketentuan berikut:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#51606D]">
                <li>Pesanan diterima dalam kondisi rusak, patah, retak, atau pecah saat pengiriman oleh pihak logistik.</li>
                <li>Terdapat cacat struktural fatal (delaminasi layer ekstrem, deformasi parah) yang lolos dari tahap Quality Control (QC).</li>
                <li>Barang yang diterima salah spesifikasi (warna, varian ukuran, atau model rute Strava tidak sesuai dengan invoice pesanan yang disetujui).</li>
                <li>Laporan diajukan selambat-lambatnya <strong>2 x 24 jam</strong> kalender setelah kurir menyatakan paket diterima di sistem pelacakan.</li>
              </ul>
            </section>

            <hr className="border-[#ECE6DC]" />

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">2</span>
                <span>Ketentuan Khusus Produk Custom & Pre-Order</span>
              </h2>
              <p>
                Sebagian besar produk WhereIsIt dibuat secara <em>custom-on-demand</em> (seperti Keychain Strava personal, kustom karakter, dan karya 3D CAD kustom). Oleh karena itu:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#51606D]">
                <li>
                  <strong>Tidak dapat dibatalkan atau di-refund karena perubahan pikiran (change of mind)</strong> setelah pembeli menyetujui preview desain dan proses cetak 3D telah berjalan.
                </li>
                <li>
                  Apabila terdapat kesalahan pada rute/teks yang disebabkan oleh kesalahan input data dari pembeli (dan telah dikonfirmasi sebelumnya), WhereIsIt tidak berkewajiban memberikan refund, namun kami dapat menawarkan diskon khusus untuk cetak ulang perbaikan.
                </li>
                <li>
                  Jika kesalahan berasal dari pihak WhereIsIt (hasil cetak tidak sesuai dengan layout preview WhatsApp yang disepakati), kami akan melakukan <strong>cetak ulang dan pengiriman baru 100% gratis</strong> atau pengembalian dana penuh.
                </li>
              </ul>
            </section>

            <hr className="border-[#ECE6DC]" />

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">3</span>
                <span>Prosedur Klaim & Bukti Video Unboxing</span>
              </h2>
              <p>
                Untuk memvalidasi klaim dan mencegah penyalahgunaan, pembeli <strong>wajib</strong> melampirkan:
              </p>
              <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-4 text-xs space-y-2">
                <p className="font-semibold text-[#876527] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#C98A2C]" />
                  <span>Persyaratan Video Unboxing Resmi:</span>
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-[#6B5A3C]">
                  <li>Video dimulai saat paket masih tertutup rapat dan segel WhereIsIt belum dibuka.</li>
                  <li>Label resi pengiriman terlihat jelas di awal video.</li>
                  <li>Proses pembukaan boks dan inspeksi fisik barang direkam dalam satu video tanpa dipotong (no cut/edit).</li>
                </ol>
              </div>
              <p className="text-xs text-[#7A8B99]">
                Klaim yang diajukan tanpa video unboxing utuh dapat kami tolak apabila kerusakan terindikasi terjadi setelah paket dibuka atau akibat pemakaian sendiri.
              </p>
            </section>

            <hr className="border-[#ECE6DC]" />

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">4</span>
                <span>Mekanisme & Estimasi Waktu Pengembalian Dana</span>
              </h2>
              <p>
                Setelah tim QC WhereIsIt memverifikasi dan menyetujui klaim refund Anda:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#51606D]">
                <li>
                  <strong>Pembayaran melalui Payment Gateway (iPaymu / Mayar / QRIS / Kartu Kredit / E-Wallet):</strong> Dana akan dikembalikan melalui mekanisme <em>refund reversal</em> ke sumber pembayaran asal Anda dalam waktu <strong>3 hingga 7 hari kerja</strong> perbankan.
                </li>
                <li>
                  <strong>Pembayaran melalui Virtual Account / Transfer Bank:</strong> Pengembalian dana ditransfer langsung ke rekening bank yang Anda berikan dalam waktu <strong>1 hingga 3 hari kerja</strong> setelah nomor rekening terverifikasi.
                </li>
                <li>
                  Biaya ongkos kirim awal akan di-refund penuh jika kesalahan berasal dari cacat produk atau kesalahan pengiriman WhereIsIt.
                </li>
              </ul>
            </section>

            <hr className="border-[#ECE6DC]" />

            {/* Section 5: Return Address & Contact Information (iPaymu Requirement) */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-[#14191F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#14191F] text-white text-xs flex items-center justify-center font-semibold">5</span>
                <span>Alamat Pengiriman Retur & Kontak Layanan</span>
              </h2>
              <p>
                Untuk pengiriman produk retur fisik (setelah mendapatkan persetujuan Return Merchandise Authorization / RMA dari tim kami), silakan kirimkan paket ke alamat studio operasional kami:
              </p>
              
              <div className="bg-[#FAF8F5] border border-[#E2D9CC] rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#5C7489] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#14191F]">WhereIsIt Design Studio (Penerimaan Retur):</span>
                    <p className="text-[#51606D] mt-0.5">{studioAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#5C7489] shrink-0" />
                  <div>
                    <span className="font-bold text-[#14191F]">Telepon / WhatsApp Layanan:</span>
                    <span className="text-[#51606D] ml-2">{contactPhone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#5C7489] shrink-0" />
                  <div>
                    <span className="font-bold text-[#14191F]">Email Resmi Bantuan:</span>
                    <span className="text-[#51606D] ml-2">{contactEmail}</span>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Quick Contact Action */}
          <div className="mt-8 text-center text-xs text-[#7A8B99]">
            Ada kendala dengan pesanan Anda? Kunjungi{' '}
            <Link href="/kontak" className="text-[#5C7489] font-bold hover:underline">
              Halaman Kontak Kami
            </Link>{' '}
            atau baca{' '}
            <Link href="/terms-and-conditions" className="text-[#5C7489] font-bold hover:underline">
              Syarat & Ketentuan Layanan
            </Link>.
          </div>

        </div>
      </main>

      <Footer storeSettings={settings} />
    </div>
  );
}
