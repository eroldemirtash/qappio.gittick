-- Add is_active column to brands table
-- Run this in Supabase Studio → SQL Editor

ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Update existing brands to be active by default
UPDATE public.brands 
SET is_active = true 
WHERE is_active IS NULL;
