-- Fix missing columns in missions table
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS is_sponsored boolean DEFAULT false;
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS sponsor_brand_id uuid;
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS sponsor_brand_name text;
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS sponsor_brand_logo text;
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS published boolean DEFAULT false;
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS is_qappio_of_week boolean DEFAULT false;
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS starts_at timestamptz;
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS ends_at timestamptz;
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS reward_qp integer DEFAULT 0;

-- Add foreign key constraint for sponsor_brand_id
ALTER TABLE public.missions 
ADD CONSTRAINT missions_sponsor_brand_id_fkey 
FOREIGN KEY (sponsor_brand_id) REFERENCES public.brands(id);

-- Update existing missions to have default values
UPDATE public.missions SET 
  is_sponsored = false,
  published = true,
  is_qappio_of_week = false,
  reward_qp = COALESCE(reward_qp, 0)
WHERE is_sponsored IS NULL OR published IS NULL OR is_qappio_of_week IS NULL OR reward_qp IS NULL;

