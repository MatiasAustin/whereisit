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
  JournalArticle,
  StravaPreOrder,
  StravaOrderStatus,
  StravaCustomData,
  PublicQueueItem,
  QueueSettings,
  NotifyListEntry,
  StravaMediaConfig,
  StravaVariation,
  ProductionBatch,
  InspoItem
} from '@/types';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import { INITIAL_PRODUCTS } from './initialData';
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_DISCOUNTS, 
  INITIAL_REVIEWS, 
  INITIAL_COLLECTIONS, 
  INITIAL_SETTINGS, 
  INITIAL_JOURNAL,
  DEFAULT_HOMEPAGE_CONTENT,
  DEFAULT_QUEUE_SETTINGS,
  DEFAULT_STAGE_LABELS,
  DEFAULT_SHIPPING_CARRIERS
} from './studioDefaults';
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
const STRAVA_ORDERS_FILE = path.join(DATA_DIR, 'strava-orders.json');
const QUEUE_SETTINGS_FILE = path.join(DATA_DIR, 'queue-settings.json');
const NOTIFY_LIST_FILE = path.join(DATA_DIR, 'notify-list.json');
const STRAVA_MEDIA_FILE = path.join(DATA_DIR, 'strava-media.json');
const SUPABASE_CONFIG_FILE = path.join(DATA_DIR, 'supabase-config.json');
const BATCHES_FILE = path.join(DATA_DIR, 'production-batches.json');
const INSPO_FILE = path.join(DATA_DIR, 'inspo.json');

export interface SupabaseConfigData {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  updatedAt?: string;
}

// Detect Serverless / Read-Only Environment (e.g. Vercel Serverless / AWS Lambda)
const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.cwd().startsWith('/var/task')
);

const BASE_DATA_DIR = path.join(process.cwd(), 'data');
const SERVERLESS_TMP_DIR = '/tmp/whereisit-data';

// Warm in-memory cache across requests to guarantee immediate consistency
const memoryFileCache = new Map<string, any>();

function getStoragePaths(targetFile: string): { baseFile: string; writableFile: string; filename: string } {
  const filename = path.basename(targetFile);
  const baseFile = path.join(BASE_DATA_DIR, filename);
  const writableFile = IS_SERVERLESS ? path.join(SERVERLESS_TMP_DIR, filename) : baseFile;
  return { baseFile, writableFile, filename };
}

function ensureDirectoryExists(dirPath: string = BASE_DATA_DIR) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err: any) {
    // Silently ignore EROFS on read-only environments
    if (err?.code !== 'EROFS') {
      console.warn(`Notice creating directory ${dirPath}:`, err?.message || err);
    }
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  const { baseFile, writableFile, filename } = getStoragePaths(filePath);

  // 1. In-memory cache hit
  if (memoryFileCache.has(filename)) {
    return memoryFileCache.get(filename);
  }

  // 2. In serverless, if /tmp has a previous write for this instance, read from /tmp
  if (IS_SERVERLESS && fs.existsSync(writableFile)) {
    try {
      const raw = fs.readFileSync(writableFile, 'utf-8');
      const parsed = JSON.parse(raw);
      memoryFileCache.set(filename, parsed);
      return parsed;
    } catch (err) {
      console.warn(`Notice reading serverless tmp file ${writableFile}:`, err);
    }
  }

  // 2b. In serverless, also check root /tmp fallback
  if (IS_SERVERLESS) {
    try {
      const rootTmp = path.join('/tmp', filename);
      if (fs.existsSync(rootTmp)) {
        const raw = fs.readFileSync(rootTmp, 'utf-8');
        const parsed = JSON.parse(raw);
        memoryFileCache.set(filename, parsed);
        return parsed;
      }
    } catch {}
  }

  // 3. Read from bundled base file in data/
  if (fs.existsSync(baseFile)) {
    try {
      const raw = fs.readFileSync(baseFile, 'utf-8');
      const parsed = JSON.parse(raw);
      memoryFileCache.set(filename, parsed);
      return parsed;
    } catch (err) {
      console.error(`Error reading ${baseFile}:`, err);
    }
  }

  // 4. Fallback: store in cache and try writing to writableFile (safe against EROFS)
  memoryFileCache.set(filename, fallback);
  writeJsonFile(filePath, fallback);
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  const { baseFile, writableFile, filename } = getStoragePaths(filePath);

  // Always keep in-memory cache synchronized immediately
  memoryFileCache.set(filename, data);

  // Write to writableFile (/tmp on serverless, or data/ locally)
  try {
    ensureDirectoryExists(path.dirname(writableFile));
    fs.writeFileSync(writableFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err: any) {
    if (IS_SERVERLESS) {
      // If writableFile hit EROFS or permission error, fallback to root /tmp directly
      try {
        const rootTmp = path.join('/tmp', filename);
        fs.writeFileSync(rootTmp, JSON.stringify(data, null, 2), 'utf-8');
      } catch {
        // In-memory cache is already updated, safely continue
      }
    } else {
      console.warn(`Notice writing file ${writableFile}:`, err?.message || err);
    }
  }

  // If running in serverless and writableFile is /tmp, optionally attempt best-effort write to baseFile
  if (IS_SERVERLESS && writableFile !== baseFile) {
    try {
      fs.writeFileSync(baseFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // EROFS on /var/task is expected and normal in serverless - silently ignore!
    }
  }
}

// ---------------- MAPPER FUNCTIONS ---------------- //

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

// ---------------- AUTOMATIC SUPABASE SEEDER (VERCEL READY) ---------------- //

let hasTriggeredAutoSeed = false;

async function autoSeedSupabase(supabase: any) {
  if (hasTriggeredAutoSeed) return;
  hasTriggeredAutoSeed = true;

  try {
    console.log('⚡ Auto-seeding initial database rows to Supabase...');

    // 1. Products (only seed if table is completely empty)
    const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    if (!prodCount || prodCount === 0) {
      const dbProducts = INITIAL_PRODUCTS.map(mapProductToDB);
      await supabase.from('products').upsert(dbProducts, { onConflict: 'id' });
    }

    // 2. Settings (only seed if 'default' row does not exist)
    const { data: existingSettings } = await supabase.from('store_settings').select('id').eq('id', 'default').maybeSingle();
    if (!existingSettings) {
      await supabase.from('store_settings').insert([{
        id: 'default',
        data: INITIAL_SETTINGS,
        updated_at: new Date().toISOString(),
      }]);
    }

    // 2b. Strava Media (only seed if 'strava_media' row does not exist)
    const { data: existingMedia } = await supabase.from('store_settings').select('id').eq('id', 'strava_media').maybeSingle();
    if (!existingMedia) {
      await supabase.from('store_settings').insert([{
        id: 'strava_media',
        data: getDefaultStravaMediaConfig(),
        updated_at: new Date().toISOString(),
      }]);
    }

    // 3. Collections (only seed if table is completely empty)
    const { count: colCount } = await supabase.from('collections').select('*', { count: 'exact', head: true });
    if (!colCount || colCount === 0) {
      await supabase.from('collections').upsert(INITIAL_COLLECTIONS.map(c => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        image: c.image,
        product_count: c.productCount,
        status: c.status
      })), { onConflict: 'id' });
    }

    // 4. Reviews
    await supabase.from('product_reviews').upsert(INITIAL_REVIEWS.map(r => ({
      id: r.id,
      product_id: r.productId,
      product_name: r.productName,
      author: r.author,
      email: r.email,
      rating: r.rating,
      title: r.title,
      content: r.content,
      verified_purchase: r.verifiedPurchase,
      status: r.status,
      created_at: r.createdAt
    })), { onConflict: 'id' });

    // 5. Journal
    await supabase.from('journal_articles').upsert(INITIAL_JOURNAL.map(j => ({
      id: j.id,
      slug: j.slug,
      title: j.title,
      excerpt: j.excerpt,
      content: j.content,
      cover_image: j.coverImage,
      author: j.author,
      status: j.status,
      published_at: j.publishedAt
    })), { onConflict: 'id' });

    // 6. Discounts
    await supabase.from('discounts').upsert(INITIAL_DISCOUNTS.map(d => ({
      id: d.id,
      code: d.code,
      type: d.type,
      value: d.value,
      min_purchase: d.minPurchase || null,
      usage_limit: d.usageLimit || null,
      usage_count: d.usageCount || 0,
      status: d.status,
      starts_at: d.startsAt || null,
      created_at: d.createdAt
    })), { onConflict: 'id' });

    // 7. Customers
    await supabase.from('customers').upsert(INITIAL_CUSTOMERS.map(c => ({
      id: c.id,
      first_name: c.firstName,
      last_name: c.lastName,
      email: c.email,
      phone: c.phone || null,
      customer_type: c.customerType,
      city: c.city || null,
      orders_count: c.ordersCount,
      total_spent: c.totalSpent,
      notes: c.notes || null,
      created_at: c.createdAt
    })), { onConflict: 'id' });

    console.log('✅ Supabase database populated successfully!');
  } catch (err) {
    console.warn('Auto-seed to Supabase encountered non-fatal notice:', err);
  }
}

