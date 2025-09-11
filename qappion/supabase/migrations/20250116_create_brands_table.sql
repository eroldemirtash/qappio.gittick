-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create brand_profiles table
CREATE TABLE IF NOT EXISTS public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  display_name TEXT,
  category TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  avatar_url TEXT,
  license_plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS brands_name_idx ON public.brands(name);
CREATE INDEX IF NOT EXISTS brands_is_active_idx ON public.brands(is_active);
CREATE INDEX IF NOT EXISTS brand_profiles_brand_id_idx ON public.brand_profiles(brand_id);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for brands
DROP POLICY IF EXISTS "Brands are viewable by everyone" ON public.brands;
CREATE POLICY "Brands are viewable by everyone" ON public.brands
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Brands are insertable by authenticated users" ON public.brands;
CREATE POLICY "Brands are insertable by authenticated users" ON public.brands
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Brands are updatable by authenticated users" ON public.brands;
CREATE POLICY "Brands are updatable by authenticated users" ON public.brands
  FOR UPDATE USING (true);

-- Create RLS policies for brand_profiles
DROP POLICY IF EXISTS "Brand profiles are viewable by everyone" ON public.brand_profiles;
CREATE POLICY "Brand profiles are viewable by everyone" ON public.brand_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Brand profiles are insertable by authenticated users" ON public.brand_profiles;
CREATE POLICY "Brand profiles are insertable by authenticated users" ON public.brand_profiles
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Brand profiles are updatable by authenticated users" ON public.brand_profiles;
CREATE POLICY "Brand profiles are updatable by authenticated users" ON public.brand_profiles
  FOR UPDATE USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS brands_updated_at ON public.brands;
CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS brand_profiles_updated_at ON public.brand_profiles;
CREATE TRIGGER brand_profiles_updated_at
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Insert some sample brands
INSERT INTO public.brands (name, logo_url, is_active) VALUES
  ('Nike', 'https://via.placeholder.com/50', true),
  ('Adidas', 'https://via.placeholder.com/50', true),
  ('Puma', 'https://via.placeholder.com/50', true),
  ('Reebok', 'https://via.placeholder.com/50', true),
  ('New Balance', 'https://via.placeholder.com/50', true),
  ('Converse', 'https://via.placeholder.com/50', true),
  ('Vans', 'https://via.placeholder.com/50', true),
  ('Under Armour', 'https://via.placeholder.com/50', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample brand profiles
INSERT INTO public.brand_profiles (brand_id, display_name, category, email, phone, website, avatar_url, license_plan) 
SELECT 
  b.id,
  b.name,
  'Fashion',
  LOWER(b.name) || '@example.com',
  '+90 555 000 0000',
  'https://' || LOWER(b.name) || '.com',
  b.logo_url,
  'free'
FROM public.brands b
WHERE NOT EXISTS (SELECT 1 FROM public.brand_profiles bp WHERE bp.brand_id = b.id);
