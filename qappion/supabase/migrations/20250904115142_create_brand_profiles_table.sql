-- Create brand_profiles table for admin panel
CREATE TABLE IF NOT EXISTS public.brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  display_name text,
  email text,
  phone text,
  website text,
  category text,
  license_plan text DEFAULT 'basic',
  license_start timestamptz,
  license_end timestamptz,
  license_fee numeric(10,2) DEFAULT 0,
  features jsonb DEFAULT '{}',
  founded_year integer,
  address text,
  description text,
  social_instagram text,
  social_twitter text,
  social_facebook text,
  social_linkedin text,
  avatar_url text,
  logo_url text,
  cover_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint
ALTER TABLE public.brand_profiles 
ADD CONSTRAINT brand_profiles_brand_id_key UNIQUE (brand_id);

-- Enable RLS
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "public_read_brand_profiles" ON public.brand_profiles
  FOR SELECT USING (true);

CREATE POLICY "public_insert_brand_profiles" ON public.brand_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_update_brand_profiles" ON public.brand_profiles
  FOR UPDATE USING (true);

CREATE POLICY "public_delete_brand_profiles" ON public.brand_profiles
  FOR DELETE USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_brand_profiles_brand_id ON public.brand_profiles(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_category ON public.brand_profiles(category);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_license_plan ON public.brand_profiles(license_plan);
