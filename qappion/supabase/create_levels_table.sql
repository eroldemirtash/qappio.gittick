-- Create levels table for user level management
-- Run this in Supabase Studio → SQL Editor

-- Create levels table (drop if exists first to avoid conflicts)
DROP TABLE IF EXISTS public.levels CASCADE;

CREATE TABLE public.levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  min_points integer NOT NULL DEFAULT 0,
  max_points integer NULL, -- NULL means unlimited
  badge_letter text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  user_count integer NOT NULL DEFAULT 0,
  product_count integer NOT NULL DEFAULT 0,
  mission_count integer NOT NULL DEFAULT 0,
  avg_points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

DROP TRIGGER IF EXISTS trg_levels_updated_at ON public.levels;
CREATE TRIGGER trg_levels_updated_at 
  BEFORE UPDATE ON public.levels
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read levels" ON public.levels;
DROP POLICY IF EXISTS "Authenticated users can manage levels" ON public.levels;

-- Everyone can read levels
CREATE POLICY "Anyone can read levels" ON public.levels
  FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete (admin only in practice)
CREATE POLICY "Authenticated users can manage levels" ON public.levels
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default levels
INSERT INTO public.levels (name, description, min_points, max_points, badge_letter, color, user_count, product_count, mission_count, avg_points) VALUES
('Snapper', 'Yeni başlayan kullanıcılar için temel seviye', 0, 99, 'S', '#fbbf24', 1250, 45, 12, 45),
('Seeker', 'Aktif kullanıcılar için orta seviye', 100, 499, 'E', '#10b981', 890, 78, 25, 285),
('Crafter', 'Deneyimli kullanıcılar için ileri seviye', 500, 1499, 'C', '#8b5cf6', 456, 92, 38, 875),
('Viralist', 'Sosyal medya uzmanları için üst seviye', 1500, 4999, 'V', '#f59e0b', 234, 156, 52, 2850),
('Qappian', 'En üst seviye kullanıcılar için elit seviye', 5000, NULL, 'Q', '#06b6d4', 67, 203, 89, 8750),
('Influencer', 'Sosyal medya etkileyicileri için özel seviye', 10000, NULL, 'I', '#ec4899', 23, 312, 156, 15600),
('Creator', 'İçerik üreticileri için premium seviye', 20000, NULL, 'C', '#7c3aed', 12, 445, 234, 31200)
ON CONFLICT (name) DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.levels TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.levels TO authenticated;
