-- Add cover_url column to missions table
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Add comment
COMMENT ON COLUMN public.missions.cover_url IS 'Mission cover image URL';
