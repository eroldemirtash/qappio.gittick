-- Add panel control columns to missions table
ALTER TABLE public.missions
ADD COLUMN IF NOT EXISTS is_from_panel boolean NOT NULL DEFAULT false;

ALTER TABLE public.missions
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.missions
ADD COLUMN IF NOT EXISTS cover_url text;

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS missions_select_anon ON public.missions;
DROP POLICY IF EXISTS missions_select_only_panel_active ON public.missions;

-- Create new policy for panel-only access
CREATE POLICY missions_select_only_panel_active
ON public.missions
FOR SELECT
TO anon
USING (is_from_panel = true AND is_active = true);

-- Mark existing missions as panel missions (temporary)
UPDATE public.missions 
SET is_from_panel = true 
WHERE is_from_panel = false;
