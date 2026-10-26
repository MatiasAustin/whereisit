export type ProductCategory = 
  | 'Small Furniture' 
  | 'Desk Objects' 
  | 'Home & Decor' 
  | 'Character & Collectibles';

export type ProductBadge = 'popular' | 'profitably' | 'premium' | 'limited' | 'signature' | 'new';

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  badge?: ProductBadge;
  description: string;
  shortDescription: string;
  materials: string;
  dimensions: string;
  weight: string;
  layerResolution: string;
  colorOptions: string[];
  images: string[];
  featured: boolean;
  stock: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  rating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  note?: string;
}

export interface CustomDesignInquiry {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  projectType: 'Home Decor' | 'Small Furniture' | 'Desk Object' | 'Functional Hardware' | 'Other';
  dimensionConstraints?: string;
  estimatedBudget?: string;
  description: string;
  desiredTimeline?: string;
  status: 'NEW' | 'IN_REVIEW' | 'QUOTED' | 'IN_PRODUCTION' | 'COMPLETED';
  createdAt: string;
}

export interface CustomCharacterInquiry {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  characterType: 'Self / Portrait' | 'Couple' | 'Pet' | 'Custom Mascot';
  style: 'Chibi Petite' | 'Minimalist Line' | 'Comic Stylized' | 'Mascot Costume';
  plaqueText?: string;
  photoUrl?: string;
  referenceNotes: string;
  status: 'NEW' | '3D_MODELING' | 'REVISION' | 'PRINTING' | 'SHIPPED';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingCarrier: string;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'VERIFIED';
  orderStatus: 'PENDING' | 'PROCESSING' | 'PRINTING' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  customerType: 'RETAIL' | 'STUDIO_PARTNER' | 'INTERIOR_DESIGNER' | 'COLLECTOR';
  city?: string;
  ordersCount: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
}

export interface Discount {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // percentage (e.g. 15) or amount in IDR (e.g. 50000)
  minPurchase?: number;
  usageLimit?: number;
  usageCount: number;
  status: 'ACTIVE' | 'EXPIRED' | 'DISABLED';
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
}

export interface DraftOrder {
  id: string;
  draftNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'DRAFT' | 'INVOICED' | 'CONVERTED';
  notes?: string;
  createdAt: string;
}

export interface AbandonedCheckout {
  id: string;
  checkoutNumber: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  recoveryStatus: 'NOT_RECOVERED' | 'EMAIL_SENT' | 'RECOVERED';
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  author: string;
  email: string;
  rating: number;
  title: string;
  content: string;
  verifiedPurchase: boolean;
  status: 'APPROVED' | 'PENDING' | 'HIDDEN';
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface HomepageContent {
  // Hero Section
  heroHeadlineTag: string;
  heroHeadlineTitle: string;
  heroStatement: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroSpecLayer: string;
  heroSpecMaterial: string;
  heroShortcut1Title: string;
  heroShortcut1Image: string;
  heroShortcut2Title: string;
  heroShortcut2Image: string;

  // About Section (01/ Philosophy & Context)
  aboutSectionTag: string;
  aboutTitle: string;
  aboutLocationTag: string;
  aboutStoreImage: string;
  aboutStoreCaption: string;
  aboutDetailImage: string;
  aboutDetailTag: string;
  aboutStoryP1: string;
  aboutStoryP2: string;
  aboutPillar1Title: string;
  aboutPillar1Desc: string;
  aboutPillar2Title: string;
  aboutPillar2Desc: string;

  // Custom Design Section
  customDesignTag: string;
  customDesignTitle: string;
  customDesignDescription: string;

  // Custom Character Section
  customCharacterTag: string;
  customCharacterTitle: string;
  customCharacterDescription: string;

  // Studio Standards (Craft & Infill)
  studioStandardsTag: string;
  studioStandardsTitle: string;
  studioStandardsSubtitle: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl?: string;
  footerLogoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  studioAddress: string;
  currency: string;
  taxRate: number;
  announcementText: string;
  announcementActive: boolean;
  shippingCarriers: { name: string; fee: number; active: boolean }[];
  paymentMethods: { name: string; type: string; active: boolean }[];
  homepageContent?: HomepageContent;
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  status: 'PUBLISHED' | 'DRAFT';
  publishedAt: string;
}
