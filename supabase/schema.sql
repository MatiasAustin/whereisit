-- WhereIsIt: 3D Printed Studio & Bespoke Keepsake
-- Complete Supabase PostgreSQL Schema & Auto-Seed Data

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

-- ==========================================
-- SEED DATA (Runs automatically in Supabase)
-- ==========================================

-- 1. Insert Store Settings
INSERT INTO public.store_settings (id, data, updated_at)
VALUES (
  'default',
  '{
    "storeName": "WhereIsIt",
    "tagline": "3D Printed Premium Stuff & Bespoke Studio",
    "contactEmail": "studio@whereisit.design",
    "contactPhone": "+62 812-3456-7890",
    "studioAddress": "Workshop Studio 04, Jl. Senopati No. 82, Jakarta Selatan, 12190",
    "currency": "IDR (Rp)",
    "taxRate": 0,
    "announcementText": "✨ Complimentary nationwide courier delivery for all studio crafted objects above Rp 750.000",
    "announcementActive": true,
    "shippingCarriers": [
      { "name": "JNE YES (Next Day Air)", "fee": 35000, "active": true },
      { "name": "SiCepat Gokil (Cargo & Heavy Object)", "fee": 25000, "active": true },
      { "name": "Studio Dedicated Courier (Jabodetabek)", "fee": 50000, "active": true }
    ],
    "paymentMethods": [
      { "name": "Bank Transfer (BCA / Mandiri Manual Verification)", "type": "BANK_TRANSFER", "active": true },
      { "name": "QRIS Instant Payment", "type": "QRIS", "active": true },
      { "name": "Credit / Debit Card (Visa / Mastercard)", "type": "CARD", "active": true }
    ]
  }'::jsonb,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

