-- Missions tablosuna eksik kolonları ekle
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Description kolonunu ekle
ALTER TABLE missions ADD COLUMN IF NOT EXISTS description TEXT;

-- Diğer eksik kolonları da ekle (güvenli)
ALTER TABLE missions ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS is_qappio_of_week BOOLEAN DEFAULT false;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS reward_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Kolonları kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'missions' 
ORDER BY ordinal_position;
