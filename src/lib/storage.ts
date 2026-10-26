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
import { getSupabaseServerClient } from './supabaseServer';

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

function mapProductFromDB(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    badge: row.badge || undefined,
    description: row.description || '',
    shortDescription: row.short_description || '',
    materials: row.materials || '',
    dimensions: row.dimensions || '',
    weight: row.weight || '',
    layerResolution: row.layer_resolution || '',
    colorOptions: Array.isArray(row.color_options) ? row.color_options : [],
    images: Array.isArray(row.images) ? row.images : [],
    featured: Boolean(row.featured),
    stock: Number(row.stock ?? 10),
    status: row.status || 'ACTIVE',
    rating: Number(row.rating ?? 5.0),
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function mapProductToDB(p: Product) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    compare_at_price: p.compareAtPrice || null,
    badge: p.badge || null,
    description: p.description,
    short_description: p.shortDescription,
    materials: p.materials,
    dimensions: p.dimensions,
    weight: p.weight,
    layer_resolution: p.layerResolution,
    color_options: p.colorOptions || [],
    images: p.images || [],
    featured: p.featured,
    stock: p.stock,
    status: p.status,
    rating: p.rating,
    tags: p.tags || [],
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapProductFromDB);
      }
    } catch (err) {
      console.warn('Supabase query failed for products, falling back to local file storage:', err);
    }
  }
  return readJsonFile<Product[]>(PRODUCTS_FILE, INITIAL_PRODUCTS);
}

export function saveProducts(products: Product[]): void {
  writeJsonFile(PRODUCTS_FILE, products);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug || p.id === slug);
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const products = await getProducts();
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

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('products').insert([mapProductToDB(newProduct)]);
    } catch (err) {
      console.error('Failed to insert product into Supabase:', err);
    }
  }

  // Backup sync to local file
  const localList = readJsonFile<Product[]>(PRODUCTS_FILE, INITIAL_PRODUCTS);
  localList.unshift(newProduct);
  saveProducts(localList);

  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: Product = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('products').update(mapProductToDB(updated)).eq('id', id);
    } catch (err) {
      console.error('Failed to update product in Supabase:', err);
    }
  }

  // Backup sync to local file
  const localList = readJsonFile<Product[]>(PRODUCTS_FILE, INITIAL_PRODUCTS);
  const localIdx = localList.findIndex((p) => p.id === id);
  if (localIdx !== -1) {
    localList[localIdx] = updated;
    saveProducts(localList);
  }

  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.error('Failed to delete product in Supabase:', err);
    }
  }

  const localList = readJsonFile<Product[]>(PRODUCTS_FILE, INITIAL_PRODUCTS);
  const filtered = localList.filter((p) => p.id !== id);
  if (filtered.length === localList.length) return false;
  saveProducts(filtered);
  return true;
}

// ---------------- DESIGN INQUIRIES ---------------- //

export async function getDesignInquiries(): Promise<CustomDesignInquiry[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('custom_design_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          clientName: d.client_name,
          email: d.email,
          phone: d.phone || '',
          projectType: d.project_type,
          dimensionConstraints: d.dimension_constraints || undefined,
          estimatedBudget: d.estimated_budget || undefined,
          description: d.description,
          desiredTimeline: d.desired_timeline || undefined,
          status: d.status,
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase design inquiries fetch failed:', err);
    }
  }
  return readJsonFile<CustomDesignInquiry[]>(DESIGN_INQUIRIES_FILE, []);
}

export async function createDesignInquiry(data: Omit<CustomDesignInquiry, 'id' | 'status' | 'createdAt'>): Promise<CustomDesignInquiry> {
  const id = `des-${Date.now()}`;
  const now = new Date().toISOString();

  const newInquiry: CustomDesignInquiry = {
    ...data,
    id,
    status: 'NEW',
    createdAt: now,
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('custom_design_inquiries').insert([{
        id,
        client_name: newInquiry.clientName,
        email: newInquiry.email,
        phone: newInquiry.phone,
        project_type: newInquiry.projectType,
        dimension_constraints: newInquiry.dimensionConstraints || null,
        estimated_budget: newInquiry.estimatedBudget || null,
        description: newInquiry.description,
        desired_timeline: newInquiry.desiredTimeline || null,
        status: newInquiry.status,
        created_at: now,
      }]);
    } catch (err) {
      console.error('Failed to insert design inquiry in Supabase:', err);
    }
  }

  const list = readJsonFile<CustomDesignInquiry[]>(DESIGN_INQUIRIES_FILE, []);
  list.unshift(newInquiry);
  writeJsonFile(DESIGN_INQUIRIES_FILE, list);
  return newInquiry;
}

