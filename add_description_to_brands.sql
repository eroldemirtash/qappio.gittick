-- Add description column to brands table
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS description text;

-- Update existing brands with description if needed
UPDATE public.brands 
SET description = 'Marka açıklaması buraya yazılacak'
WHERE description IS NULL;

