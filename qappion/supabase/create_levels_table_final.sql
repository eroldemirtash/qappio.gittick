-- Create levels table for user level management (Final Version)
-- Run this in Supabase Studio → SQL Editor

-- Step 1: Create basic levels table if not exists
CREATE TABLE IF NOT EXISTS public.levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  min_points integer NOT NULL DEFAULT 0,
  max_points integer NULL,
  badge_letter text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  user_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Step 2: Add new columns one by one
DO $$ 
BEGIN
  -- Add product_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'levels' AND column_name = 'product_count') THEN
    ALTER TABLE public.levels ADD COLUMN product_count integer NOT NULL DEFAULT 0;
  END IF;
  
  -- Add mission_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'levels' AND column_name = 'mission_count') THEN
    ALTER TABLE public.levels ADD COLUMN mission_count integer NOT NULL DEFAULT 0;
  END IF;
  
  -- Add avg_points column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'levels' AND column_name = 'avg_points') THEN
    ALTER TABLE public.levels ADD COLUMN avg_points integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Step 3: Create updated_at trigger
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

-- Step 4: Enable RLS
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies
DROP POLICY IF EXISTS "Anyone can read levels" ON public.levels;
DROP POLICY IF EXISTS "Authenticated users can manage levels" ON public.levels;

CREATE POLICY "Anyone can read levels" ON public.levels
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage levels" ON public.levels
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 6: Insert or update levels data
INSERT INTO public.levels (name, description, min_points, max_points, badge_letter, color, user_count, product_count, mission_count, avg_points) VALUES
('Snapper', 'Yeni başlayan kullanıcılar için temel seviye', 0, 99, 'S', '#fbbf24', 1250, 45, 12, 45),
('Seeker', 'Aktif kullanıcılar için orta seviye', 100, 499, 'E', '#10b981', 890, 78, 25, 285),
('Crafter', 'Deneyimli kullanıcılar için ileri seviye', 500, 1499, 'C', '#8b5cf6', 456, 92, 38, 875),
('Viralist', 'Sosyal medya uzmanları için üst seviye', 1500, 4999, 'V', '#f59e0b', 234, 156, 52, 2850),
('Qappian', 'En üst seviye kullanıcılar için elit seviye', 5000, NULL, 'Q', '#06b6d4', 67, 203, 89, 8750),
('Influencer', 'Sosyal medya etkileyicileri için özel seviye', 10000, NULL, 'I', '#ec4899', 23, 312, 156, 15600),
('Creator', 'İçerik üreticileri için premium seviye', 20000, NULL, 'C', '#7c3aed', 12, 445, 234, 31200)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  min_points = EXCLUDED.min_points,
  max_points = EXCLUDED.max_points,
  badge_letter = EXCLUDED.badge_letter,
  color = EXCLUDED.color,
  user_count = EXCLUDED.user_count,
  product_count = EXCLUDED.product_count,
  mission_count = EXCLUDED.mission_count,
  avg_points = EXCLUDED.avg_points,
  updated_at = now();

-- Step 7: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.levels TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.levels TO authenticated;