// ---------------- PRODUCTS ---------------- //

const LEGACY_PLACEHOLDER_IDS = ['prod-001', 'prod-002', 'prod-003', 'prod-004', 'prod-005', 'prod-006'];

export async function purgeLegacyProducts(): Promise<{ purgedCount: number }> {
  let purgedCount = 0;
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('products').select('id').in('id', LEGACY_PLACEHOLDER_IDS);
      if (data && data.length > 0) {
        await supabase.from('products').delete().in('id', LEGACY_PLACEHOLDER_IDS);
        purgedCount += data.length;
      }
    } catch (err) {
      console.warn('Purge legacy products in Supabase notice:', err);
    }
  }

  const localList = readJsonFile<Product[]>(PRODUCTS_FILE, INITIAL_PRODUCTS);
  const filtered = localList.filter((p) => !LEGACY_PLACEHOLDER_IDS.includes(p.id));
  if (filtered.length !== localList.length) {
    purgedCount += localList.length - filtered.length;
    saveProducts(filtered);
  }

  return { purgedCount };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Automatically purge any old legacy template placeholder products
        const hasLegacy = data.some((r: any) => LEGACY_PLACEHOLDER_IDS.includes(r.id));
        if (hasLegacy) {
          try {
            await supabase.from('products').delete().in('id', LEGACY_PLACEHOLDER_IDS);
          } catch (err) {
            console.warn('Auto-clean legacy products in Supabase notice:', err);
          }
        }

        const validData = data.filter((r: any) => !LEGACY_PLACEHOLDER_IDS.includes(r.id));
        return validData.map(mapProductFromDB);
      }
    } catch (err) {
      console.warn('Supabase query failed for products, falling back to local file storage:', err);
    }
  }
  const local = readJsonFile<Product[]>(PRODUCTS_FILE, []);
  const filteredLocal = local.filter((p) => !LEGACY_PLACEHOLDER_IDS.includes(p.id));
  if (filteredLocal.length !== local.length) {
    saveProducts(filteredLocal);
  }
  return filteredLocal;
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
  const localList = readJsonFile<Product[]>(PRODUCTS_FILE, []);
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
  const localList = readJsonFile<Product[]>(PRODUCTS_FILE, []);
  const localIdx = localList.findIndex((p) => p.id === id);
  if (localIdx !== -1) {
    localList[localIdx] = updated;
    saveProducts(localList);
  }

  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  let deletedFromSupabase = false;
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) deletedFromSupabase = true;
    } catch (err) {
      console.error('Failed to delete product in Supabase:', err);
    }
  }

  const localList = readJsonFile<Product[]>(PRODUCTS_FILE, []);
  const filtered = localList.filter((p) => p.id !== id);
  const deletedFromLocal = filtered.length !== localList.length;
  if (deletedFromLocal) {
    saveProducts(filtered);
  }
  return deletedFromLocal || deletedFromSupabase;
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

export async function getCustomers(): Promise<Customer[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        if (data && data.length > 0) {
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
        } else {
          await autoSeedSupabase(supabase);
          return INITIAL_CUSTOMERS;
        }
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

export async function getDiscounts(): Promise<Discount[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        if (data && data.length > 0) {
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
        } else {
          await autoSeedSupabase(supabase);
          return INITIAL_DISCOUNTS;
        }
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

export async function getReviews(): Promise<ProductReview[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('product_reviews').select('*').order('created_at', { ascending: false });
      if (!error) {
        if (data && data.length > 0) {
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
        } else {
          await autoSeedSupabase(supabase);
          return INITIAL_REVIEWS;
        }
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

export async function getCollections(): Promise<Collection[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('collections').select('*');
      if (!error) {
        if (data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            description: c.description || '',
            image: c.image || '',
            productCount: Number(c.product_count || 0),
            status: c.status || 'ACTIVE',
          }));
        } else {
          await autoSeedSupabase(supabase);
          return INITIAL_COLLECTIONS;
        }
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

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('store_settings').select('*').eq('id', 'default').single();
      if (!error && data && data.data) {
        const s = data.data as StoreSettings;
        return {
          ...INITIAL_SETTINGS,
          ...s,
          shippingCarriers: Array.isArray(s.shippingCarriers) && s.shippingCarriers.length > 0
            ? s.shippingCarriers
            : DEFAULT_SHIPPING_CARRIERS,
          paymentMethods: Array.isArray(s.paymentMethods) && s.paymentMethods.length > 0
            ? s.paymentMethods
            : INITIAL_SETTINGS.paymentMethods,
          homepageContent: {
            ...DEFAULT_HOMEPAGE_CONTENT,
            ...(s.homepageContent || {})
          }
        };
      } else if (!error && !data) {
        await autoSeedSupabase(supabase);
        return INITIAL_SETTINGS;
      }
    } catch (err) {
      console.warn('Supabase settings fetch failed:', err);
    }
  }
  const local = readJsonFile<StoreSettings>(SETTINGS_FILE, INITIAL_SETTINGS);
  return {
    ...INITIAL_SETTINGS,
    ...local,
    shippingCarriers: Array.isArray(local.shippingCarriers) && local.shippingCarriers.length > 0
      ? local.shippingCarriers
      : DEFAULT_SHIPPING_CARRIERS,
    paymentMethods: Array.isArray(local.paymentMethods) && local.paymentMethods.length > 0
      ? local.paymentMethods
      : INITIAL_SETTINGS.paymentMethods,
    homepageContent: {
      ...DEFAULT_HOMEPAGE_CONTENT,
      ...(local.homepageContent || {})
    }
  };
}

