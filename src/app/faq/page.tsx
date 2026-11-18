'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { StoreSettings } from '@/types';
import { INITIAL_SETTINGS } from '@/lib/studioDefaults';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  CreditCard, 
  Truck, 
  Layers, 
  RotateCcw, 
  MessageCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'order' | 'payment' | 'shipping' | 'product' | 'warranty';
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'order',
    question: 'Bagaimana alur cara memesan produk di WhereIsIt?',
    answer: 'Anda dapat memilih produk ready-stock di katalog atau mengikuti sistem Pre-Order (seperti Keychain Strava). Cukup pilih varian produk, klik "Pesan Sekarang" atau "Pre-Order", lengkapi rincian kontak dan pengiriman Anda, lalu selesaikan pembayaran melalui gateway resmi kami (iPaymu / Mayar). Nomor pesanan dan link pelacakan langsung diberikan otomatis.'
  },
  {
    id: 'faq-2',
    category: 'order',
    question: 'Apakah saya bisa memesan produk custom desain / custom karakter?',
    answer: 'Tentu bisa. WhereIsIt memiliki studio bespoke khusus untuk custom 3D design, industrial CAD, maupun keepsake figurine berbasis foto atau file 3D (STL/OBJ). Anda dapat mengirimkan inquiry langsung melalui halaman Custom Design atau menghubungi tim studio kami via WhatsApp.'
  },
  {
    id: 'faq-3',
    category: 'payment',
    question: 'Metode pembayaran apa saja yang didukung?',
    answer: 'Kami mendukung beragam metode pembayaran online terverifikasi otomatis melalui Payment Gateway resmi: QRIS (GoPay, OVO, Dana, ShopeePay, BCA Mobile, dll.), Virtual Account Bank (BCA, Mandiri, BNI, BRI, Permata), Kartu Kredit/Debit (Visa & Mastercard), serta Transfer Bank langsung.'
  },
  {
    id: 'faq-4',
    category: 'payment',
    question: 'Apakah transaksi dan pembayaran di WhereIsIt aman?',
    answer: 'Sangat aman. Seluruh transaksi diproses melalui koneksi terenkripsi SSL 256-bit dan diawasi oleh gateway berizin Bank Indonesia. Kami tidak pernah menyimpan nomor kartu kredit atau PIN perbankan Anda.'
  },
  {
    id: 'faq-5',
    category: 'shipping',
    question: 'Berapa lama proses pembuatan dan estimasi pengiriman?',
    answer: 'Untuk produk Ready Stock, pesanan dikirimkan dalam 1-2 hari kerja. Untuk produk Pre-Order atau Custom 3D (seperti Keychain Strava), waktu pengerjaan berkisar 3-7 hari kerja tergantung antrian mesin cetak presisi kami. Pengiriman menggunakan ekspedisi rekanan (JNE YES, SiCepat Gokil, Anteraja) dengan nomor resi terintegrasi.'
  },
  {
    id: 'faq-6',
    category: 'shipping',
    question: 'Bagaimana cara melacak status pesanan saya?',
    answer: 'Anda dapat mengunjungi halaman Lacak Pesanan (/track) kapan saja dan memasukkan Nomor Pesanan (Order ID) atau nomor WhatsApp Anda. Sistem akan menampilkan status real-time mulai dari verifikasi pembayaran, review desain, antrian mesin cetak, QC finishing, hingga nomor resi pengiriman.'
  },
  {
    id: 'faq-7',
    category: 'product',
    question: 'Material apa yang digunakan dalam produk WhereIsIt?',
    answer: 'Kami menggunakan bio-polymer premium grade (High-Grade PLA+, Matte Architectural Filament, dan Precision Photopolymer Resin). Material ini ramah lingkungan, tidak berbau, kokoh, dan tahan lama untuk dekorasi ruang kerja maupun penggunaan harian.'
  },
  {
    id: 'faq-8',
    category: 'warranty',
    question: 'Bagaimana jika pesanan saya rusak saat proses pengiriman?',
    answer: 'Kami memberikan Garansi Transit Penuh (Transit Guarantee). Apabila barang tiba dalam kondisi patah atau rusak akibat kurir, sertakan video unboxing maksimal 2x24 jam sejak barang diterima. Tim kami akan segera mencetak ulang produk pengganti atau memproses refund sesuai Kebijakan Pengembalian Dana kami.'
  },
  {
    id: 'faq-9',
    category: 'warranty',
    question: 'Bagaimana cara mengajukan pembatalan atau retur?',
    answer: 'Pengajuan pembatalan hanya dapat dilakukan sebelum proses produksi cetak 3D dimulai. Untuk klaim retur atau refund barang cacat, silakan hubungi tim dukungan kami melalui WhatsApp atau formulir di halaman Kontak dengan menyertakan nomor pesanan Anda.'
  }
];