export async function updateDesignInquiryStatus(id: string, status: CustomDesignInquiry['status']): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('custom_design_inquiries').update({ status }).eq('id', id);
    } catch (err) {
      console.error('Failed to update design inquiry status in Supabase:', err);
    }
  }

  const list = readJsonFile<CustomDesignInquiry[]>(DESIGN_INQUIRIES_FILE, []);
  const item = list.find((i) => i.id === id);
  if (!item) return false;
  item.status = status;
  writeJsonFile(DESIGN_INQUIRIES_FILE, list);
  return true;
}

// ---------------- CHARACTER INQUIRIES ---------------- //

export async function getCharacterInquiries(): Promise<CustomCharacterInquiry[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('custom_character_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((c: any) => ({
          id: c.id,
          clientName: c.client_name,
          email: c.email,
          phone: c.phone || '',
          characterType: c.character_type,
          style: c.style,
          plaqueText: c.plaque_text || undefined,
          photoUrl: c.photo_url || undefined,
          referenceNotes: c.reference_notes,
          status: c.status,
          createdAt: c.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase character inquiries fetch failed:', err);
    }
  }
  return readJsonFile<CustomCharacterInquiry[]>(CHARACTER_INQUIRIES_FILE, []);
}

export async function createCharacterInquiry(data: Omit<CustomCharacterInquiry, 'id' | 'status' | 'createdAt'>): Promise<CustomCharacterInquiry> {
  const id = `chr-${Date.now()}`;
  const now = new Date().toISOString();

  const newInquiry: CustomCharacterInquiry = {
    ...data,
    id,
    status: 'NEW',
    createdAt: now,
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('custom_character_inquiries').insert([{
        id,
        client_name: newInquiry.clientName,
        email: newInquiry.email,
        phone: newInquiry.phone,
        character_type: newInquiry.characterType,
        style: newInquiry.style,
        plaque_text: newInquiry.plaqueText || null,
        photo_url: newInquiry.photoUrl || null,
        reference_notes: newInquiry.referenceNotes,
        status: newInquiry.status,
        created_at: now,
      }]);
    } catch (err) {
      console.error('Failed to insert character inquiry in Supabase:', err);
    }
  }

  const list = readJsonFile<CustomCharacterInquiry[]>(CHARACTER_INQUIRIES_FILE, []);
  list.unshift(newInquiry);
  writeJsonFile(CHARACTER_INQUIRIES_FILE, list);
  return newInquiry;
}

export async function updateCharacterInquiryStatus(id: string, status: CustomCharacterInquiry['status']): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('custom_character_inquiries').update({ status }).eq('id', id);
    } catch (err) {
      console.error('Failed to update character inquiry in Supabase:', err);
    }
  }

  const list = readJsonFile<CustomCharacterInquiry[]>(CHARACTER_INQUIRIES_FILE, []);
  const item = list.find((i) => i.id === id);
  if (!item) return false;
  item.status = status;
  writeJsonFile(CHARACTER_INQUIRIES_FILE, list);
  return true;
}

// ---------------- ORDERS ---------------- //

export async function getOrders(): Promise<Order[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number,
          customer: o.customer,
          items: o.items,
          subtotal: Number(o.subtotal),
          shippingFee: Number(o.shipping_fee || 0),
          total: Number(o.total),
          shippingCarrier: o.shipping_carrier,
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          orderStatus: o.order_status,
          createdAt: o.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase orders fetch failed:', err);
    }
  }
  return readJsonFile<Order[]>(ORDERS_FILE, []);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const orders = await getOrders();
  return orders.find((o) => o.id === id || o.orderNumber === id);
}

