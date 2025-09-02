-- Kolonlar zaten var ama idempotent kalsın
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS is_from_panel boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;

-- RLS policy güncelle - published=true ekle
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS missions_select_only_panel_active ON public.missions;
CREATE POLICY missions_select_only_panel_active
ON public.missions
FOR SELECT
TO anon
USING (is_from_panel = true AND is_active = true AND published = true);

