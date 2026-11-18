'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { StoreSettings } from '@/types';
import { INITIAL_SETTINGS } from '@/lib/studioDefaults';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export default function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Pemesanan & Pre-Order',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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
  
  // Clean phone for whatsapp link
  const rawPhone = contactPhone.replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone}?text=Halo%20WhereIsIt%20Studio,%20saya%20ingin%20bertanya%20mengenai%20produk%20dan%20layanan.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('Mohon lengkapi nama, email, dan pesan Anda.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Pemesanan & Pre-Order',
          message: '',
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(json.error || 'Terjadi kesalahan saat mengirim pesan.');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Koneksi terputus. Silakan coba kembali atau hubungi kami via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Navbar storeSettings={settings} />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDF3F7] text-[#5C7489] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#D5E1E9]">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Hubungi Tim WhereIsIt</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#14191F] tracking-tight">
              Kontak & Informasi Usaha
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#6C7E8E] leading-relaxed">
              Kami siap melayani kebutuhan konsultasi desain 3D, verifikasi pesanan, pengiriman, hingga kemitraan komersial.
            </p>
          </div>

          {/* Grid Layout: Contact Info & Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Official Business Credentials (iPaymu Mandatory Compliance) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Business Identity Card */}
              <div className="bg-white border border-[#ECE6DC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C7489]">
                    <Building2 className="w-4 h-4" />
                    <span>Identitas Resmi Usaha</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#14191F] mt-1">WhereIsIt Design Studio</h3>
                  <p className="text-xs text-[#7A8B99] mt-0.5">3D Printed Premium Stuff & Bespoke Studio</p>
                </div>

                <div className="space-y-4 text-sm">
                  
                  {/* Address */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#F0EBE1]">
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#E2D9CC] flex items-center justify-center shrink-0 text-[#5C7489]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#7A8B99] block">
                        Alamat Usaha / Workshop
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-[#14191F] mt-0.5 leading-relaxed">
                        {studioAddress}
                      </p>
                    </div>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#F0EBE1]">
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#E2D9CC] flex items-center justify-center shrink-0 text-[#5C7489]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#7A8B99] block">
                        Nomor Telepon & WhatsApp
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-[#14191F] mt-0.5">
                        {contactPhone}
                      </p>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#5C7489] hover:underline font-semibold mt-1"
                      >
                        <span>Chat WhatsApp Studio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#F0EBE1]">
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#E2D9CC] flex items-center justify-center shrink-0 text-[#5C7489]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#7A8B99] block">
                        Email Resmi
                      </span>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-xs sm:text-sm font-semibold text-[#14191F] hover:text-[#5C7489] transition-colors mt-0.5 block"
                      >
                        {contactEmail}
                      </a>
                      <span className="text-[11px] text-[#8E9FAA]">Respon cepat dalam 1-4 jam kerja</span>
                    </div>
                  </div>

                  {/* Operational Hours */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#F0EBE1]">
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#E2D9CC] flex items-center justify-center shrink-0 text-[#5C7489]">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#7A8B99] block">
                        Jam Operasional Studio
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-[#14191F] mt-0.5">
                        Senin – Sabtu: 09:00 – 18:00 WIB
                      </p>
                      <span className="text-[11px] text-[#8E9FAA]">Minggu & Libur Nasional: Tutup / Layanan Otomatis</span>
                    </div>
                  </div>

                </div>

                {/* Verification Notice Badge */}
                <div className="p-3.5 rounded-xl bg-[#EDF3F7] border border-[#D5E1E9] flex items-start gap-3 text-xs text-[#42586B]">
                  <ShieldCheck className="w-4 h-4 text-[#5C7489] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Identitas alamat, kontak telepon, dan email di atas adalah resmi terdaftar untuk verifikasi akun merchant dan layanan konsumen.
                  </p>
                </div>

              </div>

            </div>

            {/* Right Column: Contact Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-[#ECE6DC] rounded-2xl p-6 sm:p-10 shadow-sm">
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#14191F]">Kirim Pesan Langsung</h3>
                  <p className="text-xs sm:text-sm text-[#7A8B99] mt-1">
                    Silakan isi formulir di bawah ini. Tim kami akan menghubungi Anda kembali melalui email atau WhatsApp.
                  </p>
                </div>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Pesan Berhasil Terkirim!</span>
                      <p className="mt-0.5 text-emerald-700">
                        Terima kasih. Pesan Anda telah kami terima dan tim WhereIsIt akan segera merespons secepatnya.
                      </p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm">
                    <span className="font-bold">Gagal Mengirim Pesan:</span> {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#14191F] uppercase tracking-wider mb-1.5">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: Austin Matias"
                        className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E2D9CC] rounded-xl text-xs sm:text-sm text-[#14191F] placeholder-[#8E9FAA] focus:bg-white focus:outline-none focus:border-[#5C7489] transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-[#14191F] uppercase tracking-wider mb-1.5">
                        Alamat Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="nama@email.com"
                        className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E2D9CC] rounded-xl text-xs sm:text-sm text-[#14191F] placeholder-[#8E9FAA] focus:bg-white focus:outline-none focus:border-[#5C7489] transition-all"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-[#14191F] uppercase tracking-wider mb-1.5">
                        Nomor WhatsApp / HP
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+62 812..."
                        className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E2D9CC] rounded-xl text-xs sm:text-sm text-[#14191F] placeholder-[#8E9FAA] focus:bg-white focus:outline-none focus:border-[#5C7489] transition-all"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-bold text-[#14191F] uppercase tracking-wider mb-1.5">
                        Kategori Pesan
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E2D9CC] rounded-xl text-xs sm:text-sm text-[#14191F] focus:bg-white focus:outline-none focus:border-[#5C7489] transition-all"
                      >
                        <option value="Pemesanan & Pre-Order">Pemesanan & Pre-Order</option>
                        <option value="Custom 3D / Desain Studio">Custom 3D / Desain Studio</option>
                        <option value="Konfirmasi Pembayaran Gateway">Konfirmasi Pembayaran Gateway</option>
                        <option value="Pengiriman & Pelacakan Resi">Pengiriman & Pelacakan Resi</option>
                        <option value="Klaim Garansi & Retur">Klaim Garansi & Retur</option>
                        <option value="Kemitraan / Kerjasama Bisnis">Kemitraan / Kerjasama Bisnis</option>
                      </select>
                    </div>

                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-[#14191F] uppercase tracking-wider mb-1.5">
                      Pesan Anda <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tuliskan pertanyaan, rincian pesanan, atau kebutuhan custom 3D Anda secara jelas..."
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E2D9CC] rounded-xl text-xs sm:text-sm text-[#14191F] placeholder-[#8E9FAA] focus:bg-white focus:outline-none focus:border-[#5C7489] transition-all resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#14191F] hover:bg-[#2B3846] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isSubmitting ? (
                        <span>Mengirim Pesan...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Pesan Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>

              </div>
            </div>

          </div>

          {/* Additional Quick Links */}
          <div className="mt-12 pt-8 border-t border-[#ECE6DC] flex flex-wrap items-center justify-between gap-4 text-xs text-[#7A8B99]">
            <p>© {new Date().getFullYear()} WhereIsIt Design Studio. Dokumen resmi operasional.</p>
            <div className="flex items-center gap-4">
              <Link href="/faq" className="hover:text-[#14191F] transition-colors underline">
                FAQ (Tanya Jawab)
              </Link>
              <Link href="/refund-policy" className="hover:text-[#14191F] transition-colors underline">
                Refund Policy
              </Link>
              <Link href="/terms-and-conditions" className="hover:text-[#14191F] transition-colors underline">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer storeSettings={settings} />
    </div>
  );
}