export async function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
  const id = `ord-${Date.now()}`;
  const orderNumber = `WSI-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id,
    orderNumber,
    createdAt: now,
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('orders').insert([{
        id,
        order_number: orderNumber,
        customer: newOrder.customer,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        shipping_fee: newOrder.shippingFee,
        total: newOrder.total,
        shipping_carrier: newOrder.shippingCarrier,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        order_status: newOrder.orderStatus,
        created_at: now,
      }]);
    } catch (err) {
      console.error('Failed to insert order in Supabase:', err);
    }
  }

  const orders = readJsonFile<Order[]>(ORDERS_FILE, []);
  orders.unshift(newOrder);
  writeJsonFile(ORDERS_FILE, orders);

  // Auto-deduct stock
  for (const item of newOrder.items) {
    const products = await getProducts();
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      await updateProduct(prod.id, { stock: Math.max(0, prod.stock - item.quantity) });
    }
  }

  return newOrder;
}

export async function updateOrderStatus(id: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const updates: any = { order_status: status };
      if (paymentStatus) updates.payment_status = paymentStatus;
      await supabase.from('orders').update(updates).eq('id', id);
    } catch (err) {
      console.error('Failed to update order status in Supabase:', err);
    }
  }

  const orders = readJsonFile<Order[]>(ORDERS_FILE, []);
  const order = orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) return false;
  order.orderStatus = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  writeJsonFile(ORDERS_FILE, orders);
  return true;
}

// ---------------- CUSTOMERS ---------------- //

const INITIAL_CUSTOMERS: Customer[] = [
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

export async function getCustomers(): Promise<Customer[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          firstName: c.first_name,
          lastName: c.last_name,
          email: c.email,
          phone: c.phone || undefined,
          customerType: c.customer_type,
          city: c.city || undefined,
          ordersCount: Number(c.orders_count || 0),
          totalSpent: Number(c.total_spent || 0),
          notes: c.notes || undefined,
          createdAt: c.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase customers fetch failed:', err);
    }
  }
  return readJsonFile<Customer[]>(CUSTOMERS_FILE, INITIAL_CUSTOMERS);
}

export async function createCustomer(customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
  const id = `cust-${Date.now()}`;
  const now = new Date().toISOString();
  const newCustomer: Customer = { ...customerData, id, createdAt: now };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('customers').insert([{
        id,
        first_name: newCustomer.firstName,
        last_name: newCustomer.lastName,
        email: newCustomer.email,
        phone: newCustomer.phone || null,
        customer_type: newCustomer.customerType,
        city: newCustomer.city || null,
        orders_count: newCustomer.ordersCount,
        total_spent: newCustomer.totalSpent,
        notes: newCustomer.notes || null,
        created_at: now,
      }]);
    } catch (err) {
      console.error('Failed to create customer in Supabase:', err);
    }
  }

  const customers = readJsonFile<Customer[]>(CUSTOMERS_FILE, INITIAL_CUSTOMERS);
  customers.unshift(newCustomer);
  writeJsonFile(CUSTOMERS_FILE, customers);
  return newCustomer;
}

// ---------------- DISCOUNTS ---------------- //

const INITIAL_DISCOUNTS: Discount[] = [
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
    status: 'EXPIRED',
    startsAt: '2026-01-01T00:00:00Z',
    endsAt: '2026-03-31T23:59:59Z',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export async function getDiscounts(): Promise<Discount[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          code: d.code,
          type: d.type,
          value: Number(d.value),
          minPurchase: d.min_purchase ? Number(d.min_purchase) : undefined,
          usageLimit: d.usage_limit ? Number(d.usage_limit) : undefined,
          usageCount: Number(d.usage_count || 0),
          status: d.status,
          startsAt: d.starts_at || undefined,
          endsAt: d.ends_at || undefined,
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase discounts fetch failed:', err);
    }
  }
  return readJsonFile<Discount[]>(DISCOUNTS_FILE, INITIAL_DISCOUNTS);
}

export async function createDiscount(data: Omit<Discount, 'id' | 'usageCount' | 'createdAt'>): Promise<Discount> {
  const id = `disc-${Date.now()}`;
  const now = new Date().toISOString();
  const newDiscount: Discount = {
    ...data,
    id,
    code: data.code.toUpperCase().trim(),
    usageCount: 0,
    createdAt: now,
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('discounts').insert([{
        id,
        code: newDiscount.code,
        type: newDiscount.type,
        value: newDiscount.value,
        min_purchase: newDiscount.minPurchase || null,
        usage_limit: newDiscount.usageLimit || null,
        usage_count: 0,
        status: newDiscount.status,
        starts_at: newDiscount.startsAt || null,
        ends_at: newDiscount.endsAt || null,
        created_at: now,
      }]);
    } catch (err) {
      console.error('Failed to create discount in Supabase:', err);
    }
  }

  const list = readJsonFile<Discount[]>(DISCOUNTS_FILE, INITIAL_DISCOUNTS);
  list.unshift(newDiscount);
  writeJsonFile(DISCOUNTS_FILE, list);
  return newDiscount;
}

export async function updateDiscount(id: string, updates: Partial<Discount>): Promise<Discount | null> {
  const list = readJsonFile<Discount[]>(DISCOUNTS_FILE, INITIAL_DISCOUNTS);
  const idx = list.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  writeJsonFile(DISCOUNTS_FILE, list);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('discounts').update(updates).eq('id', id);
    } catch (err) {
      console.error('Failed to update discount in Supabase:', err);
    }
  }
  return list[idx];
}

export async function deleteDiscount(id: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('discounts').delete().eq('id', id);
    } catch (err) {
      console.error('Failed to delete discount in Supabase:', err);
    }
  }

  const list = readJsonFile<Discount[]>(DISCOUNTS_FILE, INITIAL_DISCOUNTS);
  const filtered = list.filter((d) => d.id !== id);
  if (filtered.length === list.length) return false;
  writeJsonFile(DISCOUNTS_FILE, filtered);
  return true;
}

// ---------------- DRAFT ORDERS ---------------- //

export async function getDraftOrders(): Promise<DraftOrder[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('draft_orders').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          draftNumber: d.draft_number,
          customerName: d.customer_name,
          email: d.email,
          phone: d.phone || undefined,
          items: d.items,
          subtotal: Number(d.subtotal),
          shippingFee: Number(d.shipping_fee || 0),
          total: Number(d.total),
          status: d.status,
          notes: d.notes || undefined,
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase draft orders fetch failed:', err);
    }
  }
  return readJsonFile<DraftOrder[]>(DRAFT_ORDERS_FILE, []);
}

export async function createDraftOrder(data: Omit<DraftOrder, 'id' | 'draftNumber' | 'createdAt'>): Promise<DraftOrder> {
  const id = `draft-${Date.now()}`;
  const draftNumber = `DFT-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();
  const newDraft: DraftOrder = { ...data, id, draftNumber, createdAt: now };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('draft_orders').insert([{
        id,
        draft_number: draftNumber,
        customer_name: newDraft.customerName,
        email: newDraft.email,
        phone: newDraft.phone || null,
        items: newDraft.items,
        subtotal: newDraft.subtotal,
        shipping_fee: newDraft.shippingFee,
        total: newDraft.total,
        status: newDraft.status,
        notes: newDraft.notes || null,
        created_at: now,
      }]);
    } catch (err) {
      console.error('Failed to create draft order in Supabase:', err);
    }
  }

  const list = readJsonFile<DraftOrder[]>(DRAFT_ORDERS_FILE, []);
  list.unshift(newDraft);
  writeJsonFile(DRAFT_ORDERS_FILE, list);
  return newDraft;
}

