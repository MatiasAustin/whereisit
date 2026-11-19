-- ==============================================================================
-- WHEREISIT? STUDIO - COMPREHENSIVE SUPABASE DATABASE & STORAGE MIGRATION
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Safe to run multiple times (Idempotent: IF NOT EXISTS / ON CONFLICT / EXCEPTION HANDLED)
-- ==============================================================================

-- 1. UPDATE TABLE strava_orders WITH LATEST COLUMNS
ALTER TABLE public.strava_orders ADD COLUMN IF NOT EXISTS shipping_region TEXT;
ALTER TABLE public.strava_orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC DEFAULT 0;
ALTER TABLE public.strava_orders ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false;
ALTER TABLE public.strava_orders ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ;
ALTER TABLE public.strava_orders ADD COLUMN IF NOT EXISTS clicky_fee NUMERIC DEFAULT 0;
ALTER TABLE public.strava_orders ADD COLUMN IF NOT EXISTS strava_data JSONB;
ALTER TABLE public.strava_orders ADD COLUMN IF NOT EXISTS production JSONB;
ALTER TABLE public.strava_orders ADD COLUMN IF NOT EXISTS payment_details JSONB;
ALTER TABLE public.strava_orders ADD COLUMN IF NOT EXISTS is_example BOOLEAN DEFAULT false;

-- 2. AUTO-ALIGN abandoned_checkouts COLUMNS WITH CODEBASE
ALTER TABLE public.abandoned_checkouts ADD COLUMN IF NOT EXISTS checkout_number TEXT;
ALTER TABLE public.abandoned_checkouts ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.abandoned_checkouts ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.abandoned_checkouts ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
DO $$ BEGIN
  ALTER TABLE public.abandoned_checkouts ALTER COLUMN customer_name DROP NOT NULL;
  ALTER TABLE public.abandoned_checkouts ALTER COLUMN email DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. AUTO-ALIGN custom_design_inquiries COLUMNS WITH CODEBASE
ALTER TABLE public.custom_design_inquiries ADD COLUMN IF NOT EXISTS project_type TEXT;
ALTER TABLE public.custom_design_inquiries ADD COLUMN IF NOT EXISTS dimension_constraints TEXT;
ALTER TABLE public.custom_design_inquiries ADD COLUMN IF NOT EXISTS desired_timeline TEXT;
DO $$ BEGIN
  ALTER TABLE public.custom_design_inquiries ALTER COLUMN project_name DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 4. CREATE PUBLIC STORAGE BUCKET FOR BUYER SCREENSHOTS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'strava-uploads',
  'strava-uploads',
  true,
  10485760, -- 10MB limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 5. CONFIGURE ROW LEVEL SECURITY (RLS) FOR STORAGE OBJECTS
DROP POLICY IF EXISTS "Public can view strava-uploads" ON storage.objects;
CREATE POLICY "Public can view strava-uploads"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'strava-uploads');

DROP POLICY IF EXISTS "Anyone can upload strava-uploads" ON storage.objects;
CREATE POLICY "Anyone can upload strava-uploads"
  ON storage.objects FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (bucket_id = 'strava-uploads');

DROP POLICY IF EXISTS "Anyone can update strava-uploads" ON storage.objects;
CREATE POLICY "Anyone can update strava-uploads"
  ON storage.objects FOR UPDATE
  TO anon, authenticated, service_role
  USING (bucket_id = 'strava-uploads')
  WITH CHECK (bucket_id = 'strava-uploads');

DROP POLICY IF EXISTS "Service role full control strava-uploads" ON storage.objects;
CREATE POLICY "Service role full control strava-uploads"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'strava-uploads')
  WITH CHECK (bucket_id = 'strava-uploads');

-- 6. PERSIST INITIAL STRAVA MEDIA CONFIG TO STORE_SETTINGS (HERO & 3 BATCH 2 VARIATIONS)
INSERT INTO public.store_settings (id, data, updated_at) VALUES (
  'strava_media',
  '{
    "heroImage": "/images/strava-keychain/keychain-04.jpg",
    "variationImages": {
      "var-57x94": "/images/strava-keychain/keychain-04.jpg",
      "var-emoney": "/images/strava-keychain/keychain-05.jpg",
      "var-flazz": "/images/strava-keychain/keychain-06.jpg"
    },
    "variationPrices": {
      "var-57x94": 119000,
      "var-emoney": 180000,
      "var-flazz": 220000
    },
    "gallery": [
      {
        "id": "media-photo-01",
        "type": "image",
        "title": "Keychain Custom Strava — Tanpa Kartu (5.7x9.4 cm)",
        "caption": "Tampak depan rute 3D timbul dengan presisi layer 0.12mm.",
        "src": "/images/strava-keychain/keychain-04.jpg",
        "aspectRatio": "1:1"
      },
      {
        "id": "media-photo-02",
        "type": "image",
        "title": "Keychain Custom Strava — E-Money Edition",
        "caption": "Dilengkapi kartu e-money terintegrasi yang aktif dan dapat di-tap di transportasi umum.",
        "src": "/images/strava-keychain/keychain-05.jpg",
        "aspectRatio": "1:1"
      },
      {
        "id": "media-photo-03",
        "type": "image",
        "title": "Keychain Custom Strava — Flazz Edition",
        "caption": "Varian Flazz resmi dengan bodi kokoh dan finishing halus.",
        "src": "/images/strava-keychain/keychain-06.jpg",
        "aspectRatio": "1:1"
      }
    ]
  }'::jsonb,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  data = EXCLUDED.data,
  updated_at = NOW();

-- 7. UPDATE PRODUCT SPECIFICATIONS (5.7x9.4 cm Batch 2)
UPDATE public.products 
SET 
  dimensions = '5.7 x 9.4 x 0.8 cm',
  color_options = '["5.7x9.4 cm", "5.7x9.4 cm Emoney", "5.7x9.4 cm Flazz"]'::jsonb,
  price = 119000
WHERE id = 'prod-strava-keychain';

-- 8. VERIFICATION QUERY
SELECT 'Migration Successful!' AS status, NOW() AS executed_at;