export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const merged: StoreSettings = {
    ...current,
    ...updates,
    homepageContent: {
      ...(current.homepageContent || DEFAULT_HOMEPAGE_CONTENT),
      ...(updates.homepageContent || {}),
    },
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('store_settings').upsert({
        id: 'default',
        data: merged,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) {
        console.error('Supabase updateStoreSettings error:', error);
      }
    } catch (err) {
      console.error('Failed to update settings in Supabase:', err);
    }
  }

  writeJsonFile(SETTINGS_FILE, merged);

  // Cross-sync heroMainImage to strava-media if hero image was changed
  if (updates.homepageContent?.heroMainImage) {
    try {
      const currentMedia = await getStravaMediaConfig();
      if (currentMedia.heroImage !== updates.homepageContent.heroMainImage) {
        const updatedMedia: StravaMediaConfig = {
          ...currentMedia,
          heroImage: updates.homepageContent.heroMainImage,
          updatedAt: new Date().toISOString(),
        };
        writeJsonFile(STRAVA_MEDIA_FILE, updatedMedia);
        if (supabase) {
          await supabase.from('store_settings').upsert({
            id: 'strava_media',
            data: updatedMedia,
            updated_at: updatedMedia.updatedAt,
          }, { onConflict: 'id' });
        }
      }
    } catch (syncErr) {
      console.warn('Notice cross-syncing heroMainImage to strava-media:', syncErr);
    }
  }

  return merged;
}

// ---------------- JOURNAL / BLOG ---------------- //

export async function getJournalArticles(): Promise<JournalArticle[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('journal_articles').select('*').order('published_at', { ascending: false });
      if (!error) {
        if (data && data.length > 0) {
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
        } else {
          await autoSeedSupabase(supabase);
          return INITIAL_JOURNAL;
        }
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

export async function createJournalArticle(articleData: Omit<JournalArticle, 'id' | 'publishedAt'>): Promise<JournalArticle> {
  const id = `art-${Date.now()}`;
  const now = new Date().toISOString();
  const newArticle: JournalArticle = {
    ...articleData,
    id,
    publishedAt: now,
  };

  const list = readJsonFile<JournalArticle[]>(JOURNAL_FILE, INITIAL_JOURNAL);
  list.unshift(newArticle);
  writeJsonFile(JOURNAL_FILE, list);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('journal_articles').insert([{
        id: newArticle.id,
        slug: newArticle.slug,
        title: newArticle.title,
        excerpt: newArticle.excerpt,
        content: newArticle.content,
        cover_image: newArticle.coverImage,
        author: newArticle.author,
        status: newArticle.status,
        published_at: newArticle.publishedAt
      }]);
    } catch (err) {
      console.error('Failed to insert journal article into Supabase:', err);
    }
  }

  return newArticle;
}

export async function deleteJournalArticle(id: string): Promise<boolean> {
  const list = readJsonFile<JournalArticle[]>(JOURNAL_FILE, INITIAL_JOURNAL);
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length === list.length) return false;
  writeJsonFile(JOURNAL_FILE, filtered);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('journal_articles').delete().eq('id', id);
    } catch (err) {
      console.error('Failed to delete journal article in Supabase:', err);
    }
  }

  return true;
}

// ---------------- STRAVA PRE-ORDERS & PRODUCTION QUEUE ---------------- //

function maskCustomerName(name: string): string {
  if (!name) return 'Pelari';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].length > 2 ? `${parts[0].slice(0, 2)}***` : `${parts[0]}*`;
  }
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

function maskOrderId(orderId: string): string {
  if (!orderId) return 'WSI-****';
  const parts = orderId.split('-');
  if (parts.length >= 3) {
    return `${parts[0]}-${parts[1]}-****`;
  }
  return `${orderId.slice(0, Math.min(6, orderId.length))}****`;
}

export async function getStravaOrders(): Promise<StravaPreOrder[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('strava_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data
          .filter((o: any) => !o.is_example && !String(o.id).includes('EXAMPLE') && !String(o.order_number || '').includes('EXAMPLE'))
          .map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number,
            productType: 'keychain-strava',
            variationId: o.variation_id,
            variationName: o.variation_name,
            qty: Number(o.payment_details?.qty ?? o.production?.qty ?? 1),
            unitPrice: o.payment_details?.unitPrice !== undefined ? Number(o.payment_details.unitPrice) : Number(o.price),
            dpPaid: o.payment_details?.dpPaid !== undefined ? Number(o.payment_details.dpPaid) : 0,
            remainingBalance: o.payment_details?.remainingBalance !== undefined ? Number(o.payment_details.remainingBalance) : 0,
            paymentStatus: o.payment_details?.paymentStatus || (o.status === 'Menunggu Pembayaran' ? 'Belum Bayar' : 'Lunas'),
            channel: o.payment_details?.channel || 'Direct TF',
            shippingCourier: o.production?.courier || o.production?.courierName || '',
            trackingNumber: o.production?.trackingNumber || o.production?.resiNumber || '',
            shippedAt: o.production?.shippedAt || o.production?.shippingDate || '',
            estimatedCompletionDate: o.production?.estimatedCompletionDate || '',
            invoiceNo: o.payment_details?.invoiceNo || o.payment_details?.invoiceId || '',
            needsAdminConfirmation: Boolean(o.payment_details?.needsAdminConfirmation || o.variation_id === 'unconfirmed' || String(o.variation_name || '').toLowerCase().includes('belum dikonfirmasi')),
            customer: o.customer,
            price: Number(o.price),
            subtotal: Number(o.subtotal),
            shippingFee: Number(o.shipping_fee || 0),
            shippingRegion: o.shipping_region || o.payment_details?.shippingRegion || undefined,
            total: Number(o.total),
            status: o.status,
            paymentMethod: o.payment_method,
            paymentVerified: Boolean(o.payment_verified || o.payment_details?.paymentVerified),
            paymentVerifiedAt: o.payment_verified_at || o.payment_details?.paymentVerifiedAt || undefined,
            clickyFee: o.clicky_fee ? Number(o.clicky_fee) : o.payment_details?.clickyFee ? Number(o.payment_details.clickyFee) : undefined,
            paymentDetails: o.payment_details,
            stravaData: o.strava_data,
            production: o.production,
            isExample: Boolean(o.is_example),
            createdAt: o.created_at,
            updatedAt: o.updated_at,
          }));
      }
    } catch (err) {
      console.warn('Supabase strava_orders fetch failed, using json:', err);
    }
  }

  const localList = readJsonFile<StravaPreOrder[]>(STRAVA_ORDERS_FILE, []);
  return localList
    .filter((o) => !o.isExample && !String(o.id).includes('EXAMPLE') && !String(o.orderNumber || '').includes('EXAMPLE'))
    .map((o) => ({
      ...o,
      qty: Number(o.qty ?? o.paymentDetails?.qty ?? o.production?.qty ?? 1),
      unitPrice: o.unitPrice !== undefined ? Number(o.unitPrice) : (o.price !== undefined ? Number(o.price) : 0),
      dpPaid: o.dpPaid !== undefined ? Number(o.dpPaid) : (o.paymentDetails?.dpPaid !== undefined ? Number(o.paymentDetails.dpPaid) : 0),
      remainingBalance: o.remainingBalance !== undefined ? Number(o.remainingBalance) : (o.paymentDetails?.remainingBalance !== undefined ? Number(o.paymentDetails.remainingBalance) : 0),
      paymentStatus: o.paymentStatus || o.paymentDetails?.paymentStatus || (o.status === 'Menunggu Pembayaran' ? 'Belum Bayar' : 'Lunas'),
      channel: o.channel || o.paymentDetails?.channel || 'Direct TF',
      shippingCourier: o.shippingCourier || o.production?.courier || o.production?.courierName || '',
      trackingNumber: o.trackingNumber || o.production?.trackingNumber || o.production?.resiNumber || '',
      shippedAt: o.shippedAt || o.production?.shippedAt || o.production?.shippingDate || '',
      estimatedCompletionDate: o.estimatedCompletionDate || o.production?.estimatedCompletionDate || '',
      invoiceNo: o.invoiceNo || o.paymentDetails?.invoiceNo || o.paymentDetails?.invoiceId || '',
      needsAdminConfirmation: Boolean(o.needsAdminConfirmation || o.paymentDetails?.needsAdminConfirmation || o.variationId === 'unconfirmed' || String(o.variationName || '').toLowerCase().includes('belum dikonfirmasi')),
    }));
}

