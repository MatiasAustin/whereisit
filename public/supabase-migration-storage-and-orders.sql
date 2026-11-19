-- ==============================================================================
-- WHEREISIT? STUDIO - SUPABASE STORAGE & STRAVA ORDERS MIGRATION
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Safe to run multiple times (idempotent with IF NOT EXISTS / ON CONFLICT)
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

-- 2. CREATE PUBLIC STORAGE BUCKET FOR BUYER SCREENSHOTS
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

-- 3. CONFIGURE ROW LEVEL SECURITY (RLS) FOR STORAGE
-- Allow public viewing of screenshots (for admin dashboard and customer order tracking)
DROP POLICY IF EXISTS "Public can view strava-uploads" ON storage.objects;
CREATE POLICY "Public can view strava-uploads"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'strava-uploads');

-- Allow buyers (anon & authenticated) to upload screenshots directly
DROP POLICY IF EXISTS "Anyone can upload strava-uploads" ON storage.objects;
CREATE POLICY "Anyone can upload strava-uploads"
  ON storage.objects FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (bucket_id = 'strava-uploads');

-- Allow updates/upserts
DROP POLICY IF EXISTS "Anyone can update strava-uploads" ON storage.objects;
CREATE POLICY "Anyone can update strava-uploads"
  ON storage.objects FOR UPDATE
  TO anon, authenticated, service_role
  USING (bucket_id = 'strava-uploads')
  WITH CHECK (bucket_id = 'strava-uploads');

-- Allow service_role full administrative access
DROP POLICY IF EXISTS "Service role full control strava-uploads" ON storage.objects;
CREATE POLICY "Service role full control strava-uploads"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'strava-uploads')
  WITH CHECK (bucket_id = 'strava-uploads');

-- 4. VERIFICATION
SELECT 
  'Bucket Created' AS component, 
  id, 
  name, 
  public, 
  file_size_limit 
FROM storage.buckets 
WHERE id = 'strava-uploads';
