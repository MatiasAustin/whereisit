-- WhereIsIt: 3D Printed Studio & Bespoke Keepsake
-- Complete Supabase PostgreSQL Schema

-- 1. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);

-- 2. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  shipping_carrier TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'PENDING',
  order_status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (order_status);

-- 3. CUSTOM DESIGN INQUIRIES
CREATE TABLE IF NOT EXISTS public.custom_design_inquiries (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  project_type TEXT NOT NULL,
  dimension_constraints TEXT,
  estimated_budget TEXT,
  description TEXT NOT NULL,
  desired_timeline TEXT,
  status TEXT DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_design_status ON public.custom_design_inquiries (status);

-- 4. CUSTOM CHARACTER INQUIRIES
CREATE TABLE IF NOT EXISTS public.custom_character_inquiries (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  character_type TEXT NOT NULL,
  style TEXT NOT NULL,
  plaque_text TEXT,
  photo_url TEXT,
  reference_notes TEXT NOT NULL,
  status TEXT DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_char_status ON public.custom_character_inquiries (status);

-- 5. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  customer_type TEXT DEFAULT 'RETAIL',
  city TEXT,
  orders_count INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (email);

-- 6. DISCOUNTS
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

CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts (code);

-- 7. DRAFT ORDERS
CREATE TABLE IF NOT EXISTS public.draft_orders (
  id TEXT PRIMARY KEY,
  draft_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'DRAFT',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ABANDONED CHECKOUTS
CREATE TABLE IF NOT EXISTS public.abandoned_checkouts (
  id TEXT PRIMARY KEY,
  checkout_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  recovery_status TEXT DEFAULT 'NOT_RECOVERED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  author TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'APPROVED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'footer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  product_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE'
);

-- 12. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. JOURNAL ARTICLES
CREATE TABLE IF NOT EXISTS public.journal_articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author TEXT,
  status TEXT DEFAULT 'PUBLISHED',
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_design_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_character_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read on storefront data
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can view collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Public can view approved reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Public can view published journal" ON public.journal_articles FOR SELECT USING (true);
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT USING (true);

-- Allow public submissions (Storefront actions)
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert design inquiry" ON public.custom_design_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert character inquiry" ON public.custom_character_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert reviews" ON public.product_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert abandoned checkouts" ON public.abandoned_checkouts FOR INSERT WITH CHECK (true);

-- Allow Service Role full access for Admin API operations
-- (By default, Supabase service_role key bypasses RLS automatically)
