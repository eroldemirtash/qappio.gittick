-- güvenli kolon seti
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS cover_url      text,
  ADD COLUMN IF NOT EXISTS is_from_panel  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active      boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS published      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS starts_at      timestamptz,
  ADD COLUMN IF NOT EXISTS ends_at        timestamptz,
  ADD COLUMN IF NOT EXISTS brand_id       uuid,
  ADD COLUMN IF NOT EXISTS brand_name     text,
  ADD COLUMN IF NOT EXISTS brand_logo     text;

-- RLS ve policy (anon + authenticated)
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS missions_select_only_panel_active ON public.missions;

CREATE POLICY missions_select_only_panel_active
ON public.missions
FOR SELECT
TO anon, authenticated
USING (
  is_from_panel = true
  AND is_active = true
  AND published = true
  AND starts_at <= now()
  AND (ends_at IS NULL OR ends_at >= now())
);

GRANT SELECT ON public.missions TO anon, authenticated;

