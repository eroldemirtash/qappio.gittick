-- Add foreign key constraint between missions and brands
-- This fixes the PGRST200 error when creating missions

-- Drop the view first to avoid dependency issues
DROP VIEW IF EXISTS public.v_missions_public;

-- First, ensure the brand_id column exists and has the right type
ALTER TABLE public.missions 
  ALTER COLUMN brand_id TYPE uuid USING brand_id::uuid;

-- Add the foreign key constraint
ALTER TABLE public.missions 
  ADD CONSTRAINT fk_missions_brand_id 
  FOREIGN KEY (brand_id) 
  REFERENCES public.brands(id) 
  ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_missions_brand_id ON public.missions(brand_id);

-- Recreate the view
CREATE VIEW public.v_missions_public AS
  SELECT 
    m.id,
    m.brand_id,
    m.title,
    m.short_description,
    m.full_description,
    m.cover_url,
    m.qp_reward,
    m.like_qp,
    m.share_qp,
    m.status,
    m.starts_at,
    m.ends_at,
    m.is_published,
    m.is_active,
    m.created_at,
    b.name as brand_name,
    b.logo_url as brand_logo
  FROM public.missions m
  LEFT JOIN public.brands b ON b.id = m.brand_id
  WHERE m.is_published = true
    AND m.is_active = true
    AND (m.starts_at IS NULL OR m.starts_at <= now())
    AND (m.ends_at IS NULL OR m.ends_at >= now());