export async function getStravaOrderById(id: string): Promise<StravaPreOrder | undefined> {
  if (!id) return undefined;
  const orders = await getStravaOrders();
  const clean = id.trim().replace(/^#/, '').toLowerCase();
  return orders.find((o) => {
    const oId = (o.id || '').trim().replace(/^#/, '').toLowerCase();
    const oNum = (o.orderNumber || '').trim().replace(/^#/, '').toLowerCase();
    return oId === clean || oNum === clean;
  });
}

export async function createStravaOrder(order: StravaPreOrder): Promise<StravaPreOrder> {
  const now = new Date().toISOString();
  const qty = Number(order.qty ?? order.paymentDetails?.qty ?? order.production?.qty ?? 1);
  const unitPrice = order.unitPrice !== undefined ? Number(order.unitPrice) : (order.price !== undefined ? Number(order.price) : 0);
  const total = order.total !== undefined ? Number(order.total) : (qty * unitPrice);
  const dpPaid = order.dpPaid !== undefined ? Number(order.dpPaid) : (order.paymentDetails?.dpPaid !== undefined ? Number(order.paymentDetails.dpPaid) : (order.paymentStatus === 'Lunas' || order.status === 'Selesai' ? total : 0));
  const remainingBalance = order.remainingBalance !== undefined ? Number(order.remainingBalance) : Math.max(0, total - dpPaid);
  const paymentStatus = order.paymentStatus || order.paymentDetails?.paymentStatus || (order.status === 'Menunggu Pembayaran' ? 'Belum Bayar' : 'Lunas');
  const channel = order.channel || order.paymentDetails?.channel || 'Direct TF';
  const shippingCourier = order.shippingCourier || order.production?.courier || order.production?.courierName || '';
  const trackingNumber = order.trackingNumber || order.production?.trackingNumber || order.production?.resiNumber || '';
  const shippedAt = order.shippedAt || order.production?.shippedAt || order.production?.shippingDate || '';
  const estimatedCompletionDate = order.estimatedCompletionDate || order.production?.estimatedCompletionDate || '';
  const invoiceNo = order.invoiceNo || order.paymentDetails?.invoiceNo || order.paymentDetails?.invoiceId || '';
  const needsAdminConfirmation = Boolean(
    order.needsAdminConfirmation || 
    order.variationId === 'unconfirmed' || 
    String(order.variationName || '').toLowerCase().includes('belum dikonfirmasi')
  );

  const enrichedPaymentDetails = {
    ...(order.paymentDetails || {}),
    shippingRegion: order.shippingRegion,
    paymentVerified: order.paymentVerified || false,
    paymentVerifiedAt: order.paymentVerifiedAt || null,
    clickyFee: order.clickyFee || null,
    paymentStatus,
    dpPaid,
    remainingBalance,
    unitPrice,
    qty,
    channel,
    invoiceId: invoiceNo,
    invoiceNo,
    needsAdminConfirmation,
  };

  const enrichedProduction = {
    ...(order.production || {}),
    qty,
    courier: shippingCourier,
    courierName: shippingCourier,
    resiNumber: trackingNumber,
    trackingNumber,
    shippingDate: shippedAt,
    shippedAt,
    estimatedCompletionDate,
  };

  const newOrder: StravaPreOrder = {
    ...order,
    qty,
    unitPrice,
    dpPaid,
    remainingBalance,
    paymentStatus,
    channel,
    shippingCourier,
    trackingNumber,
    shippedAt,
    estimatedCompletionDate,
    invoiceNo,
    needsAdminConfirmation,
    price: unitPrice,
    subtotal: total,
    total,
    paymentDetails: enrichedPaymentDetails,
    production: enrichedProduction,
    createdAt: order.createdAt || now,
    updatedAt: now,
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('strava_orders').insert([{
        id: newOrder.id,
        order_number: newOrder.orderNumber,
        product_type: newOrder.productType,
        variation_id: newOrder.variationId,
        variation_name: newOrder.variationName,
        customer: newOrder.customer,
        price: newOrder.price,
        subtotal: newOrder.subtotal,
        shipping_fee: newOrder.shippingFee,
        shipping_region: newOrder.shippingRegion || null,
        total: newOrder.total,
        status: newOrder.status,
        payment_method: newOrder.paymentMethod,
        payment_verified: Boolean(newOrder.paymentVerified),
        payment_verified_at: newOrder.paymentVerifiedAt || null,
        clicky_fee: newOrder.clickyFee || 0,
        payment_details: enrichedPaymentDetails,
        strava_data: newOrder.stravaData || null,
        production: enrichedProduction,
        is_example: Boolean(newOrder.isExample),
        created_at: newOrder.createdAt,
        updated_at: newOrder.updatedAt,
      }]);
    } catch (err) {
      console.error('Failed to insert strava order into Supabase:', err);
    }
  }

  const list = readJsonFile<StravaPreOrder[]>(STRAVA_ORDERS_FILE, []);
  const existingIdx = list.findIndex((o) => o.id === newOrder.id);
  if (existingIdx >= 0) {
    list[existingIdx] = newOrder;
  } else {
    list.unshift(newOrder);
  }
  writeJsonFile(STRAVA_ORDERS_FILE, list);
  return newOrder;
}

export async function updateStravaOrderStatus(
  id: string,
  status: StravaOrderStatus,
  updates?: Partial<StravaPreOrder>,
  bypassGuards: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const current = await getStravaOrderById(id);
  if (!current) {
    return { success: false, error: 'Pesanan tidak ditemukan' };
  }

  // GUARD: Produksi (status 5) TIDAK BOLEH mulai sampai SEMUA terpenuhi (kecuali diizinkan admin):
  // 1. Pembayaran terverifikasi (Clicky verified atau Mayar sudah bayar)
  // 2. Form sudah disubmit (stravaData + stravaUrl)
  // 3. Desain dikonfirmasi admin (status 'Desain Dikonfirmasi' atau production.confirmedAt)
  if (status === 'Produksi' && !bypassGuards) {
    const isPaid = current.paymentVerified || 
      (current.paymentMethod !== 'Clicky' && current.status !== 'Menunggu Pembayaran');
    if (!isPaid) {
      return {
        success: false,
        error: 'Tidak dapat memulai produksi: Pembayaran belum diverifikasi admin. Silakan verifikasi pembayaran terlebih dahulu.',
      };
    }
    if (!current.stravaData || !current.stravaData.stravaUrl || current.status === 'Dibayar — Data Belum Lengkap' || current.status === 'Baru') {
      return {
        success: false,
        error: 'Tidak dapat memulai produksi: Form data Strava belum disubmit oleh pembeli.',
      };
    }
    if (current.status !== 'Desain Dikonfirmasi' && !current.production?.confirmedAt && !updates?.production?.confirmedAt) {
      return {
        success: false,
        error: 'Tidak dapat memulai produksi: Desain 3D belum dikonfirmasi bersama pembeli.',
      };
    }
  }

  const now = new Date().toISOString();
  const qty = updates?.qty !== undefined ? Number(updates.qty) : (current.qty ?? 1);
  const unitPrice = updates?.unitPrice !== undefined ? Number(updates.unitPrice) : (updates?.price !== undefined ? Number(updates.price) : current.unitPrice ?? current.price);
  const total = updates?.total !== undefined ? Number(updates.total) : (qty * unitPrice);
  const dpPaid = updates?.dpPaid !== undefined ? Number(updates.dpPaid) : (current.dpPaid ?? 0);
  const remainingBalance = updates?.remainingBalance !== undefined ? Number(updates.remainingBalance) : Math.max(0, total - dpPaid);
  const paymentStatus = updates?.paymentStatus || current.paymentStatus || 'Belum Bayar';
  const channel = updates?.channel || current.channel || 'Direct TF';
  const shippingCourier = updates?.shippingCourier || current.shippingCourier || '';
  const trackingNumber = updates?.trackingNumber || current.trackingNumber || '';
  const shippedAt = updates?.shippedAt || current.shippedAt || '';
  const estimatedCompletionDate = updates?.estimatedCompletionDate || current.estimatedCompletionDate || '';
  const invoiceNo = updates?.invoiceNo || current.invoiceNo || '';
  const needsAdminConfirmation = updates?.needsAdminConfirmation !== undefined ? updates.needsAdminConfirmation : current.needsAdminConfirmation;

  const mergedPaymentDetails = {
    ...(current.paymentDetails || {}),
    ...(updates?.paymentDetails || {}),
    paymentStatus,
    dpPaid,
    remainingBalance,
    unitPrice,
    qty,
    channel,
    invoiceId: invoiceNo,
    invoiceNo,
    needsAdminConfirmation,
  };

  const mergedProduction = {
    ...(current.production || {}),
    ...(updates?.production || {}),
    qty,
    courier: shippingCourier,
    courierName: shippingCourier,
    resiNumber: trackingNumber,
    trackingNumber,
    shippingDate: shippedAt,
    shippedAt,
    estimatedCompletionDate,
  };

  const updated: StravaPreOrder = {
    ...current,
    ...updates,
    status,
    qty,
    unitPrice,
    price: unitPrice,
    subtotal: total,
    total,
    dpPaid,
    remainingBalance,
    paymentStatus,
    channel,
    shippingCourier,
    trackingNumber,
    shippedAt,
    estimatedCompletionDate,
    invoiceNo,
    needsAdminConfirmation,
    customer: {
      ...current.customer,
      ...(updates?.customer || {}),
    },
    stravaData: updates?.stravaData
      ? {
          ...(current.stravaData || {}),
          ...updates.stravaData,
        }
      : current.stravaData,
    production: mergedProduction,
    paymentDetails: mergedPaymentDetails,
    updatedAt: now,
  };

  const list = readJsonFile<StravaPreOrder[]>(STRAVA_ORDERS_FILE, []);
  const index = list.findIndex((o) => o.id === current.id || o.orderNumber === current.id);
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.unshift(updated);
  }
  writeJsonFile(STRAVA_ORDERS_FILE, list);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase
        .from('strava_orders')
        .update({
          status: updated.status,
          customer: updated.customer,
          variation_name: updated.variationName,
          variation_id: updated.variationId,
          price: updated.price,
          subtotal: updated.subtotal,
          shipping_fee: updated.shippingFee,
          total: updated.total,
          payment_verified: updated.paymentVerified,
          payment_verified_at: updated.paymentVerifiedAt,
          payment_details: updated.paymentDetails,
          strava_data: updated.stravaData,
          production: updated.production,
          updated_at: now,
        })
        .or(`id.eq.${current.id},order_number.eq.${current.id}`);
    } catch (err) {
      console.error('Failed to update strava order in Supabase:', err);
    }
  }

  return { success: true };
}

