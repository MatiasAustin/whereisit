import fs from 'fs';
import path from 'path';
import { Product, CustomDesignInquiry, CustomCharacterInquiry, Order } from '@/types';
import { INITIAL_PRODUCTS } from './initialData';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const DESIGN_INQUIRIES_FILE = path.join(DATA_DIR, 'design-inquiries.json');
const CHARACTER_INQUIRIES_FILE = path.join(DATA_DIR, 'character-inquiries.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ---------------- PRODUCTS ---------------- //

export function getProducts(): Product[] {
  ensureDirectoryExists();
  if (!fs.existsSync(PRODUCTS_FILE)) {
    saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_PRODUCTS;
  } catch (err) {
    console.error('Error reading products file, returning initial data', err);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  ensureDirectoryExists();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

export function getProductBySlug(slug: string): Product | undefined {
  const products = getProducts();
  return products.find((p) => p.slug === slug || p.id === slug);
}

export function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const products = getProducts();
  const id = `prod-${Date.now()}`;
  const now = new Date().toISOString();
  
  // ensure unique slug
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

export function getDesignInquiries(): CustomDesignInquiry[] {
  ensureDirectoryExists();
  if (!fs.existsSync(DESIGN_INQUIRIES_FILE)) {
    // Initial sample inquiries
    const initialInquiries: CustomDesignInquiry[] = [
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
    fs.writeFileSync(DESIGN_INQUIRIES_FILE, JSON.stringify(initialInquiries, null, 2), 'utf-8');
    return initialInquiries;
  }
  try {
    return JSON.parse(fs.readFileSync(DESIGN_INQUIRIES_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

export function createDesignInquiry(data: Omit<CustomDesignInquiry, 'id' | 'createdAt' | 'status'>): CustomDesignInquiry {
  ensureDirectoryExists();
  const inquiries = getDesignInquiries();
  const newInq: CustomDesignInquiry = {
    ...data,
    id: `des-${Date.now()}`,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };
  inquiries.unshift(newInq);
  fs.writeFileSync(DESIGN_INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  return newInq;
}

export function updateDesignInquiryStatus(id: string, status: CustomDesignInquiry['status']): boolean {
  const inquiries = getDesignInquiries();
  const target = inquiries.find((i) => i.id === id);
  if (!target) return false;
  target.status = status;
  fs.writeFileSync(DESIGN_INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  return true;
}

// ---------------- CUSTOM CHARACTER INQUIRIES ---------------- //

export function getCharacterInquiries(): CustomCharacterInquiry[] {
  ensureDirectoryExists();
  if (!fs.existsSync(CHARACTER_INQUIRIES_FILE)) {
    const initialCharacterInquiries: CustomCharacterInquiry[] = [
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
    fs.writeFileSync(CHARACTER_INQUIRIES_FILE, JSON.stringify(initialCharacterInquiries, null, 2), 'utf-8');
    return initialCharacterInquiries;
  }
  try {
    return JSON.parse(fs.readFileSync(CHARACTER_INQUIRIES_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

export function createCharacterInquiry(data: Omit<CustomCharacterInquiry, 'id' | 'createdAt' | 'status'>): CustomCharacterInquiry {
  ensureDirectoryExists();
  const inquiries = getCharacterInquiries();
  const newInq: CustomCharacterInquiry = {
    ...data,
    id: `char-${Date.now()}`,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };
  inquiries.unshift(newInq);
  fs.writeFileSync(CHARACTER_INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  return newInq;
}

export function updateCharacterInquiryStatus(id: string, status: CustomCharacterInquiry['status']): boolean {
  const inquiries = getCharacterInquiries();
  const target = inquiries.find((i) => i.id === id);
  if (!target) return false;
  target.status = status;
  fs.writeFileSync(CHARACTER_INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  return true;
}

// ---------------- ORDERS ---------------- //

export function getOrders(): Order[] {
  ensureDirectoryExists();
  if (!fs.existsSync(ORDERS_FILE)) {
    const initialOrders: Order[] = [
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
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(initialOrders, null, 2), 'utf-8');
    return initialOrders;
  }
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

export function createOrder(data: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
  ensureDirectoryExists();
  const orders = getOrders();
  const orderNumber = `WI-${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
  const newOrder: Order = {
    ...data,
    id: `ord-${Date.now()}`,
    orderNumber,
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  return newOrder;
}

export function updateOrderStatus(id: string, orderStatus: Order['orderStatus'], paymentStatus?: Order['paymentStatus']): boolean {
  const orders = getOrders();
  const target = orders.find((o) => o.id === id);
  if (!target) return false;
  target.orderStatus = orderStatus;
  if (paymentStatus) target.paymentStatus = paymentStatus;
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  return true;
}