-- 2. Insert Collections
INSERT INTO public.collections (id, slug, name, description, image, product_count, status)
VALUES
  ('col-arch', 'architectural-series', 'Architectural Series', 'Bespoke desk and interior objects inspired by brutalist and modern architectural forms.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80', 4, 'ACTIVE'),
  ('col-desk', 'desktop-essentials', 'Desktop Essentials', 'Precision engineered organizers, stands, and lighting for thoughtful working environments.', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80', 3, 'ACTIVE'),
  ('col-keepsake', 'keepsake-collection', 'Keepsake Collection', 'Personalized portrait characters and collectible figures transformed from customer memories.', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80', 2, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Products
INSERT INTO public.products (id, slug, name, category, price, compare_at_price, badge, short_description, description, materials, dimensions, weight, layer_resolution, color_options, images, featured, stock, status, rating, tags, created_at, updated_at)
VALUES
  (
    'prod-001',
    'walnut-curve-lounge',
    'Walnut Curve Armchair',
    'Small Furniture',
    4950000,
    5600000,
    'profitably',
    'Sculptural dining and accent chair with soft continuous curves and lightweight silhouette.',
    'The Walnut Curve embodies the intersection of algorithmic generative curves and organic warmth. Crafted using high-density recyclable polymer joints with a solid architectural stance, every radius has been calculated to support lumbar posture naturally without bulky padding.',
    'High-grade matte structural bio-polymer, internal gyroid reinforcement, satin clearcoat',
    'W 560mm × D 540mm × H 760mm (Seat H 450mm)',
    '3.4 kg',
    '0.12mm Ultra-Fine Adaptive Layering',
    '["Slate Dusty Blue", "Bone Alabaster", "Smoked Walnut Finish", "Charcoal Noir"]'::jsonb,
    '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
    true,
    8,
    'ACTIVE',
    4.8,
    '["ergonomic", "minimal", "0.12mm"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'prod-002',
    'noir-shell-chair',
    'Noir Shell Occasional Chair',
    'Small Furniture',
    8400000,
    9200000,
    'popular',
    'Statement armchair with a deep ergonomic seat and hand-finished architectural lattice shell.',
    'Designed as a focal presence for contemporary interiors. Noir Shell utilizes an exterior parametric rib architecture that creates dynamic shadows as daylight shifts across the room. Lightweight yet rated for up to 180kg static load.',
    'Carbon-infused matte composite, brass hardware accents, felt floor protectors',
    'W 640mm × D 610mm × H 810mm',
    '4.8 kg',
    '0.16mm Precision Architectural Profile',
    '["Deep Noir Black", "Slate Grey-Blue", "Pebble Sand"]'::jsonb,
    '["https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
    true,
    5,
    'ACTIVE',
    5.0,
    '["handcrafted", "modern", "statement"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'prod-003',
    'amber-lounge-chair',
    'Amber Lounge Architectural Armchair',
    'Small Furniture',
    12100000,
    13500000,
    'premium',
    'Elegant lounge chair with rich tactile surfaces and a refined architectural frame.',
    'A study in quiet luxury. Amber Lounge integrates seamless 3D printed monolithic legs with refined tactile cushions. Each surface undergoes multi-stage manual hand-finishing to produce a soothing, ceramic-like tactile temperature.',
    'Weighted mineral composite body, internal acoustic honeycomb, vegan saddle tan finish',
    'W 680mm × D 660mm × H 740mm',
    '5.2 kg',
    '0.10mm High-Precision Studio Layering',
    '["Warm Terracotta", "Dusty Slate Blue", "Alabaster White"]'::jsonb,
    '["https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
    true,
    3,
    'ACTIVE',
    4.9,
    '["premium", "mid-century", "bespoke"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'prod-004',
    'monolith-desk-valet',
    'Monolith Architectural Desk Valet',
    'Desk Objects',
    480000,
    550000,
    'signature',
    'Curved desktop architecture uniting phone cradle, brass pen well, and magnetic accessory pool.',
    'Engineered for clutter-free focus. Cast from a dense, weighted mineral-polymer blend that stays firmly in place. Features hidden cable management channels and a soft-angled phone viewing slot calibrated at 62 degrees for ergonomic notifications.',
    'Weighted ceramic-polymer composite, brass locator pin, non-marking silicone feet',
    'W 240mm × D 110mm × H 32mm',
    '620 g',
    '0.12mm Micro-Layering with hand buffed finish',
    '["Slate Dusty Blue", "Bone Alabaster", "Charcoal Noir"]'::jsonb,
    '["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
    false,
    14,
    'ACTIVE',
    4.9,
    '["desk-essentials", "stationery", "weighted"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'prod-005',
    'brutalist-fluted-vase',
    'Fluted Architectural Vessel (No. 03)',
    'Home & Decor',
    620000,
    750000,
    'new',
    'Monolithic fluted stoneware vessel with water-tight internal liner and velvety matte texture.',
    'A sculptural ceramic-feel vessel utilizing our proprietary continuous z-hop extrusion. Designed to hold dry botanicals or fresh blooms with equal grace. Weighted at the base for absolute stability.',
    'Waterproof sealed bio-resin interior, matte tactile exterior finish',
    'Ø 130mm × H 280mm',
    '780 g',
    '0.14mm Continuous Helix Profile',
    '["Bone Alabaster", "Dusty Slate Blue", "Terracotta Ochre", "Pebble Grey"]'::jsonb,
    '["https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
    false,
    12,
    'ACTIVE',
    4.7,
    '["vessel", "botanical", "sculptural"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'prod-006',
    'custom-chibi-keepsake',
    'Custom 3D Keepsake Character (From Photo)',
    'Character & Collectibles',
    1250000,
    1500000,
    'signature',
    'Transform personal portrait photos into charming stylized 3D figurines on a wooden or marble plinth.',
    'Our signature bespoke keepsake service. Send us 2-3 photos of your loved one, friend, or mascot. Our 3D character artists hand-sculpt a charming, high-resemblance chibi persona, precision print it at 0.08mm layer density, and meticulously hand-paint facial details.',
    'High-resolution UV curable tough polymer, hand-painted acrylics, solid walnut base',
    'Figurine H 110mm-130mm (with 20mm Walnut Base)',
    '310 g',
    '0.08mm Ultra-Detail Precision Resin & PLA+',
    '["Studio Bespoke Palette (Hand-Painted)"]'::jsonb,
    '["https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
    true,
    20,
    'ACTIVE',
    5.0,
    '["custom", "chibi", "keepsake", "gift"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'prod-007',
    'strata-bookend-set',
    'Strata Heavyweight Bookends (Pair)',
    'Desk Objects',
    720000,
    850000,
    'limited',
    'Weighted stepped architectural bookends inspired by geological sediment strata.',
    'Balanced and dense. Filled internally with fine quartz mineral aggregate to comfortably anchor heavy design hardcovers. The textured fluting creates a rhythmic geometric cadence along bookshelf edges.',
    'Quartz-infused structural composite, felt base lining, brass accent deboss',
    'W 110mm × D 90mm × H 160mm (Per Unit)',
    '1.8 kg (Pair combined)',
    '0.12mm Micro-Layer Finish',
    '["Charcoal Noir", "Slate Dusty Blue", "Bone Alabaster"]'::jsonb,
    '["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
    false,
    7,
    'ACTIVE',
    4.9,
    '["bookends", "heavyweight", "shelf-styling"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'prod-008',
    'torus-cable-dock',
    'Torus Magnetic Cable & Headphone Stand',
    'Desk Objects',
    590000,
    690000,
    'popular',
    'Continuous looping headphone pedestal with integrated magnetic charging conduit.',
    'A fluid continuous loop that supports over-ear headphones without causing headband crease. The hollow internal spine routes charging cables invisibly from the desktop to the headphone band.',
    'Matte structural bio-polymer, non-slip base damper, magnetic cord guide',
    'W 140mm × D 130mm × H 260mm',
    '490 g',
    '0.14mm Smooth Curve Profile',
    '["Slate Dusty Blue", "Bone Alabaster", "Deep Noir"]'::jsonb,
    '["https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
    false,
    11,
    'ACTIVE',
    4.8,
    '["workspace", "audio", "sculptural"]'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Verified Reviews
INSERT INTO public.product_reviews (id, product_id, product_name, author, email, rating, title, content, verified_purchase, status, created_at)
VALUES
  (
    'rev-1',
    'prod-004',
    'Monolith Architectural Desk Valet',
    'Rama Daniswara',
    'rama.d@designlab.com',
    5,
    'Solid weight and impeccable finish',
    'Tidak terasa seperti plastik murahan. Tekstur matte structural bio-polymer nya sangat premium dan presisi untuk meja kerja.',
    true,
    'APPROVED',
    NOW() - INTERVAL '14 days'
  ),
  (
    'rev-2',
    'prod-001',
    'Walnut Curve Armchair',
    'Clara Sasmita',
    'clara@interiorvibes.id',
    5,
    'Warm ambient glow with sculpted elegance',
    'Layer resolusi 0.12mm benar-benar halus, kurva ergonomisnya sangat nyaman dan estetik untuk ruang studio.',
    true,
    'APPROVED',
    NOW() - INTERVAL '7 days'
  ),
  (
    'rev-3',
    'prod-006',
    'Custom 3D Keepsake Character (From Photo)',
    'Budi Prasetyo',
    'budi.p@gmail.com',
    5,
    'Kemiripannya luar biasa untuk kado wedding',
    'Order karakter couple untuk kado pernikahan sahabat. Hasilnya sangat lucu, mirip, dan detail plat kuningan serta box kemasannya sangat mewah!',
    true,
    'APPROVED',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Journal Articles
INSERT INTO public.journal_articles (id, slug, title, excerpt, content, cover_image, author, status, published_at)
VALUES
  (
    'art-1',
    'the-tactility-of-bio-polymers',
    'The Tactility of Bio-Polymers in High-End Living Spaces',
    'Exploring how structural precision and matte layered profiles transform raw bioplastics into archival sculptural objects.',
    'When we founded WhereIsIt, our goal was never merely to output 3D geometry onto a print bed. It was to explore how additive manufacturing can sit alongside Danish teak, brushed brass, and natural limestone without feeling out of place...',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    'Austin Matias, Design Lead',
    'PUBLISHED',
    NOW() - INTERVAL '20 days'
  ),
  (
    'art-2',
    'transforming-portraiture-into-3d-keepsakes',
    'Crafting Intimacy: Transforming Portraiture into 3D Keepsakes',
    'Behind the scenes of our custom character workflow, from client photographs to hand-finished resin miniatures.',
    'A photograph captures a split-second slice of time. A three-dimensional figurine gives that memory volume, weight, and presence in physical space...',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
    'Studio Craft Team',
    'PUBLISHED',
    NOW() - INTERVAL '10 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Discounts
INSERT INTO public.discounts (id, code, type, value, min_purchase, usage_limit, usage_count, status, starts_at, created_at)
VALUES
  ('disc-1', 'WHEREISIT10', 'PERCENTAGE', 10, 500000, 100, 24, 'ACTIVE', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('disc-2', 'STUDIOLAUNCH', 'FIXED', 50000, 300000, 50, 15, 'ACTIVE', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Customers
INSERT INTO public.customers (id, first_name, last_name, email, phone, customer_type, city, orders_count, total_spent, notes, created_at)
VALUES
  ('cust-1', 'Arif', 'Wicaksono', 'arif.w@archstudio.id', '0812-9876-5432', 'INTERIOR_DESIGNER', 'Jakarta Selatan', 4, 3850000, 'Architect partner, prefers bone alabaster finishes', NOW() - INTERVAL '40 days'),
  ('cust-2', 'Devina', 'Surya', 'devina@creativehub.co', '0811-2345-6789', 'COLLECTOR', 'Bandung', 2, 1470000, 'Bought custom keepsake characters', NOW() - INTERVAL '25 days')
ON CONFLICT (id) DO NOTHING;
