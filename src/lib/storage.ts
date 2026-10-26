import fs from 'fs';
import path from 'path';
import { 
  Product, 
  CustomDesignInquiry, 
  CustomCharacterInquiry, 
  Order,
  Customer,
  Discount,
  DraftOrder,
  AbandonedCheckout,
  ProductReview,
  Subscriber,
  Collection,
  StoreSettings,
  JournalArticle
} from '@/types';
import { INITIAL_PRODUCTS } from './initialData';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const DESIGN_INQUIRIES_FILE = path.join(DATA_DIR, 'design-inquiries.json');
const CHARACTER_INQUIRIES_FILE = path.join(DATA_DIR, 'character-inquiries.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const DISCOUNTS_FILE = path.join(DATA_DIR, 'discounts.json');
const DRAFT_ORDERS_FILE = path.join(DATA_DIR, 'draft-orders.json');
const ABANDONED_FILE = path.join(DATA_DIR, 'abandoned-checkouts.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const COLLECTIONS_FILE = path.join(DATA_DIR, 'collections.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const JOURNAL_FILE = path.join(DATA_DIR, 'journal.json');

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  ensureDirectoryExists();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  ensureDirectoryExists();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---------------- PRODUCTS ---------------- //

export function getProducts(): Product[] {
  return readJsonFile<Product[]>(PRODUCTS_FILE, INITIAL_PRODUCTS);
}

export function saveProducts(products: Product[]): void {
  writeJsonFile(PRODUCTS_FILE, products);
}

export function getProductBySlug(slug: string): Product | undefined {
  const products = getProducts();
  return products.find((p) => p.slug === slug || p.id === slug);
}

export function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const products = getProducts();
  const id = `prod-${Date.now()}`;
  const now = new Date().toISOString();
  
  let slug = productData.slug?.trim() || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (products.some((p) => p.slug === slug)) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }

  const newProduct: Product = {
    ...productData,
    id,
    slug,
    createdAt: now,
    updatedAt: now,
  };

  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: Product = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  saveProducts(products);
  return updated;
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
}

// ---------------- CUSTOM DESIGN INQUIRIES ---------------- //

const INITIAL_DESIGN_INQUIRIES: CustomDesignInquiry[] = [
  {
    id: 'inq-001',
    clientName: 'Arya Pratama',
    email: 'arya.pratama@example.com',
    phone: '+62 812-3456-7890',
    projectType: 'Desk Object',
    dimensionConstraints: 'Max 30cm x 15cm for compact workstation',
    estimatedBudget: 'Rp 1.000.000 - Rp 2.500.000',
    description: 'Need a dual acoustic headphone stand integrated with DAC amp isolation cradle in matte slate blue tone.',
    desiredTimeline: 'Within 2 weeks',
    status: 'QUOTED',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'inq-002',
    clientName: 'Clarissa Widjaja',
    email: 'clarissa.w@example.com',
    phone: '+62 811-9876-5432',
    projectType: 'Small Furniture',
    dimensionConstraints: 'Side table height 52cm, diameter 40cm',
    estimatedBudget: 'Rp 3.500.000+',
    description: 'Bespoke parametric ribbed pedestal table for a minimalist reading nook with hidden book alcove.',
    desiredTimeline: 'Next month',
    status: 'NEW',
    createdAt: new Date().toISOString(),
  }
];

export function getDesignInquiries(): CustomDesignInquiry[] {
  return readJsonFile<CustomDesignInquiry[]>(DESIGN_INQUIRIES_FILE, INITIAL_DESIGN_INQUIRIES);
}

export function createDesignInquiry(data: Omit<CustomDesignInquiry, 'id' | 'createdAt' | 'status'>): CustomDesignInquiry {
  const inquiries = getDesignInquiries();
  const newInq: CustomDesignInquiry = {
    ...data,
    id: `des-${Date.now()}`,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };
  inquiries.unshift(newInq);
  writeJsonFile(DESIGN_INQUIRIES_FILE, inquiries);
  return newInq;
}

export function updateDesignInquiryStatus(id: string, status: CustomDesignInquiry['status']): boolean {
  const inquiries = getDesignInquiries();
  const target = inquiries.find((i) => i.id === id);
  if (!target) return false;
  target.status = status;
  writeJsonFile(DESIGN_INQUIRIES_FILE, inquiries);
  return true;
}

