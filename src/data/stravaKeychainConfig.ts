import { StravaVariation } from '@/types';

export const STRAVA_PRODUCT_CONFIG = {
  name: 'Keychain Custom Data Strava x Where Is It? 3D print Custom',
  shortName: 'Strava 3D Route Keychain',
  hook: 'Rute lari kamu, sekarang bisa dipegang.',
  badge: 'Pre-Order',
  priceRange: 'Rp 119.000 – Rp 200.000',
  defaultLeadDays: 7, // 5-7 hari kerja
  shopeeMaxDays: 10,
  estimatedArrival: '26–29 Nov 2026',

  // Official Shopee Description
  descriptionId:
    'Gantungan Kunci Rute Lari Custom 3D Print — Strava x whereisit? rute lari kamu, sekarang bisa dipegang. gantungan kunci 3d print dari rute strava kamu sendiri — lengkap dengan peta rute, jarak, pace, dan waktu tempuh. cocok buat kenang-kenangan race, pb pertama, atau sekadar bukti kamu pernah lari sejauh itu.',

  // Key Features from Product Source of Truth
  keyFeatures: [
    'Rute 3D timbul (topografi 3D relief) dengan aksen garis rute oranye khas Strava',
    'Branding resmi studio: "STRAVA X whereIsIt?"',
    'Bisa difungsikan ganda sebagai kartu e-money aktif (jenis kartu dikonfirmasi bersama owner/admin)',
    'Plat data rute akurat: Peta rute + Jarak (KM) + Pace rata-rata + Waktu tempuh sesuai aktivitas Strava kamu',
    'Termasuk 1x ring gantungan kunci stainless steel kokoh',
  ],

  // Real Social Proof & Verified Store Metrics
  sourceOfTruth: {
    shopeeUrl: 'https://shopee.co.id/product/760174452/41886615712',
    shopeeShopId: '760174452',
    shopeeProductId: '41886615712',
    shopeeRating: '5.0',
    shopeeLocation: 'Kab. Karawang',
    shopeeChatRate: '84%',
    shopeeShipsWithin: '10 hari (Pre-Order)',
    threadsUrl: 'https://www.threads.com/@jaynrrrrr/post/Dfg443YFJQX',
    threadsViews: '88.2K',
    threadsLikes: '1.977',
    threadsComments: '108',
    threadsReposts: '114',
    threadsShares: '542',
    threadsDate: '9 Nov 2026',
    threadsPersonal: '@jaynrrrrr',
    threadsMain: '@whereisit.ofc',
    studioLocation: 'Kab. Karawang & Jakarta',
    viralProofNotes:
      'Prototype e-money dibuat dan disempurnakan selama 3 hari setelah ada request dari audiens. Proof: tap di gate MRT Jakarta, lampu hijau, saldo muncul (contoh Rp48.500), dipakai di kereta dan diklip di celana. Contoh rute di video Blender: BDO ULTRA.',
    topRequestedRaces: 'Bormar (Borobudur Marathon), JRF (Jakarta Running Festival), FM (Full Marathon)',
  },

  // 3 Variations directly mapped to Shopee listing & crawl data
  variations: [
    {
      id: 'var-standard',
      name: 'Standard 3D Route Keychain',
      price: 119000,
      badge: 'Starter Memorable',
      shortDesc: 'Gantungan kunci 3D print timbul rute lari personal + plat data jarak, pace, dan durasi.',
      features: [
        'Custom 3D topographic relief map dari rute Strava kamu',
        'Aksen garis rute lari oranye kontras khas Strava',
        'Branding resmi studio "STRAVA X whereIsIt?"',
        'Plat data: Total Jarak (KM), Avg Pace, Total Waktu Tempuh',
        'Custom nama event / tanggal race / momen personal (e.g. Bormar, JRF, PB)',
        'Termasuk heavy-duty stainless split ring & clasp',
      ],
      includesEmoney: false,
    },
    {
      id: 'var-emoney',
      name: '3D Route Keychain + Integrated E-Money',
      price: 150000,
      badge: 'Paling Populer',
      isPopular: true,
      shortDesc: 'Rute Strava 3D timbul terintegrasi chip e-money aktif. Tap langsung di gerbang MRT, TransJakarta & KRL.',
      features: [
        'Semua fitur pada varian Standard 3D Route',
        'Terintegrasi RFID / NFC chip contactless e-money di dalam bodi',
        'Bisa di-tap langsung di fare gate MRT Jakarta (lampu hijau & saldo muncul)',
        'Dapat digunakan untuk TransJakarta, KRL Commuter Line & pembayaran minimarket',
        'Bisa top-up saldo via NFC smartphone m-banking atau kasir minimarket',
        'Jenis kartu e-money dikonfirmasi bersama admin saat review desain (Flazz / TapCash / dll)',
      ],
      includesEmoney: true,
      emoneyNote: 'Tipe kartu e-money dikonfirmasi bersama admin via WhatsApp (tidak mengklaim semua kartu, hanya tipe chip yang kompatibel).',
    },
    {
      id: 'var-duo-plate',
      name: '3D Route Keychain + E-Money + Dual Route / Custom Plate',
      price: 200000,
      badge: 'Collector Edition',
      shortDesc: 'Edisi terlengkap dengan fitur e-money dan plat custom (dua rute atau personal PB engraved text).',
      features: [
        'Semua fitur varian Integrated E-Money',
        'Opsi 2 rute (misal: Half Marathon & Full Marathon) atau rute bolak-balik',
        'Plat belakang custom: Personal PB quote, bib number, atau dedikasi khusus',
        'Packaging studio edisi kado / memorabilia collector',
        'Prioritas antrian modeling 3D & QC khusus',
      ],
      includesEmoney: true,
      todoNote: 'TODO: Konfirmasi variasi ke-3 & harga final dengan owner (Rentang listing Shopee Rp 119.000 - Rp 200.000).',
    },
  ] as StravaVariation[],

  // 6 Real Product Images from Shopee + 3 Video Proof Slots
  gallery: [
    {
      id: 'img-1',
      type: 'image' as const,
      title: 'Showcase Utama — 3D Route Map & Strava Data Plate',
      caption: 'Gantungan kunci 3D print timbul dengan garis rute oranye, logo Strava x WhereIsIt, dan plat data jarak, pace, waktu.',
      src: '/images/strava-keychain/keychain-01.jpg',
      aspectRatio: '1/1',
      badge: 'Foto Shopee 1',
    },
    {
      id: 'img-2',
      type: 'image' as const,
      title: 'Detail Topografi 3D & Garis Rute Oranye',
      caption: 'Tekstur rute timbul presisi tinggi menonjolkan setiap belokan dan elevasi rute lari kamu.',
      src: '/images/strava-keychain/keychain-02.jpg',
      aspectRatio: '1/1',
      badge: 'Foto Shopee 2',
    },
    {
      id: 'img-3',
      type: 'image' as const,
      title: 'Perspektif & Bodi E-Money Integrasi',
      caption: 'Dimensi bodi kompak dan kokoh dengan ketebalan proporsional yang memuat chip contactless e-money.',
      src: '/images/strava-keychain/keychain-03.jpg',
      aspectRatio: '1/1',
      badge: 'Foto Shopee 3',
    },
    {
      id: 'img-4',
      type: 'image' as const,
      title: 'Everyday Carry — Nyata di Genggaman',
      caption: 'Ukuran ideal untuk dibawa setiap hari, dikaitkan ke celana lari, lanyard kantor, atau kunci kendaraan.',
      src: '/images/strava-keychain/keychain-04.jpg',
      aspectRatio: '1/1',
      badge: 'Foto Shopee 4',
    },
    {
      id: 'img-5',
      type: 'image' as const,
      title: 'Detail Makro Sudut & Split Ring Stainless',
      caption: 'Material bio-composite matte tahan air dengan ring baja tahan karat yang tidak mudah bengkok.',
      src: '/images/strava-keychain/keychain-05.jpg',
      aspectRatio: '1/1',
      badge: 'Foto Shopee 5',
    },
    {
      id: 'img-6',
      type: 'image' as const,
      title: 'Varian Warna Studio & Presisi Grafir',
      caption: 'Kombinasi kontras warna khas studio WhereIsIt dengan tipografi data lari yang tajam dan terbaca jelas.',
      src: '/images/strava-keychain/keychain-06.jpg',
      aspectRatio: '1/1',
      badge: 'Foto Shopee 6',
    },
    // Video Proofs from Threads Viral Post
    {
      id: 'vid-mrt-tap',
      type: 'video' as const,
      title: 'Bukti Tap di Gerbang MRT Jakarta (Threads Viral)',
      caption: 'POV tap gantungan kunci di reader fare gate MRT Jakarta: lampu indikator hijau menyala dan saldo langsung muncul (contoh Rp48.500).',
      src: '/videos/strava-keychain/threads-mrt-tap.mp4',
      isTodo: true,
      todoLabel: 'Video POV tap gate MRT Jakarta dari Threads @jaynrrrrr',
      highlightBadge: 'Bukti Video Threads (88.2K Views)',
    },
    {
      id: 'vid-pants-clip',
      type: 'video' as const,
      title: 'Everyday Carry — Diklip di Celana Lari',
      caption: 'Dipakai beraktivitas sehari-hari dan di dalam kereta, ringan dan tidak mengganggu pergerakan.',
      src: '/videos/strava-keychain/threads-clip-pants.mp4',
      isTodo: true,
      todoLabel: 'Video klip celana lari dari Threads',
      highlightBadge: 'Everyday Carry',
    },
    {
      id: 'vid-blender-cad',
      type: 'video' as const,
      title: 'Modeling 3D Blender 3.6 ("BDO ULTRA")',
      caption: 'Proses rekonstruksi kontur jalur lari dari file GPX ke model 3D topografi timbul sebelum diproduksi.',
      src: '/videos/strava-keychain/threads-blender-cad.mp4',
      isTodo: true,
      todoLabel: 'Video preview 3D Blender dari Threads',
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

  // What you get (Yang didapat pembeli sesuai Shopee)
  whatYouGet: [
    {
      title: '1x Gantungan Kunci 3D Print Rute Lari Custom',
      desc: 'Bodi gantungan kunci 3D print timbul dengan garis rute oranye khas Strava dan branding STRAVA X whereIsIt?.',
    },
    {
      title: 'Peta Rute + Jarak + Pace + Waktu',
      desc: 'Plat data personal yang memuat total kilometer, kecepatan rata-rata, waktu tempuh, dan nama race kamu.',
    },
    {
      title: 'Fungsi E-Money Aktif (Varian Tertentu)',
      desc: 'Chip contactless terintegrasi di dalam bodi, siap tap di gate MRT, KRL, tol, atau belanja di minimarket.',
    },
    {
      title: 'Heavy-Duty Stainless Keyring',
      desc: 'Ring gantungan baja tahan karat kokoh, anti karat dan aman dikaitkan ke celana lari atau kunci.',
    },
    {
      title: 'Box Eksklusif Studio WhereIsIt',
      desc: 'Pengemasan premium khas studio 3D design Jakarta & Karawang, cocok untuk self-reward maupun kado race.',
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
      a: 'Kami menyematkan chip RFID/NFC contactless berstandar pembaca transportasi umum (seperti MRT Jakarta, TransJakarta, KRL) dan merchant ritel. Harap konfirmasi ketersediaan tipe kartu spesifik (misal Mandiri e-money, BCA Flazz, atau BNI TapCash) bersama admin via WhatsApp saat verifikasi rute. Kami tidak mengklaim mendukung semua tipe kartu tanpa konfirmasi.',
    },
    {
      q: 'Bagaimana jika saya tidak memakai Strava (Garmin / Apple Watch / Nike Run Club)?',
      a: 'Bisa! Cukup ekspor file GPX dari aplikasi jam lari kamu ATAU ambil screenshot rangkuman lari dari Garmin Connect, Apple Fitness, Coros, atau NRC dan lampirkan di formulir.',
    },
    {
      q: 'Berapa lama estimasi waktu pengerjaan Pre-Order?',
      a: 'Estimasi pengerjaan adalah 5–7 hari kerja terhitung sejak desain 3D kamu dikonfirmasi melalui WhatsApp (maksimal 10 hari sesuai batas PO Shopee, estimasi pengiriman tiba 26–29 Nov 2026). Kamu bisa mengecek posisi antrian langsung di widget Live Queue.',
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
