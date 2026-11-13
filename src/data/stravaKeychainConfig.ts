import { StravaVariation } from '@/types';

export const STRAVA_PRODUCT_CONFIG = {
  name: 'Keychain Custom Data Strava x Where Is It? 3D print Custom',
  shortName: 'Strava 3D Route Keychain',
  hook: 'Rute lari kamu, sekarang bisa dipegang.',
  badge: 'Pre-Order',
  priceRange: 'Rp 119.000 – Rp 200.000',
  defaultLeadDays: 7, // 5-7 hari kerja
  shopeeMaxDays: 10,
  
  // Real Social Proof & Source of Truth
  sourceOfTruth: {
    shopeeUrl: 'https://shopee.co.id/product/760174452/41886615712',
    shopeeRating: '5.0',
    shopeeLocation: 'Kab. Karawang & Jakarta',
    threadsUrl: 'https://www.threads.com/@jaynrrrrr/post/Dfg443YFJQX',
    threadsViews: '88.2K',
    threadsDate: '9 Nov 2026',
    studioLocation: 'Jakarta / Workshop Kab. Karawang',
  },

  // 3 Variations directly mapped to Shopee listing
  variations: [
    {
      id: 'var-standard',
      name: 'Standard 3D Route Keychain',
      price: 119000,
      badge: 'Starter Memorable',
      shortDesc: 'Gantungan kunci 3D print presisi rute lari personal + plat data jarak, pace, durasi.',
      features: [
        'Custom 3D topographic route map dari Strava kamu',
        'Plat data: Total Jarak (KM), Avg Pace, Total Durasi',
        'Custom nama event / tanggal race / momen lari',
        'High-grade stainless steel split ring & clasp',
        'Finishing studio matte halus & tahan air',
      ],
      includesEmoney: false,
    },
    {
      id: 'var-emoney',
      name: '3D Route Keychain + Integrated E-Money',
      price: 150000,
      badge: 'Paling Populer',
      isPopular: true,
      shortDesc: 'Rute Strava 3D print yang terintegrasi chip e-money aktif. Tap MRT, TransJakarta & KRL.',
      features: [
        'Semua fitur pada varian Standard',
        'Terintegrasi RFID / NFC chip contactless e-money',
        'Bisa di-tap langsung di gerbang MRT, TransJakarta, KRL & pintu akses',
        'Top-up via NFC smartphone m-banking / minimarket',
        'Konfirmasi jenis kartu didukung bersama admin saat review desain',
      ],
      includesEmoney: true,
      emoneyNote: 'Tipe kartu e-money dikonfirmasi bersama admin via WhatsApp (tidak mengklaim semua kartu, hanya tipe chip yang kompatibel).',
    },
    {
      id: 'var-duo-plate',
      name: '3D Route Keychain + E-Money + Dual Route / Custom Plate',
      price: 200000,
      badge: 'Collector Edition',
      shortDesc: 'Edisi terlengkap dengan fitur e-money dan plat belakang custom (dua rute atau personal quote).',
      features: [
        'Semua fitur varian Integrated E-Money',
        'Opsi 2 rute (misal: Half Marathon & Full Marathon) atau rute bolak-balik',
        'Plat belakang custom: Personal PB quote, bib number, atau dedikasi khusus',
        'Packaging studio edisi kado / memorabilia collector',
        'Prioritas antrian modeling & QC khusus',
      ],
      includesEmoney: true,
      todoNote: 'TODO: Konfirmasi variasi ke-3 & harga final dengan owner (Rentang listing Shopee Rp 119.000 - Rp 200.000).',
    },
  ] as StravaVariation[],

  // 6 Product Images + 3 Video Proofs (from viral Threads post & Shopee)
  gallery: [
    {
      id: 'img-1',
      type: 'image' as const,
      title: '3D Route Map & Strava Data Plate',
      caption: 'Model 3D rute "BDO ULTRA" dengan data jarak, pace, dan durasi lari yang presisi.',
      src: '/images/strava-keychain/photo-1-showcase.jpg',
      fallbackColor: '#3E5161',
      isTodo: true,
      todoLabel: 'TODO: Masukkan file foto produk 1 dari Shopee',
    },
    {
      id: 'img-2',
      type: 'image' as const,
      title: 'Macro Layering & Tactile Detail',
      caption: 'Resolusi layer 0.12mm memberikan tekstur rute yang tegas, kuat, dan nyaman dipegang.',
      src: '/images/strava-keychain/photo-2-macro.jpg',
      fallbackColor: '#5C7489',
      isTodo: true,
      todoLabel: 'TODO: Masukkan file foto produk 2 dari Shopee',
    },
    {
      id: 'img-3',
      type: 'image' as const,
      title: 'Everyday Carry & Keyring',
      caption: 'Ukuran pas untuk digantung di celana lari, lanyard, atau kunci rumah sehari-hari.',
      src: '/images/strava-keychain/photo-3-edc.jpg',
      fallbackColor: '#2B3846',
      isTodo: true,
      todoLabel: 'TODO: Masukkan file foto produk 3 dari Shopee',
    },
    {
      id: 'img-4',
      type: 'image' as const,
      title: 'Pilihan Warna & Material Studio',
      caption: 'Pilihan warna kontras: Slate Blue, Deep Noir, Alabaster White dengan aksen garis rute.',
      src: '/images/strava-keychain/photo-4-colors.jpg',
      fallbackColor: '#4A5B6B',
      isTodo: true,
      todoLabel: 'TODO: Masukkan file foto produk 4 dari Shopee',
    },
    {
      id: 'img-5',
      type: 'image' as const,
      title: 'Studio Packaging & Card',
      caption: 'Dikemas rapi dengan kotak studio WhereIsIt, cocok untuk self-reward maupun hadiah race.',
      src: '/images/strava-keychain/photo-5-packaging.jpg',
      fallbackColor: '#344351',
      isTodo: true,
      todoLabel: 'TODO: Masukkan file foto produk 5 dari Shopee',
    },
    {
      id: 'img-6',
      type: 'image' as const,
      title: 'Dimensi & Ketebalan',
      caption: 'Ketebalan proporsional untuk menampung chip e-money tanpa terasa tebal di saku.',
      src: '/images/strava-keychain/photo-6-specs.jpg',
      fallbackColor: '#536A7D',
      isTodo: true,
      todoLabel: 'TODO: Masukkan file foto produk 6 dari Shopee',
    },
    // Video Proofs from Threads Post
    {
      id: 'vid-mrt-tap',
      type: 'video' as const,
      title: 'Bukti Tap di Gerbang MRT Jakarta',
      caption: 'Gantungan kunci di-tap di reader fare gate MRT Jakarta: lampu hijau menyala dan saldo langsung terbaca.',
      src: '/videos/strava-keychain/threads-mrt-tap.mp4',
      isTodo: true,
      todoLabel: 'TODO: Masukkan file video bukti tap MRT dari postingan Threads @jaynrrrrr',
      highlightBadge: 'Bukti Video Threads (88.2K Views)',
    },
    {
      id: 'vid-pants-clip',
      type: 'video' as const,
      title: 'Keychain Terpasang di Celana Lari',
      caption: 'Ringan, kokoh, dan tidak berisik saat dibawa beraktivitas sehari-hari.',
      src: '/videos/strava-keychain/threads-clip-pants.mp4',
      isTodo: true,
      todoLabel: 'TODO: Masukkan file video clip di celana dari postingan Threads',
      highlightBadge: 'Everyday Carry',
    },
    {
      id: 'vid-blender-cad',
      type: 'video' as const,
      title: 'Proses 3D Modeling Blender ("BDO ULTRA")',
      caption: 'Setiap rute diekstraksi dari data GPX dan dimodelkan presisi di software 3D sebelum dicetak.',
      src: '/videos/strava-keychain/threads-blender-cad.mp4',
      isTodo: true,
      todoLabel: 'TODO: Masukkan file video preview 3D Blender dari postingan Threads',
      highlightBadge: 'Crafting & 3D Modeling',
    },
  ],

  // Pixar-Style Short Story (3-4 paragraphs)
  story: [
    {
      phase: 'The Run',
      title: 'Lari yang Tidak Pernah Kamu Lupakan',
      text: 'Kamu bangun jam empat pagi, mengikat tali sepatu dalam dinginnya fajar, dan menempuh kilometer demi kilometer dengan sisa tenaga. Ada tetes keringat, napas yang terengah, dan rasa bangga yang meledak ketika kamu akhirnya menyentuh garis finish dengan catatan waktu terbaikmu.',
    },
    {
      phase: 'The Problem',
      title: 'Medali di Laci, Data Hanya di Layar',
      text: 'Namun setelah foto feed Instagram meredup dan medali disimpan di dalam laci kamar, memori perjuangan itu perlahan terbenam. Kartu e-money di dompetmu pun hanya lembaran plastik polos yang dingin dan tak punya jiwa.',
    },
    {
      phase: 'The Keepsake',
      title: 'Rute Lari Kamu, Sekarang Nyata & Bertekstur',
      text: 'Kami percaya setiap kilometer yang kamu tempuh pantas dikenang lebih dari sekadar deretan angka digital. Menggunakan teknologi 3D architectural print berpresisi mikron, WhereIsIt merekonstruksi kontur elevasi dan belokan rute lari pribadimu menjadi gantungan kunci yang berbobot nyata di genggaman tangan.',
    },
    {
      phase: 'Everyday Carry',
      title: 'Teman Tap Harian di Setiap Langkah',
      text: 'Kini, dengan chip e-money terintegrasi, setiap kali kamu menempelkan gantungan kunci ini di pintu MRT, halte TransJakarta, atau gerbang kantor, lampu hijau yang menyala adalah pengingat tenang: kamu pernah berlari sejauh itu, dan kamu berhasil.',
    },
  ],

  // What you get
  whatYouGet: [
    {
      title: '1x Custom 3D Printed Route Keychain',
      desc: 'Bodi gantungan kunci berbahan bio-composite tangguh, dicetak khusus sesuai kontur rute Strava pribadimu.',
    },
    {
      title: 'Plaque Data Rute Personal',
      desc: 'Ukiran data jarak total, pace rata-rata, durasi finish, serta nama event / tanggal lari yang akurat.',
    },
    {
      title: 'Fungsi E-Money Aktif (Varian Tertentu)',
      desc: 'Chip contactless tertanam di dalam bodi ganci, siap digunakan untuk tap transportasi publik dan transaksi.',
    },
    {
      title: 'Heavy-Duty Keyring & Clasp Stainless',
      desc: 'Gantungan kunci bermaterial baja tahan karat dengan kaitan kuat untuk tas, celana, atau gantungan kunci kendaraan.',
    },
    {
      title: 'Packaging Studio WhereIsIt',
      desc: 'Dikemas dalam box studio eksklusif dengan kartu authenticity dan panduan perawatan.',
    },
  ],

  // 4 Steps How it works
  howItWorks: [
    {
      step: '01',
      title: 'Pre-Order & Bayar di Website',
      desc: 'Pilih variasi yang kamu inginkan, lengkapi data kontak minimal, dan lakukan pembayaran instan via Mayar (QRIS, VA, E-Wallet, Kartu).',
      highlight: 'Tanpa perlu DM admin untuk transaksi',
    },
    {
      step: '02',
      title: 'Wajib Isi Form Data Strava',
      desc: 'Setelah pembayaran terverifikasi, kamu WAJIB mengisi formulir data: lampirkan link Strava dan unggah screenshot rute lari kamu.',
      highlight: 'PENTING: Produksi TIDAK DAPAT dimulai sebelum form ini terisi!',
    },
    {
      step: '03',
      title: 'Admin Konfirmasi Desain via WhatsApp',
      desc: 'Tim 3D artist WhereIsIt akan memverifikasi rute, menyusun layout 3D, dan mengirimkan preview konfirmasi desain ke nomor WhatsApp kamu.',
      highlight: 'Desain fix baru masuk tahap cetak',
    },
    {
      step: '04',
      title: 'Produksi 3D, QC & Pengiriman',
      desc: 'Pesanan masuk antrian produksi (dapat dipantau di Live Queue). Selesai cetak, dilakukan QC finishing, packing aman, dan pengiriman dengan nomor resi.',
      highlight: 'Pantau posisi antrian kamu secara real-time',
    },
  ],

  // FAQs
  faqs: [
    {
      q: 'Bagaimana cara membagikan link rute Strava saya?',
      a: 'Buka aplikasi Strava di HP kamu > buka aktivitas lari yang ingin dicetak > tekan ikon Share (Bagikan) > pilih "Salin Tautan" (Copy Link). Paste tautan tersebut di formulir data pasca pembayaran.',
    },
    {
      q: 'Bagaimana jika aktivitas Strava saya disetting Private (Pribadi)?',
      a: 'Kamu bisa mengubah visibilitas aktivitas tersebut sementara ke "Followers" atau "Everyone", ATAU cukup ambil screenshot layar yang jelas menampilkan peta rute, jarak, waktu, dan elevasi lalu unggah pada form data.',
    },
    {
      q: 'Kartu e-money apa saja yang didukung pada varian e-money?',
      a: 'Kami menyematkan chip RFID/NFC contactless berstandar pembaca transportasi umum dan merchant ritel. Harap konfirmasi ketersediaan tipe kartu spesifik (misal Mandiri e-money, BCA Flazz, atau BNI TapCash) bersama admin via WhatsApp saat verifikasi rute. Kami tidak mengklaim mendukung semua tipe kartu tanpa konfirmasi.',
    },
    {
      q: 'Bagaimana jika saya tidak memakai Strava (Garmin / Apple Watch / Nike Run Club)?',
      a: 'Bisa! Cukup ekspor file GPX dari aplikasi jam lari kamu ATAU ambil screenshot rangkuman lari dari Garmin Connect, Apple Fitness, Coros, atau NRC dan lampirkan di formulir.',
    },
    {
      q: 'Berapa lama estimasi waktu pengerjaan Pre-Order?',
      a: 'Estimasi pengerjaan adalah 5–7 hari kerja terhitung sejak desain 3D kamu dikonfirmasi melalui WhatsApp (maksimal 10 hari sesuai batas PO Shopee). Kamu bisa mengecek posisi antrian langsung di widget Live Queue halaman ini.',
    },
    {
      q: 'Bagaimana jika saya sudah bayar tapi lupa mengisi form data?',
      a: 'Pesananmu akan tetap tersimpan aman dengan status "Dibayar — Data Belum Lengkap". Produksi BELUM akan dimulai sebelum data kami terima. Kamu bisa melengkapi data kapan saja melalui halaman /preorder/keychain-strava/data atau menghubungi admin di WhatsApp dengan menyebutkan Order ID.',
    },
    {
      q: 'Apakah ada kebijakan pembatalan atau refund?',
      a: 'Karena produk ini merupakan custom pesanan personal (dibuat spesifik untuk rute dan nama Anda), mohon diskusikan langsung dengan admin via WhatsApp jika terdapat kendala sebelum tahap 3D modeling dimulai.',
    },
  ],
};

// WhatsApp Helper
export function getWhatsAppAdminLink(orderId?: string, customNote?: string): string {
  const number = process.env.NEXT_PUBLIC_WA_ADMIN_NUMBER || '6287776523066';
  let message = 'Halo WhereIsIt, saya mau tanya soal Keychain Strava.';
  if (orderId) {
    message += ` Order ID: ${orderId}.`;
  }
  if (customNote) {
    message += ` ${customNote}`;
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