export async function verifyClickyOrderPayment(
  id: string,
  adminNotes?: string
): Promise<{ success: boolean; order?: StravaPreOrder; error?: string }> {
  const current = await getStravaOrderById(id);
  if (!current) {
    return { success: false, error: 'Pesanan tidak ditemukan' };
  }

  const now = new Date().toISOString();

  // If customer has already submitted Strava data, advance to review desain; otherwise 'Dibayar — Data Belum Lengkap'
  const nextStatus: StravaOrderStatus = current.stravaData?.stravaUrl
    ? 'Data Diterima — Menunggu Konfirmasi Desain'
    : 'Dibayar — Data Belum Lengkap';

  const updated: StravaPreOrder = {
    ...current,
    status: current.status === 'Menunggu Pembayaran' ? nextStatus : current.status,
    paymentVerified: true,
    paymentVerifiedAt: now,
    paymentDetails: {
      ...(current.paymentDetails || {}),
      paidAt: now,
      channel: 'Clicky',
      paymentVerified: true,
      paymentVerifiedAt: now,
    },
    production: {
      ...(current.production || {}),
      adminNotes: adminNotes || current.production?.adminNotes,
    },
    updatedAt: now,
  };

  const list = readJsonFile<StravaPreOrder[]>(STRAVA_ORDERS_FILE, []);
  const index = list.findIndex((o) => o.id === current.id || o.orderNumber === current.id);
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.unshift(updated);
  }
  writeJsonFile(STRAVA_ORDERS_FILE, list);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase
        .from('strava_orders')
        .update({
          status: updated.status,
          payment_verified: true,
          payment_verified_at: now,
          payment_details: updated.paymentDetails,
          production: updated.production,
          updated_at: now,
        })
        .or(`id.eq.${current.id},order_number.eq.${current.id}`);
    } catch (err) {
      console.error('Failed to update payment verification in Supabase:', err);
    }
  }

  return { success: true, order: updated };
}

export async function saveStravaCustomerData(
  orderId: string,
  data: StravaCustomData
): Promise<{ success: boolean; error?: string }> {
  const current = await getStravaOrderById(orderId);
  if (!current) {
    return { success: false, error: 'Order ID tidak ditemukan' };
  }

  const now = new Date().toISOString();

  const updated: StravaPreOrder = {
    ...current,
    stravaData: {
      ...data,
      submittedAt: now,
    },
    // Transition status to Data Diterima
    status: 'Data Diterima — Menunggu Konfirmasi Desain',
    updatedAt: now,
  };

  const list = readJsonFile<StravaPreOrder[]>(STRAVA_ORDERS_FILE, []);
  const index = list.findIndex((o) => o.id === current.id || o.orderNumber === current.id);
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.unshift(updated);
  }
  writeJsonFile(STRAVA_ORDERS_FILE, list);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase
        .from('strava_orders')
        .update({
          strava_data: updated.stravaData,
          status: updated.status,
          updated_at: now,
        })
        .or(`id.eq.${current.id},order_number.eq.${current.id}`);
    } catch (err) {
      console.error('Failed to save strava data to Supabase:', err);
    }
  }

  return { success: true };
}

export async function deleteStravaOrder(id: string): Promise<boolean> {
  let deletedFromSupabase = false;
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('strava_orders')
        .delete()
        .or(`id.eq.${id},order_number.eq.${id}`);
      if (!error) deletedFromSupabase = true;
    } catch (err) {
      console.error('Failed to delete strava order in Supabase:', err);
    }
  }

  const list = readJsonFile<StravaPreOrder[]>(STRAVA_ORDERS_FILE, []);
  const filtered = list.filter((o) => o.id !== id && o.orderNumber !== id);
  const deletedFromLocal = filtered.length !== list.length;
  if (deletedFromLocal) {
    writeJsonFile(STRAVA_ORDERS_FILE, filtered);
  }
  return deletedFromLocal || deletedFromSupabase;
}

export async function clearExampleStravaOrders(): Promise<number> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('strava_orders').delete().or('is_example.eq.true,id.ilike.%EXAMPLE%,order_number.ilike.%EXAMPLE%');
    } catch (err) {
      console.error('Failed to delete example strava orders in Supabase:', err);
    }
  }

  const list = readJsonFile<StravaPreOrder[]>(STRAVA_ORDERS_FILE, []);
  const realOrders = list.filter((o) => !o.isExample && !o.id.includes('EXAMPLE') && !o.orderNumber?.includes('EXAMPLE'));
  const removedCount = list.length - realOrders.length;
  writeJsonFile(STRAVA_ORDERS_FILE, realOrders);
  return removedCount;
}

