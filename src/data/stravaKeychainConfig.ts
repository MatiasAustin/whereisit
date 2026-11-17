import { StravaVariation } from '@/types';

export const STRAVA_PRODUCT_CONFIG = {
  name: 'Keychain Custom Data Strava x Where Is It? 3D print Custom',
  shortName: 'Keychain Custom Data Strava x Where Is It? 3D print Custom',
  hook: 'Rute lari kamu, sekarang bisa dipegang.',
  badge: 'Pre-Order',
  priceRange: 'Rp119.000 – Rp200.000',
  defaultLeadDays: 7, // 5-7 hari kerja sejak desain dikonfirmasi
  shopeeMaxDays: 10,
  shippingPolicyText: 'Pre-order, dikirim dalam 10 hari',

  // Official Shopee Description
  descriptionId:
    'Gantungan Kunci Rute Lari Custom 3D Print — Strava x whereisit? rute lari kamu, sekarang bisa dipegang. gantungan kunci 3d print dari rute strava kamu sendiri — lengkap dengan peta rute, jarak, pace, dan waktu tempuh. cocok buat kenang-kenangan race, pb pertama, atau sekadar bukti kamu pernah lari sejauh itu.',

  // Key Features from Product Source of Truth
  keyFeatures: [
    'Rute 3D timbul (topografi 3D relief) dengan aksen garis rute oranye khas Strava',
    'Branding resmi studio: "STRAVA X whereIsIt?"',
    'Bisa difungsikan ganda sebagai kartu e-money pada varian e-money (jenis kartu e-money dikonfirmasi bersama admin saat review desain)',
    'Plat data rute akurat: Peta rute + Jarak (KM) + Pace rata-rata + Waktu tempuh sesuai aktivitas Strava kamu',
    'Termasuk 1x ring gantungan kunci stainless steel kokoh',
  ],

  // Real Social Proof & Verified Store Metrics (No hardcoded stale dates or chat rates)
  sourceOfTruth: {
    shopeeUrl: 'https://shopee.co.id/product/760174452/41886615712',
    shopeeShopId: '760174452',
    shopeeProductId: '41886615712',
    shopeeRating: '5.0',
    shopeeLocation: 'Kab. Karawang',
    shopeeProductCount: 1,
    shopeeShipsWithin: 'Pre-order, dikirim dalam 10 hari',
    threadsUrl: 'https://www.threads.com/@jaynrrrrr/post/Dfg443YFJQX',
    threadsViews: '88.2K',
    threadsViewsNumber: 88200,
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

  // 3 Confirmed Variations matching Shopee character-for-character (16 Nov 2026)
  variations: [
    {
      id: 'var-10x5',
      name: '10x5 cm',
      price: 119000,
      image: '/images/strava-keychain/keychain-04.jpg',
      badge: 'Varian 1',
      shortDesc: 'Gantungan kunci 3D print timbul rute lari personal ukuran 10x5 cm lengkap dengan peta rute, jarak, pace, dan waktu tempuh.',
      features: [
        '1x gantungan kunci 3D print rute lari custom (10x5 cm)',
        'Rute 3D timbul (topografi) dengan garis rute oranye khas Strava',
        'Branding resmi "STRAVA X whereIsIt?"',
        'Peta rute + jarak + pace + waktu sesuai data Strava kamu',
        'Termasuk ring gantungan kunci',
      ],
      includesEmoney: false,
    },
    {
      id: 'var-emoney',
      name: '10x5 cm Emoney',
      price: 150000,
      image: '/images/strava-keychain/keychain-05.jpg',
      badge: 'Varian 2 (E-Money)',
      isPopular: true,
      shortDesc: 'Gantungan kunci 3D print rute Strava ukuran 10x5 cm termasuk fungsi e-money aktif.',
      features: [
        '1x gantungan kunci 3D print rute lari custom (10x5 cm)',
        'Termasuk e-money terintegrasi di dalam bodi',
        'Rute 3D timbul (topografi) dengan garis rute oranye khas Strava',
        'Peta rute + jarak + pace + waktu sesuai data Strava kamu',
        'Termasuk ring gantungan kunci',
        'Jenis kartu e-money dikonfirmasi bersama admin saat review desain',
      ],
      includesEmoney: true,
      emoneyNote: 'Jenis kartu e-money dikonfirmasi bersama admin saat review desain.',
    },
    {
      id: 'var-flazz',
      name: '10x5 cm Flazz',
      price: 200000,
      image: '/images/strava-keychain/keychain-06.jpg',
      badge: 'Varian 3',
      shortDesc: 'Gantungan kunci 3D print rute Strava ukuran 10x5 cm varian Flazz.',
      features: [
        '1x gantungan kunci 3D print rute lari custom (10x5 cm)',
        'Varian 10x5 cm Flazz sesuai pilihan katalog Shopee',
        'Rute 3D timbul (topografi) dengan garis rute oranye khas Strava',
        'Peta rute + jarak + pace + waktu sesuai data Strava kamu',
        'Termasuk ring gantungan kunci',
        'Jenis kartu e-money dikonfirmasi bersama admin saat review desain',
      ],
      includesEmoney: true,
      emoneyNote: 'Jenis kartu e-money dikonfirmasi bersama admin saat review desain.',
    },
  ] as StravaVariation[],

  // 3 Unique High-Res Product Photos (keychain-04, -05, -06) + 3 Video Proof Slots
  gallery: [
    {
      id: 'img-4',
      type: 'image' as const,
      title: 'Detail 3D Print Rute Lari & Data Strava (10x5 cm)',
      caption: 'Gantungan kunci 3D print timbul di depan mesin cetak 3D dengan garis rute oranye, branding STRAVA X whereIsIt?, serta data jarak, pace, dan waktu.',
      src: '/images/strava-keychain/keychain-04.jpg',
      aspectRatio: '1/1',
      badge: 'Foto Produk 1',
    },
    {
      id: 'img-5',
      type: 'image' as const,
      title: 'Everyday Carry: Diklip di Celana',
      caption: 'Tampilan gantungan kunci saat dikaitkan di celana untuk aktivitas harian dan perjalanan komuter.',
      src: '/images/strava-keychain/keychain-05.jpg',
      aspectRatio: '1/1',
      badge: 'Foto Produk 2',
    },
    {
      id: 'img-6',
      type: 'image' as const,
      title: 'Siap Tap di Stasiun MRT',
      caption: 'Dua gantungan kunci rute Strava x WhereIsIt? di tangga stasiun MRT, siap digunakan sebagai kenang-kenangan race sekaligus kartu tap harian.',
      src: '/images/strava-keychain/keychain-06.jpg',
      aspectRatio: '1/1',
      badge: 'Foto Produk 3',
    },
    // Video Proofs from Threads Viral Post
    {
      id: 'vid-mrt-tap',
      type: 'video' as const,
      title: 'Bukti Tap di Gerbang MRT Jakarta (Threads Viral)',
      caption: 'POV tap gantungan kunci di reader fare gate MRT Jakarta: lampu indikator hijau menyala dan saldo langsung muncul (contoh Rp48.500).',
      src: process.env.NEXT_PUBLIC_STRAVA_VIDEO_MRT_URL || '/videos/strava-keychain/threads-mrt-tap.mp4',
      isTodo: !process.env.NEXT_PUBLIC_STRAVA_VIDEO_MRT_URL,
      todoLabel: 'TODO: Slot video POV tap gate MRT Jakarta dari postingan Threads @jaynrrrrr',
      highlightBadge: 'Bukti Video Threads (88.2K Views)',
    },
    {
      id: 'vid-pants-clip',
      type: 'video' as const,
      title: 'Everyday Carry di Kereta & Celana Lari',
      caption: 'Dipakai beraktivitas sehari-hari dan di dalam kereta, ringan dan praktis dibawa.',
      src: process.env.NEXT_PUBLIC_STRAVA_VIDEO_CLIP_URL || '/videos/strava-keychain/threads-clip-pants.mp4',
      isTodo: !process.env.NEXT_PUBLIC_STRAVA_VIDEO_CLIP_URL,
      todoLabel: 'TODO: Slot video pemakaian di kereta & klip celana dari Threads @jaynrrrrr',
      highlightBadge: 'Everyday Carry',
    },
    {
      id: 'vid-blender-cad',
      type: 'video' as const,
      title: 'Modeling 3D Blender 3.6 ("BDO ULTRA")',
      caption: 'Proses rekonstruksi kontur jalur lari menjadi model 3D topografi timbul sebelum dicetak.',
      src: process.env.NEXT_PUBLIC_STRAVA_VIDEO_BLENDER_URL || '/videos/strava-keychain/threads-blender-cad.mp4',
      isTodo: !process.env.NEXT_PUBLIC_STRAVA_VIDEO_BLENDER_URL,
      todoLabel: 'TODO: Slot video preview 3D Blender "BDO ULTRA" dari Threads @jaynrrrrr',
      highlightBadge: '3D Modeling',
    },
  ],

  // Pixar-Style Short Story (3-4 paragraphs, clean punctuation without em dashes)
  story: [
    {
      phase: 'The Run',
      title: 'Lari yang Tidak Pernah Kamu Lupakan',
      text: 'Kamu bangun pagi buta, mengikat tali sepatu saat jalanan masih sepi, dan menempuh kilometer demi kilometer. Ada latihan panjang dan rasa bangga ketika akhirnya kamu menyentuh garis finish dengan catatan waktu terbaikmu.',
    },
    {
      phase: 'The Problem',
      title: 'Medali di Laci, E-Money yang Polos',
      text: 'Setelah hari lomba selesai, medali sering berakhir di dalam laci dan tangkapan layar Strava tertumpuk di galeri ponsel. Sementara itu, kartu e-money yang kamu bawa setiap hari hanya lembaran plastik biasa tanpa cerita.',
    },
    {
      phase: 'The Keepsake',
      title: 'Rute Lari Kamu, Sekarang Bisa Dipegang',
      text: 'Melalui cetak 3D bertekstur timbul, WhereIsIt mengubah peta rute, jarak, pace, dan waktu tempuh dari data Strava kamu sendiri menjadi objek fisik yang bisa kamu pegang dan bawa ke mana saja.',
    },
    {
      phase: 'Everyday Use',
      title: 'Kenang-Kenangan yang Dipakai Setiap Hari',
      text: 'Dengan varian yang mendukung fungsi e-money, setiap kali kamu tap di gerbang stasiun atau halte, gantungan kunci ini menjadi pengingat nyata bahwa kamu pernah berlari sejauh itu.',
    },
  ],

  // What you get (Yang didapat pembeli sesuai Shopee)
  whatYouGet: [
    {
      title: '1x Gantungan Kunci 3D Print Rute Lari Custom',
      desc: 'Bodi gantungan kunci 3D print timbul ukuran 10x5 cm dengan garis rute oranye dan branding STRAVA X whereIsIt?.',
    },
    {
      title: 'Peta Rute + Jarak + Pace + Waktu',
      desc: 'Dicetak sesuai data aktivitas Strava kamu sendiri: peta rute, jarak tempuh, pace, dan durasi.',
    },
    {
      title: 'Fungsi E-Money pada Varian Pendukung',
      desc: 'Tersedia pada varian 10x5 cm Emoney dan 10x5 cm Flazz. Jenis kartu e-money dikonfirmasi bersama admin saat review desain.',
    },
    {
      title: 'Ring Gantungan Kunci',
      desc: 'Termasuk 1x ring gantungan kunci logam yang siap dipasang di celana lari, tas, atau gantungan kunci harian.',
    },
  ],

  // 4 Steps How it works
  howItWorks: [
    {
      step: '01',
      title: 'Pre-Order & Bayar di Website via Mayar',
      desc: 'Pilih varian (10x5 cm, 10x5 cm Emoney, atau 10x5 cm Flazz), isi data pengiriman minimal, dan selesaikan pembayaran langsung di website melalui Mayar.',
      highlight: 'Checkout langsung di website tanpa harus DM dulu',
    },
    {
      step: '02',
      title: 'Wajib Isi Form Data (Gambar + URL Strava)',
      desc: 'Setelah pembayaran terkonfirmasi, kamu WAJIB melengkapi form data: lampirkan screenshot dan URL Strava kamu.',
      highlight: 'WAJIB diisi setelah bayar agar pesanan bisa diproses',
    },
    {
      step: '03',
      title: 'Admin Konfirmasi Rute & Desain via WhatsApp',
      desc: 'Admin WhereIsIt memverifikasi rute, detail data, serta jenis kartu e-money, lalu mengonfirmasi desain 3D bersama kamu melalui WhatsApp.',
      highlight: 'Produksi baru dimulai setelah desain dikonfirmasi di Langkah 3',
    },
    {
      step: '04',
      title: 'Produksi (Live Queue), QC & Kirim',
      desc: 'Pesanan masuk ke antrian cetak 3D yang bisa dipantau terbuka di halaman ini dan /track, melewati proses QC, lalu dikirim beserta nomor resi.',
      highlight: 'Pre-order, dikirim dalam 10 hari (estimasi produksi 5–7 hari kerja)',
    },
  ],

  // FAQs
  faqs: [
    {
      q: 'Bagaimana cara membagikan link rute Strava saya?',
      a: 'Buka aplikasi Strava, pilih aktivitas atau rute lari yang ingin dibuat, ketuk tombol Share (Bagikan), lalu pilih Copy Link (Salin Tautan). Tempelkan link tersebut pada form data setelah pembayaran.',
    },
    {
      q: 'Bagaimana jika rute atau aktivitas Strava saya diset Private?',
      a: 'Kamu dapat mengubah pengaturan privasi aktivitas ke Everyone sementara waktu, atau melampirkan screenshot layar Strava yang menampilkan peta rute, jarak, pace, dan waktu tempuh secara jelas di form data.',
    },
    {
      q: 'Kartu e-money apa saja yang didukung?',
      a: 'Tersedia varian 10x5 cm Emoney (Rp150.000) dan 10x5 cm Flazz (Rp200.000). Jenis kartu e-money dikonfirmasi bersama admin saat review desain. Kami tidak mengklaim mendukung semua kartu tanpa konfirmasi terlebih dahulu.',
    },
    {
      q: 'Bagaimana jika saya tidak menggunakan aplikasi Strava?',
      a: 'Silakan unggah screenshot aktivitas lari dari aplikasi yang kamu gunakan (seperti Garmin, Nike Run Club, Coros, atau Apple Fitness) yang menampilkan peta rute, jarak, pace, dan durasi, lalu tulis catatan untuk admin pada form data.',
    },
    {
      q: 'Berapa lama estimasi pengerjaan Pre-Order?',
      a: 'Status produk adalah Pre-order, dikirim dalam 10 hari. Estimasi produksi internal adalah 5–7 hari kerja sejak desain dikonfirmasi melalui WhatsApp (mengikuti antrian aktif yang tampil di Live Queue dan halaman /track).',
    },
    {
      q: 'Bagaimana jika saya sudah membayar tetapi belum mengisi form data?',
      a: 'Status pesanan kamu akan tercatat sebagai "Dibayar — Data Belum Lengkap". Produksi tidak akan dimulai sampai form data dikirimkan dan desain dikonfirmasi oleh admin. Kamu dapat membuka kembali form data melalui halaman /track atau menghubungi admin via WhatsApp.',
    },
    {
      q: 'Bagaimana kebijakan pembatalan atau refund?',
      a: 'Untuk pertanyaan terkait pembatalan atau kendala pesanan, silakan langsung klik tombol "Tanya admin via WhatsApp" dengan menyertakan Order ID kamu.',
    },
  ],
};

// Teaser Products with dedicated Coming Soon pages (Task 8)
export const COMING_SOON_HIGHLIGHTS = [
  {
    id: 'strava-route-lamp',
    slug: '/strava-route-lamp',
    name: 'Personalized Strava Route Lamp',
    shortName: 'Strava Route Lamp',
    badge: 'Coming Soon',
    statusLabel: 'Coming Soon — Belum Bisa Dipesan',
    image: '/images/coming-soon/strava-route-lamp.jpg',
    notifyProductKey: 'Strava Route Lamp',
    notifyCategoryGroup: 'Minat Lamp',
    hook: 'Pelari menyelesaikan marathon, medali berakhir di laci dan foto tenggelam di galeri. Lampu ini mengubah rute, pace, tanggal, dan jarak tempuh itu menjadi objek yang menyala setiap hari.',
    whatItIs:
      'Rute lari yang diukir presisi dengan laser pada lembaran akrilik (acrylic laser-engraved running route), pencahayaan LED hangat, dan dudukan (base) hasil cetak 3D. Tanpa layar LCD, tanpa Wi-Fi, fokus pada data statis pencapaian terbaikmu.',
    useCases: [
      'Memorabilia marathon & race jarak jauh',
      'Penanda pencapaian personal best (PB)',
      'Hadiah ulang tahun atau anniversary untuk pelari',
    ],
    waMessage: 'Halo WhereIsIt, saya mau diinfokan saat Strava Route Lamp ready.',
  },
  {
    id: 'smart-cube',
    slug: '/smart-cube',
    name: 'Smart Cube — Strava Cube Display',
    shortName: 'Smart Cube (Strava Cube Display)',
    badge: 'Coming Soon',
    statusLabel: 'Dalam pengembangan — belum bisa dipesan',
    image: '/images/coming-soon/smart-cube.jpg',
    notifyProductKey: 'Smart Cube',
    notifyCategoryGroup: 'Minat Cube',
    hook: 'Rute dan statistik yang sama seperti Lamp, tetapi hidup: display cube di meja kerja yang menampilkan lari terakhir, jarak mingguan, serta pengingat workout hari ini dan waktu istirahat malam nanti.',
    whatItIs:
      'Visi produk dalam pengembangan: kubus berukuran ~15x15x15 cm dengan rute topografi 3D di permukaan atas, tampilan statistik Strava di sisi-sisi kubus, serta pengingat workout dan sleep.',
    useCases: [
      'Meja kerja pelari yang ingin memantau jarak mingguan',
      'Kombinasi artefak topografi 3D di bagian atas dan informasi aktivitas di sisi kubus',
      'Pengingat jadwal latihan (workout) dan waktu istirahat malam (wind-down)',
    ],
    waMessage: 'Halo WhereIsIt, saya mau diinfokan saat Smart Cube ready.',
  },
];

// Homepage Lineup Section ONLY ("Segera Hadir", no dedicated page, no price, no order button - Task 9)
export const COMING_SOON_LINEUP = [
  {
    id: 'activity-ring-lamp',
    name: 'Activity Ring Lamp',
    concept: 'Progress ring untuk jarak mingguan, target workout, dan running streak.',
    badge: 'Coming Soon',
    notifyProductKey: 'Activity Ring Lamp',
  },
  {
    id: 'smart-sleep-lamp',
    name: 'Smart Sleep Lamp',
    concept:
      'Smart Sleep & Recovery Companion: Sleep Dashboard (durasi, score, Deep/REM/Light), circadian lighting, sleep reminder, smart wake-up; data dari smartwatch / health app yang sudah dimiliki (Apple Health, Garmin, Fitbit, Samsung Health), tanpa sensor tidur internal.',
    badge: 'Coming Soon',
    notifyProductKey: 'Smart Sleep Lamp',
  },
  {
    id: 'strava-route-light-frame',
    name: 'Strava Route Light Frame',
    concept: 'Frame lampu acrylic engraving rute Strava + LED + base 3D print.',
    badge: 'Coming Soon',
    notifyProductKey: 'Strava Route Light Frame',
  },
  {
    id: 'strava-reminder-clock',
    name: 'Strava Reminder Clock',
    concept: 'Jam meja dengan workout & sleep reminder.',
    badge: 'Coming Soon',
    notifyProductKey: 'Strava Reminder Clock',
  },
  {
    id: 'strava-key-display-mini',
    name: 'Strava Key Display Mini',
    concept: 'Display mini statistik running terakhir, ringkas dan portable.',
    badge: 'Coming Soon',
    notifyProductKey: 'Strava Key Display Mini',
  },
  {
    id: 'floating-magnetic-lamp',
    name: 'Floating Magnetic Lamp',
    concept: 'Lampu melayang dengan magnetic levitation module (konsep eksperimental, ditunda).',
    badge: 'Dalam eksplorasi',
    isExperimental: true,
    notifyProductKey: 'Floating Magnetic Lamp',
  },
];

export const ALL_NOTIFY_PRODUCTS = [
  { value: 'Strava Route Lamp', label: 'Strava Route Lamp (Coming Soon)', group: 'Minat Lamp' },
  { value: 'Smart Cube', label: 'Smart Cube — Strava Cube Display (Coming Soon)', group: 'Minat Cube' },
  { value: 'Activity Ring Lamp', label: 'Activity Ring Lamp (Coming Soon)', group: 'Minat Lineup Lainnya' },
  { value: 'Smart Sleep Lamp', label: 'Smart Sleep Lamp (Coming Soon)', group: 'Minat Lineup Lainnya' },
  { value: 'Strava Route Light Frame', label: 'Strava Route Light Frame (Coming Soon)', group: 'Minat Lineup Lainnya' },
  { value: 'Strava Reminder Clock', label: 'Strava Reminder Clock (Coming Soon)', group: 'Minat Lineup Lainnya' },
  { value: 'Strava Key Display Mini', label: 'Strava Key Display Mini (Coming Soon)', group: 'Minat Lineup Lainnya' },
  { value: 'Floating Magnetic Lamp', label: 'Floating Magnetic Lamp (Dalam Eksplorasi)', group: 'Minat Lineup Lainnya' },
];

// WhatsApp Helper
export function getWhatsAppAdminLink(orderId?: string, customMessage?: string): string {
  const rawNumber = process.env.NEXT_PUBLIC_WA_ADMIN_NUMBER || '6287776523066';
  const number = rawNumber.replace(/[^0-9]/g, '');
  if (customMessage) {
    return `https://wa.me/${number}?text=${encodeURIComponent(customMessage)}`;
  }
  let message = 'Halo WhereIsIt, saya mau tanya soal Keychain Strava.';
  if (orderId) {
    message += ` Order ID: ${orderId}.`;
  } else {
    message += ' [Order ID kalau sudah ada].';
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