// ---------------- CUSTOM CHARACTER INQUIRIES ---------------- //

const INITIAL_CHARACTER_INQUIRIES: CustomCharacterInquiry[] = [
  {
    id: 'char-001',
    clientName: 'Natasya Salim',
    email: 'natasya@example.com',
    phone: '+62 813-2222-1111',
    characterType: 'Couple',
    style: 'Chibi Petite',
    plaqueText: 'Leo & Natasya • 24.10.2026',
    photoUrl: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=600&q=80',
    referenceNotes: 'Wedding anniversary keepsake. Groom in navy suit, bride in minimalist ivory satin dress with floral hair pin.',
    status: '3D_MODELING',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

export function getCharacterInquiries(): CustomCharacterInquiry[] {
  return readJsonFile<CustomCharacterInquiry[]>(CHARACTER_INQUIRIES_FILE, INITIAL_CHARACTER_INQUIRIES);
}

export function createCharacterInquiry(data: Omit<CustomCharacterInquiry, 'id' | 'createdAt' | 'status'>): CustomCharacterInquiry {
  const inquiries = getCharacterInquiries();
  const newInq: CustomCharacterInquiry = {
    ...data,
    id: `char-${Date.now()}`,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };
  inquiries.unshift(newInq);
  writeJsonFile(CHARACTER_INQUIRIES_FILE, inquiries);
  return newInq;
}

export function updateCharacterInquiryStatus(id: string, status: CustomCharacterInquiry['status']): boolean {
  const inquiries = getCharacterInquiries();
  const target = inquiries.find((i) => i.id === id);
  if (!target) return false;
  target.status = status;
  writeJsonFile(CHARACTER_INQUIRIES_FILE, inquiries);
  return true;
}

// ---------------- ORDERS ---------------- //

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'WI-2610-881',
    customer: {
      fullName: 'Bambang Kusuma',
      email: 'bambang.k@example.com',
      phone: '+62 818-0909-1234',
      address: 'Jl. Senopati No. 44, Kebayoran Baru',
      city: 'Jakarta Selatan',
      postalCode: '12190',
    },
    items: [
      {
        productId: 'prod-004',
        productName: 'Monolith Architectural Desk Valet',
        price: 480000,
        quantity: 1,
        selectedColor: 'Slate Dusty Blue',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80',
      },
      {
        productId: 'prod-006',
        productName: 'Chibi Companion "Mori Bear" Figurine',
        price: 390000,
        quantity: 1,
        selectedColor: 'Warm Cream White',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80',
      }
    ],
    subtotal: 870000,
    shippingFee: 35000,
    total: 905000,
    shippingCarrier: 'JNE Express (Next Day)',
    paymentMethod: 'BCA Virtual Account',
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
];

export function getOrders(): Order[] {
  return readJsonFile<Order[]>(ORDERS_FILE, INITIAL_ORDERS);
}

export function createOrder(data: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
  const orders = getOrders();
  const orderNumber = `WI-${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
  const newOrder: Order = {
    ...data,
    id: `ord-${Date.now()}`,
    orderNumber,
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  writeJsonFile(ORDERS_FILE, orders);
  return newOrder;
}

export function updateOrderStatus(id: string, orderStatus: Order['orderStatus'], paymentStatus?: Order['paymentStatus']): boolean {
  const orders = getOrders();
  const target = orders.find((o) => o.id === id);
  if (!target) return false;
  target.orderStatus = orderStatus;
  if (paymentStatus) target.paymentStatus = paymentStatus;
  writeJsonFile(ORDERS_FILE, orders);
  return true;
}

// ---------------- CUSTOMERS ---------------- //

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    firstName: 'Bambang',
    lastName: 'Kusuma',
    email: 'bambang.k@example.com',
    phone: '+62 818-0909-1234',
    customerType: 'RETAIL',
    city: 'Jakarta Selatan',
    ordersCount: 3,
    totalSpent: 3450000,
    notes: 'Enjoys architectural desk pieces with satin slate blue finish.',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'cust-002',
    firstName: 'Clarissa',
    lastName: 'Widjaja',
    email: 'clarissa.w@example.com',
    phone: '+62 811-9876-5432',
    customerType: 'INTERIOR_DESIGNER',
    city: 'Surabaya',
    ordersCount: 2,
    totalSpent: 12400000,
    notes: 'Interior studio partner for residential projects in West Surabaya.',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'cust-003',
    firstName: 'Natasya',
    lastName: 'Salim',
    email: 'natasya@example.com',
    phone: '+62 813-2222-1111',
    customerType: 'COLLECTOR',
    city: 'Bandung',
    ordersCount: 4,
    totalSpent: 2890000,
    notes: 'Collects limited edition character figurines and numbered drop editions.',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  }
];

export function getCustomers(): Customer[] {
  return readJsonFile<Customer[]>(CUSTOMERS_FILE, INITIAL_CUSTOMERS);
}

export function createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'ordersCount' | 'totalSpent'>): Customer {
  const customers = getCustomers();
  const newCust: Customer = {
    ...data,
    id: `cust-${Date.now()}`,
    ordersCount: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
  };
  customers.unshift(newCust);
  writeJsonFile(CUSTOMERS_FILE, customers);
  return newCust;
}

// ---------------- DISCOUNTS & MARKETING ---------------- //

const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: 'disc-001',
    code: 'STUDIO10',
    type: 'PERCENTAGE',
    value: 10,
    minPurchase: 500000,
    usageLimit: 100,
    usageCount: 28,
    status: 'ACTIVE',
    startsAt: '2026-01-01',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'disc-002',
    code: 'WELCOMEBESPOKE',
    type: 'FIXED',
    value: 100000,
    minPurchase: 1000000,
    usageLimit: 50,
    usageCount: 12,
    status: 'ACTIVE',
    startsAt: '2026-02-01',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  }
];

export function getDiscounts(): Discount[] {
  return readJsonFile<Discount[]>(DISCOUNTS_FILE, INITIAL_DISCOUNTS);
}

export function createDiscount(data: Omit<Discount, 'id' | 'createdAt' | 'usageCount'>): Discount {
  const discounts = getDiscounts();
  const newDisc: Discount = {
    ...data,
    id: `disc-${Date.now()}`,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  };
  discounts.unshift(newDisc);
  writeJsonFile(DISCOUNTS_FILE, discounts);
  return newDisc;
}

export function updateDiscount(id: string, updates: Partial<Discount>): Discount | null {
  const discounts = getDiscounts();
  const idx = discounts.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  discounts[idx] = { ...discounts[idx], ...updates };
  writeJsonFile(DISCOUNTS_FILE, discounts);
  return discounts[idx];
}

export function deleteDiscount(id: string): boolean {
  const discounts = getDiscounts();
  const filtered = discounts.filter((d) => d.id !== id);
  if (filtered.length === discounts.length) return false;
  writeJsonFile(DISCOUNTS_FILE, filtered);
  return true;
}

// ---------------- DRAFT ORDERS ---------------- //

const INITIAL_DRAFT_ORDERS: DraftOrder[] = [
  {
    id: 'draft-001',
    draftNumber: 'DFT-2610-09',
    customerName: 'Studio Andara Architects',
    email: 'projects@andara-arch.com',
    phone: '+62 812-4455-6677',
    items: [
      {
        productId: 'prod-001',
        productName: 'Walnut Curve Armchair (Custom Smoked Walnut)',
        price: 4950000,
        quantity: 2,
        selectedColor: 'Smoked Walnut Finish',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
      }
    ],
    subtotal: 9900000,
    shippingFee: 150000,
    total: 10050000,
    status: 'INVOICED',
    notes: 'Custom finish for high-end boutique reception in Menteng.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

export function getDraftOrders(): DraftOrder[] {
  return readJsonFile<DraftOrder[]>(DRAFT_ORDERS_FILE, INITIAL_DRAFT_ORDERS);
}

export function createDraftOrder(data: Omit<DraftOrder, 'id' | 'draftNumber' | 'createdAt'>): DraftOrder {
  const drafts = getDraftOrders();
  const draftNumber = `DFT-${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(10 + Math.random() * 90)}`;
  const newDraft: DraftOrder = {
    ...data,
    id: `draft-${Date.now()}`,
    draftNumber,
    createdAt: new Date().toISOString(),
  };
  drafts.unshift(newDraft);
  writeJsonFile(DRAFT_ORDERS_FILE, drafts);
  return newDraft;
}

// ---------------- ABANDONED CHECKOUTS ---------------- //

const INITIAL_ABANDONED: AbandonedCheckout[] = [
  {
    id: 'abn-001',
    checkoutNumber: 'CHK-9281',
    customerEmail: 'dimas.ananda@gmail.com',
    customerPhone: '+62 819-8765-4321',
    items: [
      {
        productId: 'prod-005',
        productName: 'Komorebi Parametric Spiral Vase',
        price: 650000,
        quantity: 1,
        selectedColor: 'Slate Blue Mist',
        image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=400&q=80',
      }
    ],
    subtotal: 650000,
    recoveryStatus: 'EMAIL_SENT',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  }
];

export function getAbandonedCheckouts(): AbandonedCheckout[] {
  return readJsonFile<AbandonedCheckout[]>(ABANDONED_FILE, INITIAL_ABANDONED);
}

// ---------------- REVIEWS ---------------- //

const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-001',
    productId: 'prod-004',
    productName: 'Monolith Architectural Desk Valet',
    author: 'Reza Mahardika',
    email: 'reza@techstudio.id',
    rating: 5,
    title: 'Extremely satisfying weight and texture',
    content: 'The finish does not feel like typical 3D print plastic at all. The internal brass core gives it such a reassuring desk presence. Highly recommended.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'rev-002',
    productId: 'prod-006',
    productName: 'Chibi Companion "Mori Bear" Figurine',
    author: 'Siti Sarah',
    email: 'siti.sarah@gmail.com',
    rating: 5,
    title: 'Adorably charming bedside piece',
    content: 'Bought this as an anniversary gift. Hand-buffed finish is ultra smooth and the gift packaging was gallery quality.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  }
];

export function getReviews(): ProductReview[] {
  return readJsonFile<ProductReview[]>(REVIEWS_FILE, INITIAL_REVIEWS);
}

export function updateReviewStatus(id: string, status: ProductReview['status']): boolean {
  const reviews = getReviews();
  const target = reviews.find((r) => r.id === id);
  if (!target) return false;
  target.status = status;
  writeJsonFile(REVIEWS_FILE, reviews);
  return true;
}

// ---------------- SUBSCRIBERS ---------------- //

const INITIAL_SUBSCRIBERS: Subscriber[] = [
  { id: 'sub-001', email: 'johan.design@studio.com', source: 'Storefront Footer', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'sub-002', email: 'diana.kurnia@gmail.com', source: 'Storefront Footer', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
];

export function getSubscribers(): Subscriber[] {
  return readJsonFile<Subscriber[]>(SUBSCRIBERS_FILE, INITIAL_SUBSCRIBERS);
}

export function addSubscriber(email: string, source = 'Storefront Footer'): Subscriber {
  const subs = getSubscribers();
  const existing = subs.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;
  const newSub: Subscriber = {
    id: `sub-${Date.now()}`,
    email,
    source,
    createdAt: new Date().toISOString(),
  };
  subs.unshift(newSub);
  writeJsonFile(SUBSCRIBERS_FILE, subs);
  return newSub;
}

// ---------------- COLLECTIONS ---------------- //

const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-001',
    slug: 'small-furniture',
    name: 'Small Furniture',
    description: 'Sculptural dining chairs, accent armchairs, and monolithic occasional stools designed with high-density internal gyroid lattices.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    productCount: 3,
    status: 'ACTIVE',
  },
  {
    id: 'col-002',
    slug: 'desk-objects',
    name: 'Desk Objects',
    description: 'Weighted desktop monoliths, phone cradles, magnetic trays, and cable rest organizers calibrated for clutter-free workflows.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    productCount: 2,
    status: 'ACTIVE',
  },
  {
    id: 'col-003',
    slug: 'home-decor',
    name: 'Home & Decor',
    description: 'Watertight parametric vases, Roman-inspired archway bookends, and ambient light diffusers casting gentle shadow plays.',
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
    productCount: 2,
    status: 'ACTIVE',
  },
  {
    id: 'col-004',
    slug: 'character-collectibles',
    name: 'Character & Collectibles',
    description: 'Tactile chibi companions, limited studio art toys, and bespoke photo-to-3D keepsake figurines with weighted brass bases.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    productCount: 2,
    status: 'ACTIVE',
  }
];

export function getCollections(): Collection[] {
  return readJsonFile<Collection[]>(COLLECTIONS_FILE, INITIAL_COLLECTIONS);
}

export function updateCollection(id: string, updates: Partial<Collection>): Collection | null {
  const collections = getCollections();
  const idx = collections.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  collections[idx] = { ...collections[idx], ...updates };
  writeJsonFile(COLLECTIONS_FILE, collections);
  return collections[idx];
}

// ---------------- STORE SETTINGS ---------------- //

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'WhereIsIt Studio',
  tagline: '3D Printed Premium Stuff & Bespoke Design Studio',
  contactEmail: 'studio@whereisit.design',
  contactPhone: '+62 812-3456-7890',
  studioAddress: 'Jl. Senopati No. 44, Kebayoran Baru, Jakarta Selatan',
  currency: 'IDR',
  taxRate: 0,
  announcementText: 'Complimentary insured shipping on all curated drops over Rp 1.500.000',
  announcementActive: true,
  shippingCarriers: [
    { name: 'JNE Express Regular (2-3 Days)', fee: 25000, active: true },
    { name: 'JNE YES (Next Day Delivery)', fee: 40000, active: true },
    { name: 'SiCepat Cargo (Secure Wood Crating)', fee: 65000, active: true },
    { name: 'Paxel Secure Cold/Dry Dispatch', fee: 35000, active: true },
  ],
  paymentMethods: [
    { name: 'QRIS Instant (GoPay, OVO, ShopeePay)', type: 'E-WALLET', active: true },
    { name: 'BCA Virtual Account', type: 'VA', active: true },
    { name: 'Mandiri Virtual Account', type: 'VA', active: true },
    { name: 'Credit / Debit Card (Visa, Mastercard)', type: 'CARD', active: true },
  ],
};

export function getStoreSettings(): StoreSettings {
  return readJsonFile<StoreSettings>(SETTINGS_FILE, INITIAL_SETTINGS);
}

export function updateStoreSettings(updates: Partial<StoreSettings>): StoreSettings {
  const current = getStoreSettings();
  const updated = { ...current, ...updates };
  writeJsonFile(SETTINGS_FILE, updated);
  return updated;
}

// ---------------- JOURNAL / BLOG ---------------- //

const INITIAL_JOURNAL: JournalArticle[] = [
  {
    id: 'art-001',
    slug: 'the-art-of-gyroid-infill',
    title: 'The Hidden Architecture of Internal Gyroid Infill',
    excerpt: 'Why mathematical triply periodic minimal surfaces are replacing solid plastic mass in modern furniture engineering.',
    content: 'In traditional manufacturing, strength requires bulk. In 3D computational design, strength comes from geometry. Gyroid infill distributes mechanical loads in all three spatial dimensions equally without weak shear planes...',
    coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    author: 'WhereIsIt Studio Engineering',
    status: 'PUBLISHED',
    publishedAt: '2026-03-15',
  },
  {
    id: 'art-002',
    slug: 'photo-to-chibi-3d-journey',
    title: 'From Wedding Photo to Hand-Finished 3D Miniature',
    excerpt: 'Behind the scenes: how our sculptors translate human emotion and facial landmarks into charming tactile keepsakes.',
    content: 'Every face has an emotional signature: the way laughter wrinkles around the eyes, a habitual tilt of the head, or the drape of a cherished jacket. When client photos arrive at our studio, we do not simply run an automated AI filter...',
    coverImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    author: 'Head of Character Design',
    status: 'PUBLISHED',
    publishedAt: '2026-04-02',
  }
];

export function getJournalArticles(): JournalArticle[] {
  return readJsonFile<JournalArticle[]>(JOURNAL_FILE, INITIAL_JOURNAL);
}

export function updateJournalArticle(id: string, updates: Partial<JournalArticle>): JournalArticle | null {
  const articles = getJournalArticles();
  const idx = articles.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  articles[idx] = { ...articles[idx], ...updates };
  writeJsonFile(JOURNAL_FILE, articles);
  return articles[idx];
}