export async function getQueueSettings(): Promise<QueueSettings> {
  const fallback = DEFAULT_QUEUE_SETTINGS;
  const stored = readJsonFile<QueueSettings>(QUEUE_SETTINGS_FILE, fallback);
  return {
    ...fallback,
    ...(stored || {}),
    stageLabels: {
      ...DEFAULT_STAGE_LABELS,
      ...(stored?.stageLabels || {}),
    },
  };
}

export async function updateQueueSettings(settings: Partial<QueueSettings>): Promise<boolean> {
  const current = await getQueueSettings();
  const updated: QueueSettings = {
    ...current,
    ...settings,
    stageLabels: {
      ...(current.stageLabels || DEFAULT_STAGE_LABELS),
      ...(settings.stageLabels || {}),
    },
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile(QUEUE_SETTINGS_FILE, updated);
  return true;
}

export function computeEstimatedCompletion(
  order: StravaPreOrder,
  settings: QueueSettings,
  queuePos: number
): string {
  if (order.production?.estimatedCompletionDate) {
    return order.production.estimatedCompletionDate;
  }
  const baseDate = order.production?.confirmedAt
    ? new Date(order.production.confirmedAt)
    : order.stravaData?.submittedAt
    ? new Date(order.stravaData.submittedAt)
    : new Date();
  const lead = Number(order.production?.estimatedDays || settings.defaultLeadDays || 7);
  const queueOffset = Math.max(0, queuePos - 1);
  baseDate.setDate(baseDate.getDate() + lead + queueOffset);
  return baseDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export async function getPublicProductionQueue(): Promise<{
  queue: PublicQueueItem[];
  stats: {
    inQueue: number;
    inProduction: number;
    totalCompleted: number;
    avgLeadDays: number;
    defaultEstimatedDate: string;
    customNote: string;
    settings: QueueSettings;
  };
}> {
  const orders = await getStravaOrders();
  const settings = await getQueueSettings();

  const activeStatuses: StravaOrderStatus[] = [
    'Data Diterima — Menunggu Konfirmasi Desain',
    'Desain Dikonfirmasi',
    'Produksi',
    'QC / Finishing',
    'Packing',
  ];

  const activeOrders = orders.filter((o) => activeStatuses.includes(o.status));
  const inProductionCount = orders.filter((o) => o.status === 'Produksi').length;
  const completedCount = orders.filter((o) => o.status === 'Selesai' || o.status === 'Dikirim').length;

  const estDate = new Date();
  estDate.setDate(estDate.getDate() + (settings.defaultLeadDays || 7));
  const estFormatted = estDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const rank: Record<StravaOrderStatus, number> = {
    'Produksi': 1,
    'QC / Finishing': 2,
    'Packing': 3,
    'Antri Produksi': 4,
    'Desain Dikonfirmasi': 5,
    'Data Diterima — Menunggu Konfirmasi Desain': 6,
    'Dibayar — Data Belum Lengkap': 7,
    'Menunggu Pembayaran': 8,
    'Baru': 9,
    'Siap Kirim': 10,
    'Dikirim': 11,
    'Selesai': 12,
    'Batal': 13,
  };

  const sortedActive = [...activeOrders].sort(
    (a, b) => (rank[a.status] || 99) - (rank[b.status] || 99)
  );

  // Anonymized queue list (NEVER expose phone, email, address, stravaUrl, images!)
  const queue: PublicQueueItem[] = sortedActive.map((o, index) => {
    const pos = o.production?.queuePosition || index + 1;
    return {
      id: maskOrderId(o.id),
      maskedName: maskCustomerName(o.customer?.fullName),
      variationName: o.variationName,
      status: o.status,
      queuePosition: pos,
      estimatedDate: computeEstimatedCompletion(o, settings, pos),
      isExample: Boolean(o.isExample),
      createdAt: o.createdAt,
    };
  });

  return {
    queue,
    stats: {
      inQueue: activeOrders.length,
      inProduction: inProductionCount,
      totalCompleted: completedCount,
      avgLeadDays: settings.defaultLeadDays,
      defaultEstimatedDate: `${settings.defaultLeadDays} hari kerja (${estFormatted})`,
      customNote: settings.customLeadNote,
      settings,
    },
  };
}

// ---------------- COMING SOON NOTIFY LIST ---------------- //

export async function getNotifyList(): Promise<NotifyListEntry[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notify_list')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          whatsapp: item.whatsapp,
          product: item.product,
          categoryGroup: item.category_group,
          createdAt: item.created_at,
        }));
      }
    } catch {}
  }
  return readJsonFile<NotifyListEntry[]>(NOTIFY_LIST_FILE, []);
}

