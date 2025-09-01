-- Fix brands table - add missing columns
-- Run this in Supabase Studio → SQL Editor

-- Add missing columns to brands table
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add missing columns to brands table if they don't exist
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trg_brands_updated_at ON public.brands;
CREATE TRIGGER trg_brands_updated_at 
  BEFORE UPDATE ON public.brands
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

-- Check if brand_profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS public.brand_profiles (
  brand_id uuid PRIMARY KEY REFERENCES public.brands(id) ON DELETE CASCADE,
  handle text UNIQUE NULL,
  display_name text NULL,
  description text NULL,
  email text NULL,
  phone text NULL,
  website text NULL,
  category text NULL,
  founded_year int NULL,
  address text NULL,
  instagram text NULL,
  twitter text NULL,
  facebook text NULL,
  linkedin text NULL,
  license_plan text NULL,
  license_start date NULL,
  license_end date NULL,
  license_fee numeric(12,2) NULL,
  feat_mission_create boolean NOT NULL DEFAULT false,
  feat_user_mgmt boolean NOT NULL DEFAULT false,
  feat_analytics boolean NOT NULL DEFAULT false,
  feat_api_access boolean NOT NULL DEFAULT false,
  feat_priority_support boolean NOT NULL DEFAULT false,
  avatar_url text NULL,
  cover_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create trigger for brand_profiles
DROP TRIGGER IF EXISTS trg_brand_profiles_updated_at ON public.brand_profiles;
CREATE TRIGGER trg_brand_profiles_updated_at 
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

-- Create function to auto-create brand profile
CREATE OR REPLACE FUNCTION public.create_brand_profile_on_brand_insert()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.brand_profiles (brand_id, display_name)
  VALUES (NEW.id, NEW.name)
  ON CONFLICT (brand_id) DO NOTHING;
  RETURN NEW;
END $$;

-- Create trigger for auto-creating brand profiles
DROP TRIGGER IF EXISTS trg_brands_after_insert ON public.brands;
CREATE TRIGGER trg_brands_after_insert
  AFTER INSERT ON public.brands
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_brand_profile_on_brand_insert();

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create new ones
DROP POLICY IF EXISTS "read brands" ON public.brands;
CREATE POLICY "read brands" ON public.brands 
  FOR SELECT TO anon, authenticated 
  USING (true);

DROP POLICY IF EXISTS "read brand profiles" ON public.brand_profiles;
CREATE POLICY "read brand profiles" ON public.brand_profiles 
  FOR SELECT TO anon, authenticated 
  USING (true);

DROP POLICY IF EXISTS "write brands" ON public.brands;
CREATE POLICY "write brands" ON public.brands
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','brand_manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','brand_manager')));

DROP POLICY IF EXISTS "write brand profiles" ON public.brand_profiles;
CREATE POLICY "write brand profiles" ON public.brand_profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','brand_manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','brand_manager')));

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets','brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "brand-assets read" ON storage.objects;
CREATE POLICY "brand-assets read"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "brand-assets write" ON storage.objects;
CREATE POLICY "brand-assets write"
ON storage.objects FOR ALL TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets'
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','brand_manager'))
);
