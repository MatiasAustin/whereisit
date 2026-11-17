import { Customer, Discount, ProductReview, Collection, StoreSettings, JournalArticle, HomepageContent } from '@/types';

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_DISCOUNTS: Discount[] = [];

export const INITIAL_REVIEWS: ProductReview[] = [];

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-strava',
    slug: 'strava-series',
    name: 'Strava Running Memorabilia',
    description: 'Transforms personal running data, achievements, and everyday routines into meaningful physical 3D products.',
    image: '/images/strava-keychain/keychain-04.jpg',
    productCount: 1,
    status: 'ACTIVE',
  },
];

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  // Hero Section
  heroHeadlineTag: '3d design & objects studio',
  heroHeadlineTitle: 'whereisit',
  heroStatement:
    'Transforms personal data, achievements, and everyday routines into meaningful physical products. Personal data. Physical products. Meaningful experiences.',
  heroCtaPrimary: 'Pre-Order Keychain Strava',
  heroCtaSecondary: 'Lacak Pesanan',
  heroSpecLayer: '0.12mm Topografi 3D Timbul',
  heroSpecMaterial: '3D Print Custom Objects',
  heroShortcut1Title: 'Pre-Order Keychain Strava',
  heroShortcut1Image: '/images/strava-keychain/keychain-05.jpg',
  heroShortcut2Title: 'Strava Lamp & Smart Cube (Coming Soon)',
  heroShortcut2Image: '/images/strava-keychain/keychain-06.jpg',

  // About Section (01/ Philosophy & Context)
  aboutSectionTag: '01/ Philosophy & Context',
  aboutTitle: 'Personal data. Physical products. Meaningful experiences.',
  aboutLocationTag: 'WhereIsIt Studio • Jakarta & Kab. Karawang',
  aboutStoreImage: '/images/whereisit-store.jpg',
  aboutStoreCaption:
    'WhereIsIt flagship studio aesthetic: dusty slate blue arches, warm lighting, and calm architectural display alcoves.',
  aboutDetailImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  aboutDetailTag: 'layer: 0.12mm · topografi 3D',
  aboutStoryP1:
    'WhereIsIt mengubah data personal, pencapaian lari, dan rutinitas harian menjadi produk fisik yang bermakna dan dipakai setiap hari.',
  aboutStoryP2:
    'Kami bukan sekadar jasa cetak generik. Setiap kontur rute, proporsi dimensi, dan detail tipografi dirancang di studio 3D kami sebelum dicetak menjadi objek nyata.',
  aboutPillar1Title: 'Purpose Driven',
  aboutPillar1Desc: 'Dirancang dari data aktivitas nyata untuk penggunaan harian',
  aboutPillar2Title: 'Tactile Precision',
  aboutPillar2Desc: 'Cetak 3D topografi timbul berpresisi tinggi & QC studio',

  // Custom Design Section
  customDesignTag: 'Custom Your Design',
  customDesignTitle: 'From personal data to tactile 3D objects',
  customDesignDescription: 'Diskusikan kebutuhan objek 3D personal bersama tim desain WhereIsIt.',

  // Custom Character Section (Unused in active lineup)
  customCharacterTag: 'Studio Memorabilia',
  customCharacterTitle: 'Personal achievements in physical form',
  customCharacterDescription: 'Memorabilia lari dan pencapaian personal dari data aktivitasmu.',

  // Studio Standards
  studioStandardsTag: 'Studio Standards',
  studioStandardsTitle: 'Engineered with intent. Finished with patience.',
  studioStandardsSubtitle:
    '3D printing adalah alat presisi kami, dan ketelitian tangan adalah standar studio kami di Jakarta & Kab. Karawang.',
};

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'WhereIsIt?',
  tagline: 'Personal data. Physical products. Meaningful experiences.',
  contactEmail: 'whereisit26@gmail.com',
  contactPhone: '6287776523066',
  studioAddress: 'Kab. Karawang & Jakarta, Indonesia',
  currency: 'IDR (Rp)',
  taxRate: 0,
  announcementText: 'Pre-Order Dibuka: Keychain Custom Data Strava x Where Is It? 3D print Custom (Pre-order, dikirim dalam 10 hari)',
  announcementActive: true,
  shippingCarriers: [],
  paymentMethods: [
    { name: 'Mayar Payment Gateway (QRIS, Virtual Account, E-Wallet, Kartu)', type: 'MAYAR', active: true },
  ],
  homepageContent: DEFAULT_HOMEPAGE_CONTENT,
};

export const INITIAL_JOURNAL: JournalArticle[] = [];
