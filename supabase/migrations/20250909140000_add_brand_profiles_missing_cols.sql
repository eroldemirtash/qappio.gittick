-- Add missing columns for brand_profiles used by admin panel
-- Safe to run multiple times

ALTER TABLE public.brand_profiles
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS license_plan text DEFAULT 'freemium',
  ADD COLUMN IF NOT EXISTS license_start date,
  ADD COLUMN IF NOT EXISTS license_end date,
  ADD COLUMN IF NOT EXISTS license_fee numeric(12,2);

-- Optional: JSON features if you want to store extras
ALTER TABLE public.brand_profiles
  ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '{}'::jsonb;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_brand_profiles_license_plan ON public.brand_profiles(license_plan);

