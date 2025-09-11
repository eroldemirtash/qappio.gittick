-- Brand follows tablosunu oluştur
-- Bu script'i Supabase Studio'da çalıştır

-- Brand follows tablosu
CREATE TABLE IF NOT EXISTS public.brand_follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(brand_id, user_id)
);

-- RLS politikaları
ALTER TABLE public.brand_follows ENABLE ROW LEVEL SECURITY;

-- Takip etme/bırakma politikaları
DROP POLICY IF EXISTS "Users can follow brands" ON public.brand_follows;
CREATE POLICY "Users can follow brands"
ON public.brand_follows FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unfollow brands" ON public.brand_follows;
CREATE POLICY "Users can unfollow brands"
ON public.brand_follows FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Takip durumunu okuma politikaları
DROP POLICY IF EXISTS "Users can read their follows" ON public.brand_follows;
CREATE POLICY "Users can read their follows"
ON public.brand_follows FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Takipçi sayısını okuma politikaları (anon da okuyabilir)
DROP POLICY IF EXISTS "Anyone can read follower counts" ON public.brand_follows;
CREATE POLICY "Anyone can read follower counts"
ON public.brand_follows FOR SELECT
TO anon, authenticated
USING (true);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.brand_follows TO authenticated;
GRANT SELECT ON public.brand_follows TO anon;

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_brand_follows_brand_id ON public.brand_follows(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_follows_user_id ON public.brand_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_follows_created_at ON public.brand_follows(created_at);