export default function FAQPage() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ 'faq-1': true, 'faq-3': true });

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

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFAQs = FAQ_LIST.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Navbar storeSettings={settings} />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDF3F7] text-[#5C7489] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#D5E1E9]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Pusat Bantuan & Tanya Jawab</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#14191F] tracking-tight">
              Frequently Asked Questions (FAQ)
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#6C7E8E] leading-relaxed">
              Temukan jawaban seputar pemesanan, pembayaran resmi, alur produksi 3D, pengiriman, dan kebijakan garansi di WhereIsIt Studio.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8B99]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pertanyaan, kata kunci, pembayaran, retur..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E2D9CC] rounded-xl text-sm text-[#14191F] placeholder-[#8E9FAA] focus:outline-none focus:border-[#5C7489] shadow-sm transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 text-xs font-medium">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#14191F] text-white shadow-sm'
                  : 'bg-white text-[#4A5560] border border-[#E2D9CC] hover:bg-[#F0ECE4]'
              }`}
            >
              Semua Pertanyaan
            </button>
            <button
              onClick={() => setActiveCategory('order')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeCategory === 'order'
                  ? 'bg-[#14191F] text-white shadow-sm'
                  : 'bg-white text-[#4A5560] border border-[#E2D9CC] hover:bg-[#F0ECE4]'
              }`}
            >
              Pemesanan
            </button>
            <button
              onClick={() => setActiveCategory('payment')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeCategory === 'payment'
                  ? 'bg-[#14191F] text-white shadow-sm'
                  : 'bg-white text-[#4A5560] border border-[#E2D9CC] hover:bg-[#F0ECE4]'
              }`}
            >
              Pembayaran
            </button>
            <button
              onClick={() => setActiveCategory('shipping')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeCategory === 'shipping'
                  ? 'bg-[#14191F] text-white shadow-sm'
                  : 'bg-white text-[#4A5560] border border-[#E2D9CC] hover:bg-[#F0ECE4]'
              }`}
            >
              Pengiriman
            </button>
            <button
              onClick={() => setActiveCategory('warranty')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeCategory === 'warranty'
                  ? 'bg-[#14191F] text-white shadow-sm'
                  : 'bg-white text-[#4A5560] border border-[#E2D9CC] hover:bg-[#F0ECE4]'
              }`}
            >
              Garansi & Retur
            </button>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#ECE6DC] p-8">
                <p className="text-sm text-[#7A8B99]">Tidak ada pertanyaan yang sesuai dengan pencarian &quot;{searchQuery}&quot;.</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="mt-3 text-xs font-semibold text-[#5C7489] hover:underline"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              filteredFAQs.map((faq) => {
                const isOpen = !!openItems[faq.id];
                return (
                  <div
                    key={faq.id}
                    className="bg-white border border-[#E8E2D8] rounded-xl overflow-hidden transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
                  >
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-semibold text-[#14191F]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#7A8B99] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#5C7489]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#5C6773] leading-relaxed border-t border-[#F2ECE2] bg-[#FCFBF9]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Card: Need more help? */}
          <div className="mt-14 bg-white border border-[#ECE6DC] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-[#14191F]">Punya pertanyaan lain yang belum terjawab?</h3>
              <p className="text-xs text-[#7A8B99]">Tim layanan studio kami siap membantu setiap hari kerja (09.00 - 18.00 WIB).</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/kontak"
                className="px-5 py-2.5 rounded-lg bg-[#14191F] hover:bg-[#2B3846] text-white text-xs font-semibold transition-colors"
              >
                Halaman Kontak
              </Link>
              <Link
                href="/refund-policy"
                className="px-5 py-2.5 rounded-lg bg-[#EDF3F7] hover:bg-[#D5E1E9] text-[#5C7489] text-xs font-semibold transition-colors"
              >
                Kebijakan Retur
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer storeSettings={settings} />
    </div>
  );
}