// ---------------- ABANDONED CHECKOUTS ---------------- //

export async function getAbandonedCheckouts(): Promise<AbandonedCheckout[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('abandoned_checkouts').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((a: any) => ({
          id: a.id,
          checkoutNumber: a.checkout_number,
          customerEmail: a.customer_email,
          customerPhone: a.customer_phone || undefined,
          items: a.items,
          subtotal: Number(a.subtotal),
          recoveryStatus: a.recovery_status,
          createdAt: a.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase abandoned checkouts fetch failed:', err);
    }
  }
  return readJsonFile<AbandonedCheckout[]>(ABANDONED_FILE, []);
}

export async function recordAbandonedCheckout(data: Omit<AbandonedCheckout, 'id' | 'checkoutNumber' | 'createdAt'>): Promise<AbandonedCheckout> {
  const id = `abn-${Date.now()}`;
  const checkoutNumber = `CHK-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();
  const record: AbandonedCheckout = { ...data, id, checkoutNumber, createdAt: now };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('abandoned_checkouts').insert([{
        id,
        checkout_number: checkoutNumber,
        customer_email: record.customerEmail,
        customer_phone: record.customerPhone || null,
        items: record.items,
        subtotal: record.subtotal,
        recovery_status: record.recoveryStatus,
        created_at: now,
      }]);
    } catch (err) {
      console.error('Failed to record abandoned checkout in Supabase:', err);
    }
  }

  const list = readJsonFile<AbandonedCheckout[]>(ABANDONED_FILE, []);
  list.unshift(record);
  writeJsonFile(ABANDONED_FILE, list);
  return record;
}

export async function updateAbandonedStatus(id: string, status: AbandonedCheckout['recoveryStatus']): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('abandoned_checkouts').update({ recovery_status: status }).eq('id', id);
    } catch (err) {
      console.error('Failed to update abandoned status in Supabase:', err);
    }
  }

  const list = readJsonFile<AbandonedCheckout[]>(ABANDONED_FILE, []);
  const item = list.find((a) => a.id === id);
  if (!item) return false;
  item.recoveryStatus = status;
  writeJsonFile(ABANDONED_FILE, list);
  return true;
}

// ---------------- REVIEWS ---------------- //

const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'prod-arch-organizer',
    productName: 'Architectural Desk Organiser (No. 01)',
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
    productId: 'prod-monolith-lamp',
    productName: 'Monolith Ambient Table Lamp',
    author: 'Clara Sasmita',
    email: 'clara@interiorvibes.id',
    rating: 5,
    title: 'Warm ambient glow with sculpted elegance',
    content: 'Layer resolusi 0.12mm benar-benar halus, efek difusi cahayanya warm dan menenangkan untuk ruang studio.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-09-28T16:45:00Z',
  },
];

export async function getReviews(): Promise<ProductReview[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('product_reviews').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          productId: r.product_id,
          productName: r.product_name,
          author: r.author,
          email: r.email,
          rating: Number(r.rating || 5),
          title: r.title,
          content: r.content,
          verifiedPurchase: Boolean(r.verified_purchase),
          status: r.status,
          createdAt: r.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase reviews fetch failed:', err);
    }
  }
  return readJsonFile<ProductReview[]>(REVIEWS_FILE, INITIAL_REVIEWS);
}

export async function createReview(data: Omit<ProductReview, 'id' | 'createdAt'>): Promise<ProductReview> {
  const id = `rev-${Date.now()}`;
  const now = new Date().toISOString();
  const newRev: ProductReview = { ...data, id, createdAt: now };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('product_reviews').insert([{
        id,
        product_id: newRev.productId,
        product_name: newRev.productName,
        author: newRev.author,
        email: newRev.email,
        rating: newRev.rating,
        title: newRev.title,
        content: newRev.content,
        verified_purchase: newRev.verifiedPurchase,
        status: newRev.status,
        created_at: now,
      }]);
    } catch (err) {
      console.error('Failed to create review in Supabase:', err);
    }
  }

  const list = readJsonFile<ProductReview[]>(REVIEWS_FILE, INITIAL_REVIEWS);
  list.unshift(newRev);
  writeJsonFile(REVIEWS_FILE, list);
  return newRev;
}

export async function updateReviewStatus(id: string, status: ProductReview['status']): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('product_reviews').update({ status }).eq('id', id);
    } catch (err) {
      console.error('Failed to update review status in Supabase:', err);
    }
  }

  const list = readJsonFile<ProductReview[]>(REVIEWS_FILE, INITIAL_REVIEWS);
  const item = list.find((r) => r.id === id);
  if (!item) return false;
  item.status = status;
  writeJsonFile(REVIEWS_FILE, list);
  return true;
}

// ---------------- SUBSCRIBERS ---------------- //

export async function getSubscribers(): Promise<Subscriber[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((s: any) => ({
          id: s.id,
          email: s.email,
          source: s.source || 'footer',
          createdAt: s.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase subscribers fetch failed:', err);
    }
  }
  return readJsonFile<Subscriber[]>(SUBSCRIBERS_FILE, []);
}

export async function addSubscriber(email: string, source: string = 'footer'): Promise<Subscriber | null> {
  const cleanEmail = email.toLowerCase().trim();
  const list = readJsonFile<Subscriber[]>(SUBSCRIBERS_FILE, []);
  if (list.some((s) => s.email === cleanEmail)) return null;

  const id = `sub-${Date.now()}`;
  const now = new Date().toISOString();
  const newSub: Subscriber = { id, email: cleanEmail, source, createdAt: now };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('subscribers').insert([{
        id,
        email: cleanEmail,
        source,
        created_at: now,
      }]);
    } catch (err) {
      console.error('Failed to add subscriber in Supabase:', err);
    }
  }

  list.unshift(newSub);
  writeJsonFile(SUBSCRIBERS_FILE, list);
  return newSub;
}

// ---------------- COLLECTIONS ---------------- //

const INITIAL_COLLECTIONS: Collection[] = [
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

export async function getCollections(): Promise<Collection[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('collections').select('*');
      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description || '',
          image: c.image || '',
          productCount: Number(c.product_count || 0),
          status: c.status || 'ACTIVE',
        }));
      }
    } catch (err) {
      console.warn('Supabase collections fetch failed:', err);
    }
  }
  return readJsonFile<Collection[]>(COLLECTIONS_FILE, INITIAL_COLLECTIONS);
}

export async function updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | null> {
  const list = readJsonFile<Collection[]>(COLLECTIONS_FILE, INITIAL_COLLECTIONS);
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  writeJsonFile(COLLECTIONS_FILE, list);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('collections').update(updates).eq('id', id);
    } catch (err) {
      console.error('Failed to update collection in Supabase:', err);
    }
  }
  return list[idx];
}

// ---------------- STORE SETTINGS ---------------- //

const INITIAL_SETTINGS: StoreSettings = {
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
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('store_settings').select('*').eq('id', 'default').single();
      if (!error && data && data.data) {
        return data.data as StoreSettings;
      }
    } catch (err) {
      console.warn('Supabase settings fetch failed:', err);
    }
  }
  return readJsonFile<StoreSettings>(SETTINGS_FILE, INITIAL_SETTINGS);
}

export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const merged: StoreSettings = { ...current, ...updates };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('store_settings').upsert({
        id: 'default',
        data: merged,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to update settings in Supabase:', err);
    }
  }

  writeJsonFile(SETTINGS_FILE, merged);
  return merged;
}

// ---------------- JOURNAL / BLOG ---------------- //

const INITIAL_JOURNAL: JournalArticle[] = [
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

export async function getJournalArticles(): Promise<JournalArticle[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('journal_articles').select('*').order('published_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((j: any) => ({
          id: j.id,
          slug: j.slug,
          title: j.title,
          excerpt: j.excerpt || '',
          content: j.content || '',
          coverImage: j.cover_image || '',
          author: j.author || '',
          status: j.status || 'PUBLISHED',
          publishedAt: j.published_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase journal fetch failed:', err);
    }
  }
  return readJsonFile<JournalArticle[]>(JOURNAL_FILE, INITIAL_JOURNAL);
}

export async function updateJournalArticle(id: string, updates: Partial<JournalArticle>): Promise<JournalArticle | null> {
  const list = readJsonFile<JournalArticle[]>(JOURNAL_FILE, INITIAL_JOURNAL);
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  writeJsonFile(JOURNAL_FILE, list);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('journal_articles').update(updates).eq('id', id);
    } catch (err) {
      console.error('Failed to update journal article in Supabase:', err);
    }
  }
  return list[idx];
}
