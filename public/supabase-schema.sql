-- ==============================================================================
-- WHEREISIT? STUDIO - COMPLETE SUPABASE DATABASE SCHEMA MIGRATION
-- Project: WhereIsIt? 3D Objects & Design Studio (whereisit.design / whereisit-coral.vercel.app)
-- Generated: 17 November 2026
-- Compatible: Supabase PostgreSQL (Postgres 15+)
-- 
-- How to apply:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql
-- 2. Paste this entire SQL into the SQL Editor and click "Run" (▶).
-- 3. Copy your Project URL, anon key, and service_role key to your Admin Dashboard:
--    /admin/settings/database
-- ==============================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC,
  badge TEXT,
  description TEXT,
  short_description TEXT,
  materials TEXT,
  dimensions TEXT,
  weight TEXT,
  layer_resolution TEXT,
  color_options JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 10,
  status TEXT DEFAULT 'ACTIVE',
  rating NUMERIC DEFAULT 5.0,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- 2. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.collections (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  product_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);

-- 3. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  customer_type TEXT DEFAULT 'RETAIL',
  city TEXT,
  orders_count INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- 5. REGULAR STORE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  shipping_carrier TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'PENDING',
  order_status TEXT DEFAULT 'PROCESSING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);

-- 6. DRAFT ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.draft_orders (
  id TEXT PRIMARY KEY,
  draft_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'DRAFT',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ABANDONED CHECKOUTS TABLE
CREATE TABLE IF NOT EXISTS public.abandoned_checkouts (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL DEFAULT 0,
  recovery_status TEXT DEFAULT 'NOT_SENT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CUSTOM DESIGN INQUIRIES
CREATE TABLE IF NOT EXISTS public.custom_design_inquiries (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_budget TEXT,
  intended_use TEXT,
  reference_files JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CUSTOM CHARACTER INQUIRIES
CREATE TABLE IF NOT EXISTS public.custom_character_inquiries (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  character_type TEXT NOT NULL,
  style TEXT NOT NULL,
  plaque_text TEXT,
  photo_url TEXT,
  reference_notes TEXT,
  status TEXT DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  author TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'APPROVED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.product_reviews(product_id);

-- 11. JOURNAL ARTICLES
CREATE TABLE IF NOT EXISTS public.journal_articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author TEXT DEFAULT 'Studio Team',
  status TEXT DEFAULT 'PUBLISHED',
  published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_slug ON public.journal_articles(slug);

-- 12. DISCOUNTS
CREATE TABLE IF NOT EXISTS public.discounts (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  min_purchase NUMERIC,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts(code);

-- 13. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'SUBSCRIBED',
  source TEXT DEFAULT 'FOOTER',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. STRAVA 3D PRINT PRE-ORDERS TABLE (CORE FULFILLMENT & QUEUE)
CREATE TABLE IF NOT EXISTS public.strava_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  product_type TEXT DEFAULT 'keychain-strava',
  variation_id TEXT NOT NULL,
  variation_name TEXT NOT NULL,
  customer JSONB NOT NULL,
  price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details JSONB,
  strava_data JSONB,
  production JSONB,
  is_example BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strava_order_number ON public.strava_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_strava_status ON public.strava_orders(status);
CREATE INDEX IF NOT EXISTS idx_strava_is_example ON public.strava_orders(is_example);

-- 15. COMING SOON NOTIFY LIST TABLE
CREATE TABLE IF NOT EXISTS public.notify_list (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  product TEXT NOT NULL,
  category_group TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notify_product ON public.notify_list(product);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_design_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_character_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strava_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notify_list ENABLE ROW LEVEL SECURITY;

-- 1. Allow service_role full control on all tables (used by backend API routes)
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename IN (
      'products', 'collections', 'store_settings', 'customers', 'orders', 
      'draft_orders', 'abandoned_checkouts', 'custom_design_inquiries', 
      'custom_character_inquiries', 'product_reviews', 'journal_articles', 
      'discounts', 'subscribers', 'strava_orders', 'notify_list'
    )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "service_role_full_access" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "service_role_full_access" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- 2. Public read policies for storefront browsing
DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products" ON public.products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_collections" ON public.collections;
CREATE POLICY "public_read_collections" ON public.collections FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_settings" ON public.store_settings;
CREATE POLICY "public_read_settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_reviews" ON public.product_reviews;
CREATE POLICY "public_read_reviews" ON public.product_reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_journal" ON public.journal_articles;
CREATE POLICY "public_read_journal" ON public.journal_articles FOR SELECT TO anon, authenticated USING (true);

-- 3. Secure Strava Pre-Orders Privacy
-- CRITICAL SECURITY: Direct anonymous SELECT on strava_orders is REVOKED to protect customer privacy (phone, address, Strava URLs).
-- All tracking and public queue queries are routed through server API (/api/strava-orders and /api/strava-orders/queue) with strict privacy masking.
DROP POLICY IF EXISTS "public_read_strava_orders" ON public.strava_orders;

-- 4. Public buyer submission policies (insert only)
DROP POLICY IF EXISTS "public_insert_notify_list" ON public.notify_list;
CREATE POLICY "public_insert_notify_list" ON public.notify_list FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_subscribers" ON public.subscribers;
CREATE POLICY "public_insert_subscribers" ON public.subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_custom_design" ON public.custom_design_inquiries;
CREATE POLICY "public_insert_custom_design" ON public.custom_design_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_custom_character" ON public.custom_character_inquiries;
CREATE POLICY "public_insert_custom_character" ON public.custom_character_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA (CORE PRODUCTION PRODUCTS & STUDIO DEFAULTS)
-- ==============================================================================

-- 1. Clean up old template products and duplicate keys
DELETE FROM public.products WHERE id = 'keychain-strava' OR id IN ('prod-001', 'prod-002', 'prod-003', 'prod-004', 'prod-005', 'prod-006');

-- Insert Core Keychain Product (3 Real Photos: keychain-04, keychain-05, keychain-06)
INSERT INTO public.products (
  id, slug, name, category, price, compare_at_price, badge, 
  description, short_description, materials, dimensions, weight, layer_resolution, 
  color_options, images, featured, stock, status, rating, tags
) VALUES (
  'prod-strava-keychain',
  'keychain-strava',
  'Keychain Custom Data Strava x Where Is It? 3D print Custom',
  'Studio Custom 3D',
  119000,
  159000,
  'Pre-Order',
  'Abadikan rute lari, race marathon, atau PB terbaik kamu menjadi gantungan kunci 3D print custom. Menggunakan filament PLA+ premium dengan resolusi mikro 0.12mm yang kokoh, tajam, dan tahan cuaca. Rute 3D timbul sesuai jalur GPS Strava kamu lengkap dengan data jarak, pace, durasi, dan nama event.',
  'Rute lari kamu, sekarang bisa dipegang. 3D-printed keychain made from your own Strava route map + stats.',
  'Premium PLA+ Matte Bio-Polymer',
  '10 x 5 x 0.8 cm',
  '45 g',
  '0.12mm ultra-fine layer height',
  '["10x5 cm", "10x5 cm Emoney", "10x5 cm Flazz"]'::jsonb,
  '["/images/strava-keychain/keychain-04.jpg", "/images/strava-keychain/keychain-05.jpg", "/images/strava-keychain/keychain-06.jpg"]'::jsonb,
  true,
  999,
  'ACTIVE',
  5.0,
  '["strava", "keychain", "running", "memorabilia", "3d print", "e-money", "marathon"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  color_options = EXCLUDED.color_options,
  images = EXCLUDED.images;

-- 2. Insert Default Store Settings
INSERT INTO public.store_settings (id, data, updated_at) VALUES (
  'default',
  '{
    "storeName": "WhereIsIt?",
    "tagline": "Personal data. Physical products. Meaningful experiences.",
    "contactEmail": "whereisit26@gmail.com",
    "contactPhone": "6285128066354",
    "studioAddress": "Kab. Karawang & Jakarta, Indonesia",
    "currency": "IDR (Rp)",
    "taxRate": 0,
    "announcementText": "Pre-Order Dibuka: Keychain Custom Data Strava x Where Is It? 3D print Custom (Pre-order, dikirim dalam 10 hari)",
    "announcementActive": true,
    "paymentMethods": [
      { "name": "Mayar Payment Gateway (QRIS, Virtual Account, E-Wallet, Kartu)", "type": "MAYAR", "active": true }
    ],
    "homepageContent": {
      "heroTag": "Studio 3D Design & Objects",
      "heroTitle": "Transforms personal data, achievements, and everyday routines into meaningful physical products.",
      "heroSubtitle": "Personal data. Physical products. Meaningful experiences.",
      "heroStats": [
        { "value": "100%", "label": "Custom Physical Data" },
        { "value": "0.12mm", "label": "Micro-Layer Precision" },
        { "value": "5.0 ★", "label": "Verified Studio Rating" }
      ],
      "featuredTag": "Highlight Produk",
      "featuredTitle": "Rute lari kamu, sekarang bisa dipegang.",
      "featuredDescription": "Gantungan kunci 3D presisi tinggi dari rute Strava pribadimu. Lengkap dengan map 3D timbul, jarak, pace, durasi, serta opsi integrasi kartu e-money.",
      "customDesignTag": "Studio Commission",
      "customDesignTitle": "Custom objects for private spaces",
      "customDesignDescription": "Punya konsep produk 3D custom untuk brand, kantor, atau memorabilia komunitasmu? Kami bantu wujudkan mulai dari sketsa 3D hingga batch run fisik.",
      "customCharacterTag": "Studio Memorabilia",
      "customCharacterTitle": "Personal achievements in physical form",
      "customCharacterDescription": "Memorabilia lari dan pencapaian personal dari data aktivitasmu.",
      "studioStandardsTag": "Studio Standards",
      "studioStandardsTitle": "Engineered with intent. Finished with patience.",
      "studioStandardsSubtitle": "3D printing adalah alat presisi kami, dan ketelitian tangan adalah standar studio kami di Jakarta & Kab. Karawang."
    }
  }'::jsonb,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  data = EXCLUDED.data,
  updated_at = NOW();

-- 3. Clean up template collections & insert official collections
DELETE FROM public.collections WHERE id NOT IN ('col-strava', 'col-coming-soon');

INSERT INTO public.collections (id, slug, name, description, image, product_count, status) VALUES
  ('col-strava', 'strava-series', 'Strava Running Memorabilia', 'Koleksi gantungan kunci dan display 3D custom dari data lari Strava.', '/images/strava-keychain/keychain-04.jpg', 1, 'ACTIVE'),
  ('col-coming-soon', 'coming-soon-lineup', 'Segera Hadir (Teaser Lineup)', 'Konsep produk studio WhereIsIt generasi mendatang dalam tahap riset & prototipe.', '/images/coming-soon/strava-route-lamp.jpg', 2, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
  image = EXCLUDED.image,
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Verification query
SELECT 'WhereIsIt Supabase Migration Completed Successfully!' AS status;