export async function addNotifyListEntry(
  entry: Omit<NotifyListEntry, 'id' | 'createdAt'>
): Promise<NotifyListEntry> {
  const now = new Date().toISOString();
  const id = `ntf-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const newEntry: NotifyListEntry = {
    ...entry,
    id,
    createdAt: now,
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('notify_list').insert([
        {
          id: newEntry.id,
          name: newEntry.name,
          whatsapp: newEntry.whatsapp,
          product: newEntry.product,
          category_group: newEntry.categoryGroup,
          created_at: newEntry.createdAt,
        },
      ]);
    } catch {}
  }

  const list = readJsonFile<NotifyListEntry[]>(NOTIFY_LIST_FILE, []);
  list.unshift(newEntry);
  writeJsonFile(NOTIFY_LIST_FILE, list);
  return newEntry;
}

// ---------------- STRAVA KEYCHAIN MEDIA & YOUTUBE CONFIG ---------------- //

export function getDefaultStravaMediaConfig(): StravaMediaConfig {
  const variationImages: Record<string, string> = {};
  const variationPrices: Record<string, number> = {};
  for (const v of STRAVA_PRODUCT_CONFIG.variations) {
    if (v.image) variationImages[v.id] = v.image;
    variationPrices[v.id] = v.price;
  }

  return {
    heroImage: '/images/strava-keychain/keychain-04.jpg',
    variationImages,
    variationPrices,
    customVariations: STRAVA_PRODUCT_CONFIG.variations,
    gallery: STRAVA_PRODUCT_CONFIG.gallery.map((g) => ({
      id: g.id,
      type: g.type,
      title: g.title,
      caption: g.caption,
      src: g.src,
      badge: 'badge' in g ? g.badge : undefined,
      highlightBadge: 'highlightBadge' in g ? g.highlightBadge : undefined,
      videoFormat: g.type === 'video' ? 'auto' : undefined,
      aspectRatio: g.type === 'video' ? 'auto' : '1:1',
      isTodo: 'isTodo' in g ? Boolean(g.isTodo) : false,
      todoLabel: 'todoLabel' in g ? g.todoLabel : undefined,
    })),
    updatedAt: new Date().toISOString(),
  };
}

export async function getStravaMediaConfig(): Promise<StravaMediaConfig> {
  const fallback = getDefaultStravaMediaConfig();
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('data')
        .eq('id', 'strava_media')
        .single();
      if (!error && data?.data) {
        return {
          ...fallback,
          ...(data.data as Partial<StravaMediaConfig>),
          customVariations: (data.data as any)?.customVariations || fallback.customVariations,
          variationPrices: {
            ...fallback.variationPrices,
            ...((data.data as any)?.variationPrices || {}),
          },
        };
      }
    } catch {}
  }
  return readJsonFile<StravaMediaConfig>(STRAVA_MEDIA_FILE, fallback);
}

export async function getStravaVariations(): Promise<StravaVariation[]> {
  const config = await getStravaMediaConfig();
  const baseList = (config.customVariations && config.customVariations.length > 0)
    ? config.customVariations
    : STRAVA_PRODUCT_CONFIG.variations;

  return baseList.map((v) => ({
    ...v,
    price:
      config.variationPrices?.[v.id] !== undefined && Number(config.variationPrices[v.id]) > 0
        ? Number(config.variationPrices[v.id])
        : v.price,
    image: config.variationImages?.[v.id] || v.image,
  }));
}

export async function updateStravaMediaConfig(
  updates: Partial<StravaMediaConfig>
): Promise<StravaMediaConfig> {
  const current = await getStravaMediaConfig();
  const updated: StravaMediaConfig = {
    ...current,
    ...updates,
    customVariations: updates.customVariations !== undefined ? updates.customVariations : (current.customVariations || STRAVA_PRODUCT_CONFIG.variations),
    variationImages: {
      ...(current.variationImages || {}),
      ...(updates.variationImages || {}),
    },
    variationPrices: {
      ...(current.variationPrices || {}),
      ...(updates.variationPrices || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(STRAVA_MEDIA_FILE, updated);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('store_settings').upsert({
        id: 'strava_media',
        data: updated,
        updated_at: updated.updatedAt,
      }, { onConflict: 'id' });
      if (error) {
        console.error('Supabase updateStravaMediaConfig error:', error);
      }
    } catch (err) {
      console.error('Failed to persist strava_media to Supabase:', err);
    }
  }

  // Cross-sync heroImage to store settings if heroImage was changed
  if (updates.heroImage) {
    try {
      const currentSettings = await getStoreSettings();
      if (currentSettings.homepageContent?.heroMainImage !== updates.heroImage) {
        const mergedSettings: StoreSettings = {
          ...currentSettings,
          homepageContent: {
            ...(currentSettings.homepageContent || DEFAULT_HOMEPAGE_CONTENT),
            heroMainImage: updates.heroImage,
          },
        };
        writeJsonFile(SETTINGS_FILE, mergedSettings);
        if (supabase) {
          await supabase.from('store_settings').upsert({
            id: 'default',
            data: mergedSettings,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        }
      }
    } catch (syncErr) {
      console.warn('Notice cross-syncing heroImage to store settings:', syncErr);
    }
  }

  return updated;
}

// ---------------- DYNAMIC SUPABASE CONFIGURATION ---------------- //

export function getStoredSupabaseConfig(): SupabaseConfigData {
  const fallback: SupabaseConfigData = {
    url: '',
    anonKey: '',
    serviceRoleKey: '',
  };
  return readJsonFile<SupabaseConfigData>(SUPABASE_CONFIG_FILE, fallback);
}

export function saveStoredSupabaseConfig(config: Partial<SupabaseConfigData>): boolean {
  const current = getStoredSupabaseConfig();
  const updated: SupabaseConfigData = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile(SUPABASE_CONFIG_FILE, updated);
  return true;
}

// ---------------- PRODUCTION BATCHES & SCHEDULING ---------------- //

export async function getProductionBatches(): Promise<ProductionBatch[]> {
  const batches = readJsonFile<ProductionBatch[]>(BATCHES_FILE, []);
  if (!batches || batches.length === 0) {
    const defaultBatch: ProductionBatch = {
      id: 'BATCH-DEFAULT-1',
      name: 'Batch 1 — Reguler',
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'IN_PROGRESS',
      notes: 'Batch antrian produksi aktif',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeJsonFile(BATCHES_FILE, [defaultBatch]);
    return [defaultBatch];
  }
  return batches;
}

export async function createProductionBatch(data: {
  name: string;
  scheduledDate?: string;
  notes?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}): Promise<ProductionBatch> {
  const now = new Date().toISOString();
  const newBatch: ProductionBatch = {
    id: `BATCH-${Date.now().toString(36).toUpperCase()}`,
    name: data.name.trim(),
    scheduledDate: data.scheduledDate || now.split('T')[0],
    status: data.status || 'PLANNED',
    notes: data.notes?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };

  const list = readJsonFile<ProductionBatch[]>(BATCHES_FILE, []);
  list.unshift(newBatch);
  writeJsonFile(BATCHES_FILE, list);
  return newBatch;
}

export async function updateProductionBatch(
  id: string,
  updates: Partial<ProductionBatch>
): Promise<ProductionBatch | null> {
  const list = readJsonFile<ProductionBatch[]>(BATCHES_FILE, []);
  const index = list.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updated: ProductionBatch = {
    ...list[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  list[index] = updated;
  writeJsonFile(BATCHES_FILE, list);
  return updated;
}

export async function deleteProductionBatch(id: string): Promise<boolean> {
  const list = readJsonFile<ProductionBatch[]>(BATCHES_FILE, []);
  const filtered = list.filter((b) => b.id !== id);
  if (filtered.length === list.length) return false;
  writeJsonFile(BATCHES_FILE, filtered);
  return true;
}

export async function batchImportStravaOrders(
  ordersToImport: Array<Partial<StravaPreOrder>>
): Promise<{ count: number; skippedCount: number; imported: StravaPreOrder[] }> {
  const existingOrders = await getStravaOrders();
  const importedList: StravaPreOrder[] = [];
  let skippedCount = 0;

  for (const item of ordersToImport) {
    // Deduplication check
    const isDup = existingOrders.some((exist) => {
      // 1. Check Invoice / Clicky ID
      const candInvoice = (item.invoiceNo || item.paymentDetails?.invoiceId || item.paymentDetails?.invoiceNo || '').trim();
      const candNotes = (item.customer?.notes || item.stravaData?.adminNotes || item.production?.internalAdminNotes || '').toLowerCase();
      const existInvoice = (exist.invoiceNo || exist.paymentDetails?.invoiceId || exist.paymentDetails?.invoiceNo || '').trim();
      const existNotes = (exist.customer?.notes || exist.stravaData?.adminNotes || exist.production?.internalAdminNotes || '').toLowerCase();

      if (candInvoice && existInvoice && candInvoice.toLowerCase() === existInvoice.toLowerCase()) {
        return true;
      }

      // Check clicky regex in notes/invoice
      const clickyRegex = /[a-f0-9]{24}/i;
      const candClicky = (candInvoice + ' ' + candNotes).match(clickyRegex);
      const existClicky = (existInvoice + ' ' + existNotes).match(clickyRegex);
      if (candClicky && existClicky && candClicky[0].toLowerCase() === existClicky[0].toLowerCase()) {
        return true;
      }

      // 2. No. WA + Tanggal Order + Nama Pemesan
      const cleanPhone = (p?: string) => (p || '').replace(/\D/g, '').replace(/^0/, '62');
      const candPhone = cleanPhone(item.customer?.phone);
      const existPhone = cleanPhone(exist.customer?.phone);

      const cleanName = (n?: string) => (n || '').trim().toLowerCase();
      const candName = cleanName(item.customer?.fullName);
      const existName = cleanName(exist.customer?.fullName);

      const candDate = item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '';
      const existDate = exist.createdAt ? new Date(exist.createdAt).toISOString().split('T')[0] : '';

      if (candName && existName && candName === existName && candDate === existDate) {
        if (!candPhone || !existPhone || candPhone.includes('shopee') || existPhone.includes('shopee') || candPhone === existPhone) {
          return true;
        }
      }

      return false;
    });

    if (isDup) {
      skippedCount++;
      continue;
    }

    const now = new Date().toISOString();
    const orderId = item.id || item.orderNumber || `WSI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const qty = Number(item.qty ?? item.paymentDetails?.qty ?? item.production?.qty ?? 1);
    const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : (item.price !== undefined ? Number(item.price) : 0);
    const total = item.total !== undefined ? Number(item.total) : (qty * unitPrice);
    const dpPaid = item.dpPaid !== undefined ? Number(item.dpPaid) : (item.paymentDetails?.dpPaid !== undefined ? Number(item.paymentDetails.dpPaid) : 0);
    const remainingBalance = item.remainingBalance !== undefined ? Number(item.remainingBalance) : Math.max(0, total - dpPaid);
    const paymentStatus = item.paymentStatus || item.paymentDetails?.paymentStatus || (item.status === 'Menunggu Pembayaran' ? 'Belum Bayar' : 'Lunas');
    const channel = item.channel || item.paymentDetails?.channel || 'Direct TF';
    const shippingCourier = item.shippingCourier || item.production?.courier || item.production?.courierName || '';
    const trackingNumber = item.trackingNumber || item.production?.trackingNumber || item.production?.resiNumber || '';
    const shippedAt = item.shippedAt || item.production?.shippedAt || item.production?.shippingDate || '';
    const estimatedCompletionDate = item.estimatedCompletionDate || item.production?.estimatedCompletionDate || '';
    const invoiceNo = item.invoiceNo || item.paymentDetails?.invoiceNo || item.paymentDetails?.invoiceId || '';
    const needsAdminConfirmation = Boolean(
      item.needsAdminConfirmation || 
      item.variationId === 'unconfirmed' || 
      String(item.variationName || '').toLowerCase().includes('belum dikonfirmasi')
    );

    const newOrder: StravaPreOrder = {
      id: orderId,
      orderNumber: item.orderNumber || orderId,
      productType: 'keychain-strava',
      variationId: item.variationId || 'var-57x94',
      variationName: item.variationName || '5.7x9.4 cm',
      qty,
      unitPrice,
      price: unitPrice,
      subtotal: total,
      shippingFee: Number(item.shippingFee || 0),
      shippingRegion: item.shippingRegion,
      total,
      dpPaid,
      remainingBalance,
      paymentStatus,
      channel,
      shippingCourier,
      trackingNumber,
      shippedAt,
      estimatedCompletionDate,
      invoiceNo,
      needsAdminConfirmation,
      status: item.status || 'Desain Dikonfirmasi',
      paymentMethod: item.paymentMethod || 'Sheet Import / Transfer',
      paymentVerified: item.paymentVerified !== undefined ? item.paymentVerified : (paymentStatus === 'Lunas'),
      paymentVerifiedAt: item.paymentVerifiedAt || (paymentStatus === 'Lunas' ? now : null),
      customer: {
        fullName: item.customer?.fullName || 'Customer',
        phone: item.customer?.phone || '',
        email: item.customer?.email || `${(item.customer?.phone || 'cust').replace(/\D/g, '')}@sheet.import`,
        address: item.customer?.address || 'Alamat dari spreadsheet',
        city: item.customer?.city || 'Indonesia',
        postalCode: item.customer?.postalCode || '',
        notes: item.customer?.notes,
        shippingAddress: item.customer?.address,
      },
      paymentDetails: {
        channel,
        invoiceId: invoiceNo,
        invoiceNo,
        paidAt: paymentStatus === 'Lunas' ? (item.paymentDetails?.paidAt || now) : undefined,
        paymentStatus,
        unitPrice,
        qty,
        dpPaid,
        remainingBalance,
        needsAdminConfirmation,
        ...(item.paymentDetails || {}),
      },
      stravaData: item.stravaData ? {
        stravaUrl: item.stravaData.stravaUrl || '',
        images: item.stravaData.images || ['/images/strava-keychain/keychain-04.jpg'],
        eventName: item.stravaData.eventName || 'Custom Route Run',
        eventDate: item.stravaData.eventDate || now.split('T')[0],
        distance: item.stravaData.distance || '10.0 km',
        pace: item.stravaData.pace || 'Pace',
        duration: item.stravaData.duration || '00:55:00',
        engravedText: item.stravaData.engravedText || item.customer?.fullName || '',
        keychainName: item.stravaData.keychainName,
        routeColor: item.stravaData.routeColor,
        adminNotes: item.stravaData.adminNotes || '',
        submittedAt: item.stravaData.submittedAt || now,
      } : undefined,
      production: {
        batchName: item.production?.batchName || 'Batch 1 — Reguler',
        batchId: item.production?.batchId,
        scheduledDate: item.production?.scheduledDate || now.split('T')[0],
        assignedMachine: item.production?.assignedMachine || 'Bambu Lab X1C',
        internalAdminNotes: item.production?.internalAdminNotes || `Diimport dari spreadsheet. Invoice: ${invoiceNo || '-'}`,
        confirmedAt: now,
        qty,
        courier: shippingCourier,
        courierName: shippingCourier,
        resiNumber: trackingNumber,
        trackingNumber,
        shippingDate: shippedAt,
        shippedAt,
        estimatedCompletionDate,
        ...(item.production || {}),
      },
      isExample: false,
      createdAt: item.createdAt || now,
      updatedAt: now,
    };

    const saved = await createStravaOrder(newOrder);
    existingOrders.push(saved);
    importedList.push(saved);
  }

  return { count: importedList.length, skippedCount, imported: importedList };
}

