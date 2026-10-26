import { Customer, Discount, ProductReview, Collection, StoreSettings, JournalArticle, HomepageContent } from '@/types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    firstName: 'Arif',
    lastName: 'Wicaksono',
    email: 'arif.w@archstudio.id',
    phone: '0812-9876-5432',
    customerType: 'INTERIOR_DESIGNER',
    city: 'Jakarta Selatan',
    ordersCount: 4,
    totalSpent: 3850000,
    notes: 'Architect partner, prefers bone alabaster finishes',
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'cust-2',
    firstName: 'Devina',
    lastName: 'Surya',
    email: 'devina@creativehub.co',
    phone: '0811-2345-6789',
    customerType: 'COLLECTOR',
    city: 'Bandung',
    ordersCount: 2,
    totalSpent: 1470000,
    notes: 'Bought custom keepsake characters',
    createdAt: '2026-09-02T14:30:00Z',
  },
];

export const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: 'disc-1',
    code: 'WHEREISIT10',
    type: 'PERCENTAGE',
    value: 10,
    minPurchase: 500000,
    usageLimit: 100,
    usageCount: 24,
    status: 'ACTIVE',
    startsAt: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'disc-2',
    code: 'STUDIOLAUNCH',
    type: 'FIXED',
    value: 50000,
    minPurchase: 300000,
    usageLimit: 50,
    usageCount: 50,
    status: 'ACTIVE',
    startsAt: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'prod-004',
    productName: 'Monolith Architectural Desk Valet',
    author: 'Rama Daniswara',
    email: 'rama.d@designlab.com',
    rating: 5,
    title: 'Solid weight and impeccable finish',
    content: 'Tidak terasa seperti plastik murahan. Tekstur matte structural bio-polymer nya sangat premium dan presisi untuk meja kerja.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-09-15T09:20:00Z',
  },
  {
    id: 'rev-2',
    productId: 'prod-001',
    productName: 'Walnut Curve Armchair',
    author: 'Clara Sasmita',
    email: 'clara@interiorvibes.id',
    rating: 5,
    title: 'Warm ambient glow with sculpted elegance',
    content: 'Layer resolusi 0.12mm benar-benar halus, kurva ergonomisnya sangat nyaman dan estetik untuk ruang studio.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-09-28T16:45:00Z',
  },
  {
    id: 'rev-3',
    productId: 'prod-006',
    productName: 'Custom 3D Keepsake Character (From Photo)',
    author: 'Budi Prasetyo',
    email: 'budi.p@gmail.com',
    rating: 5,
    title: 'Kemiripannya luar biasa untuk kado wedding',
    content: 'Order karakter couple untuk kado pernikahan sahabat. Hasilnya sangat lucu, mirip, dan detail plat kuningan serta box kemasannya sangat mewah!',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-10-10T11:15:00Z',
  },
];

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-arch',
    slug: 'architectural-series',
    name: 'Architectural Series',
    description: 'Bespoke desk and interior objects inspired by brutalist and modern architectural forms.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    productCount: 4,
    status: 'ACTIVE',
  },
  {
    id: 'col-desk',
    slug: 'desktop-essentials',
    name: 'Desktop Essentials',
    description: 'Precision engineered organizers, stands, and lighting for thoughtful working environments.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    productCount: 3,
    status: 'ACTIVE',
  },
  {
    id: 'col-keepsake',
    slug: 'keepsake-collection',
    name: 'Keepsake Collection',
    description: 'Personalized portrait characters and collectible figures transformed from customer memories.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
    productCount: 2,
    status: 'ACTIVE',
  },
];

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  // Hero Section
  heroHeadlineTag: '3d design & objects studio',
  heroHeadlineTitle: 'whereisit',
  heroStatement: 'Bespoke 3D printed objects made for spaces that value quality, tactile texture, and thoughtful design. From human intention to final micro-layer — every piece is built to last and made to be lived with.',
  heroCtaPrimary: 'Go to catalog',
  heroCtaSecondary: 'Custom design',
  heroSpecLayer: '0.12mm Ultra-Fine Adaptive Layering',
  heroSpecMaterial: 'Bio-Composite Materials',
  heroShortcut1Title: 'Ready to buy catalog',
  heroShortcut1Image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
  heroShortcut2Title: 'Custom consultation',
  heroShortcut2Image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',

  // About Section (01/ Philosophy & Context)
  aboutSectionTag: '01/ Philosophy & Context',
  aboutTitle: 'Thoughtful objects for intentional living',
  aboutLocationTag: 'WhereIsIt Studio • Jakarta / Bespoke Lab',
  aboutStoreImage: '/images/whereisit-store.jpg',
  aboutStoreCaption: 'WhereIsIt flagship space: dusty slate blue arches, warm lighting, and physical character display alcoves.',
  aboutDetailImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  aboutDetailTag: 'layer: 0.12mm · continuous',
  aboutStoryP1: 'We create objects with thoughtful architecture, clean lines, and relentless attention to detail — for those who choose not just interior objects, but a calm quality of life.',
  aboutStoryP2: 'WhereIsIt is never a generic print service. We are an industrial design studio that first understands your spatial problem, functional purpose, and tactile context. We shape every contour before a single filament is extruded.',
  aboutPillar1Title: 'Purpose Driven',
  aboutPillar1Desc: 'Designed for real ergonomics & daily use',
  aboutPillar2Title: 'Satin Finish',
  aboutPillar2Desc: 'Manual 3-stage wet sanding & protective sealing',

  // Custom Design Section
  customDesignTag: 'Custom Your Design',
  customDesignTitle: 'From spatial problem to functional art & bespoke objects',
  customDesignDescription: 'Tell us the dimension constraints, aesthetics, or daily friction you want solved. Our design engineers translate your brief into functional prototypes and finished 3D objects.',

  // Custom Character Section
  customCharacterTag: 'Personal Keepsakes & Gifts',
  customCharacterTitle: 'Transform memories into tactile 3D bespoke characters',
  customCharacterDescription: 'Upload photos of someone special or a pet. Our artists sculpt unique stylized 3D figures with high resemblance, custom poses, and optional brass nameplates.',

  // Studio Standards
  studioStandardsTag: 'Studio Standards',
  studioStandardsTitle: 'Engineered with intent. Finished with patience.',
  studioStandardsSubtitle: '3D printing is our precision tool, but human craftsmanship is our soul. Here is how WhereIsIt ensures every piece feels distinctly premium.',
};

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'WhereIsIt',
  tagline: '3D Printed Premium Stuff & Bespoke Studio',
  contactEmail: 'studio@whereisit.design',
  contactPhone: '+62 812-3456-7890',
  studioAddress: 'Workshop Studio 04, Jl. Senopati No. 82, Jakarta Selatan, 12190',
  currency: 'IDR (Rp)',
  taxRate: 0,
  announcementText: '✨ Complimentary nationwide courier delivery for all studio crafted objects above Rp 750.000',
  announcementActive: true,
  shippingCarriers: [
    { name: 'JNE YES (Next Day Air)', fee: 35000, active: true },
    { name: 'SiCepat Gokil (Cargo & Heavy Object)', fee: 25000, active: true },
    { name: 'Studio Dedicated Courier (Jabodetabek)', fee: 50000, active: true },
  ],
  paymentMethods: [
    { name: 'Bank Transfer (BCA / Mandiri Manual Verification)', type: 'BANK_TRANSFER', active: true },
    { name: 'QRIS Instant Payment', type: 'QRIS', active: true },
    { name: 'Credit / Debit Card (Visa / Mastercard)', type: 'CARD', active: true },
  ],
  homepageContent: DEFAULT_HOMEPAGE_CONTENT,
};

export const INITIAL_JOURNAL: JournalArticle[] = [
  {
    id: 'art-1',
    slug: 'the-tactility-of-bio-polymers',
    title: 'The Tactility of Bio-Polymers in High-End Living Spaces',
    excerpt: 'Exploring how structural precision and matte layered profiles transform raw bioplastics into archival sculptural objects.',
    content: 'When we founded WhereIsIt, our goal was never merely to output 3D geometry onto a print bed. It was to explore how additive manufacturing can sit alongside Danish teak, brushed brass, and natural limestone without feeling out of place...',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    author: 'Austin Matias, Design Lead',
    status: 'PUBLISHED',
    publishedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'art-2',
    slug: 'transforming-portraiture-into-3d-keepsakes',
    title: 'Crafting Intimacy: Transforming Portraiture into 3D Keepsakes',
    excerpt: 'Behind the scenes of our custom character workflow, from client photographs to hand-finished resin miniatures.',
    content: 'A photograph captures a split-second slice of time. A three-dimensional figurine gives that memory volume, weight, and presence in physical space...',
    coverImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
    author: 'Studio Craft Team',
    status: 'PUBLISHED',
    publishedAt: '2026-09-18T14:00:00Z',
  },
];