// ---------------- INSPO ITEMS ---------------- //

export async function getInspoList(): Promise<InspoItem[]> {
  const items = readJsonFile<InspoItem[]>(INSPO_FILE, []);
  return items;
}

export async function createInspoItem(data: {
  url: string;
  notes: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  platform?: InspoItem['platform'];
  favicon?: string;
  siteName?: string;
}): Promise<InspoItem> {
  const now = new Date().toISOString();
  const id = `INSPO-${Date.now().toString(36).toUpperCase()}`;

  // Basic platform auto-detection
  let platform: InspoItem['platform'] = data.platform || 'web';
  const urlLower = data.url.toLowerCase();
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) platform = 'facebook';
  else if (urlLower.includes('threads.net')) platform = 'threads';
  else if (urlLower.includes('instagram.com')) platform = 'instagram';
  else if (urlLower.includes('tiktok.com')) platform = 'tiktok';
  else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) platform = 'youtube';
  else if (urlLower.includes('pinterest.com')) platform = 'pinterest';
  else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) platform = 'twitter';

  const newItem: InspoItem = {
    id,
    url: data.url.trim(),
    notes: data.notes.trim(),
    title: data.title?.trim() || `${platform.toUpperCase()} Inspo Idea`,
    description: data.description?.trim(),
    imageUrl: data.imageUrl,
    platform,
    favicon: data.favicon,
    siteName: data.siteName,
    status: 'IDEA',
    createdAt: now,
    updatedAt: now,
  };

  const list = readJsonFile<InspoItem[]>(INSPO_FILE, []);
  list.unshift(newItem);
  writeJsonFile(INSPO_FILE, list);
  return newItem;
}

export async function updateInspoItem(
  id: string,
  updates: Partial<InspoItem>
): Promise<InspoItem | null> {
  const list = readJsonFile<InspoItem[]>(INSPO_FILE, []);
  const index = list.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const updated: InspoItem = {
    ...list[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  list[index] = updated;
  writeJsonFile(INSPO_FILE, list);
  return updated;
}

export async function deleteInspoItem(id: string): Promise<boolean> {
  const list = readJsonFile<InspoItem[]>(INSPO_FILE, []);
  const filtered = list.filter((i) => i.id !== id);
  if (filtered.length === list.length) return false;
  writeJsonFile(INSPO_FILE, filtered);
  return true;
}





