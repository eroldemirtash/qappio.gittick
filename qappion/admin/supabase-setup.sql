-- Qappio Admin Panel - Supabase Setup
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Brands tablosu
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  category TEXT,
  logo_url TEXT,
  cover_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Brand Profiles tablosu
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  license_plan TEXT DEFAULT 'freemium',
  license_start DATE,
  license_end DATE,
  license_fee DECIMAL(10,2) DEFAULT 0,
  features JSONB DEFAULT '{}',
  founded_year INTEGER,
  address TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  social_facebook TEXT,
  social_linkedin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id)
);

-- 3. Missions tablosu
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  reward_points INTEGER DEFAULT 0,
  reward_amount DECIMAL(10,2) DEFAULT 0,
  cover_url TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  published BOOLEAN DEFAULT false,
  is_qappio_of_week BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Users/Profiles tablosu
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin','brand_manager','editor','viewer')) DEFAULT 'viewer',
  brand_id UUID REFERENCES brands(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Notifications tablosu
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. App Settings tablosu
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Updated_at trigger'ları (güvenli oluşturma)
DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
DROP TRIGGER IF EXISTS update_brand_profiles_updated_at ON brand_profiles;
DROP TRIGGER IF EXISTS update_missions_updated_at ON missions;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON brand_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. RLS (Row Level Security) aktif et
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policy'leri (Service role bypass eder)
-- Brands - herkese okuma, sadece service role yazma
DROP POLICY IF EXISTS "Brands are viewable by everyone" ON brands;
DROP POLICY IF EXISTS "Brands are insertable by service role" ON brands;
DROP POLICY IF EXISTS "Brands are updatable by service role" ON brands;
DROP POLICY IF EXISTS "Brands are deletable by service role" ON brands;

CREATE POLICY "Brands are viewable by everyone" ON brands FOR SELECT USING (true);
CREATE POLICY "Brands are insertable by service role" ON brands FOR INSERT WITH CHECK (true);
CREATE POLICY "Brands are updatable by service role" ON brands FOR UPDATE USING (true);
CREATE POLICY "Brands are deletable by service role" ON brands FOR DELETE USING (true);

-- Brand Profiles - herkese okuma, sadece service role yazma
DROP POLICY IF EXISTS "Brand profiles are viewable by everyone" ON brand_profiles;
DROP POLICY IF EXISTS "Brand profiles are insertable by service role" ON brand_profiles;
DROP POLICY IF EXISTS "Brand profiles are updatable by service role" ON brand_profiles;
DROP POLICY IF EXISTS "Brand profiles are deletable by service role" ON brand_profiles;

CREATE POLICY "Brand profiles are viewable by everyone" ON brand_profiles FOR SELECT USING (true);
CREATE POLICY "Brand profiles are insertable by service role" ON brand_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Brand profiles are updatable by service role" ON brand_profiles FOR UPDATE USING (true);
CREATE POLICY "Brand profiles are deletable by service role" ON brand_profiles FOR DELETE USING (true);

-- Missions - herkese okuma, sadece service role yazma
DROP POLICY IF EXISTS "Missions are viewable by everyone" ON missions;
DROP POLICY IF EXISTS "Missions are insertable by service role" ON missions;
DROP POLICY IF EXISTS "Missions are updatable by service role" ON missions;
DROP POLICY IF EXISTS "Missions are deletable by service role" ON missions;

CREATE POLICY "Missions are viewable by everyone" ON missions FOR SELECT USING (true);
CREATE POLICY "Missions are insertable by service role" ON missions FOR INSERT WITH CHECK (true);
CREATE POLICY "Missions are updatable by service role" ON missions FOR UPDATE USING (true);
CREATE POLICY "Missions are deletable by service role" ON missions FOR DELETE USING (true);

-- Profiles - herkese okuma, sadece service role yazma
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are insertable by service role" ON profiles;
DROP POLICY IF EXISTS "Profiles are updatable by service role" ON profiles;
DROP POLICY IF EXISTS "Profiles are deletable by service role" ON profiles;

CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles are insertable by service role" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles are updatable by service role" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Profiles are deletable by service role" ON profiles FOR DELETE USING (true);

-- Notifications - herkese okuma, sadece service role yazma
DROP POLICY IF EXISTS "Notifications are viewable by everyone" ON notifications;
DROP POLICY IF EXISTS "Notifications are insertable by service role" ON notifications;
DROP POLICY IF EXISTS "Notifications are updatable by service role" ON notifications;
DROP POLICY IF EXISTS "Notifications are deletable by service role" ON notifications;

CREATE POLICY "Notifications are viewable by everyone" ON notifications FOR SELECT USING (true);
CREATE POLICY "Notifications are insertable by service role" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Notifications are updatable by service role" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Notifications are deletable by service role" ON notifications FOR DELETE USING (true);

-- App Settings - herkese okuma, sadece service role yazma
DROP POLICY IF EXISTS "App settings are viewable by everyone" ON app_settings;
DROP POLICY IF EXISTS "App settings are insertable by service role" ON app_settings;
DROP POLICY IF EXISTS "App settings are updatable by service role" ON app_settings;
DROP POLICY IF EXISTS "App settings are deletable by service role" ON app_settings;

CREATE POLICY "App settings are viewable by everyone" ON app_settings FOR SELECT USING (true);
CREATE POLICY "App settings are insertable by service role" ON app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "App settings are updatable by service role" ON app_settings FOR UPDATE USING (true);
CREATE POLICY "App settings are deletable by service role" ON app_settings FOR DELETE USING (true);

-- 11. Demo data ekle
INSERT INTO brands (id, name, description, website, email, phone, category, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Nike', 'Just Do It', 'https://nike.com', 'info@nike.com', '+1-555-0123', 'spor', true),
('550e8400-e29b-41d4-a716-446655440002', 'Adidas', 'Impossible is Nothing', 'https://adidas.com', 'info@adidas.com', '+1-555-0124', 'spor', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO brand_profiles (brand_id, display_name, category, description, email, phone, website, avatar_url, cover_url, license_plan) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Nike', 'spor', 'Just Do It', 'info@nike.com', '+1-555-0123', 'https://nike.com', 'https://via.placeholder.com/100x100/000000/FFFFFF?text=N', 'https://via.placeholder.com/400x200/000000/FFFFFF?text=Nike', 'premium'),
('550e8400-e29b-41d4-a716-446655440002', 'Adidas', 'spor', 'Impossible is Nothing', 'info@adidas.com', '+1-555-0124', 'https://adidas.com', 'https://via.placeholder.com/100x100/FFFFFF/000000?text=A', 'https://via.placeholder.com/400x200/FFFFFF/000000?text=Adidas', 'premium')
ON CONFLICT (brand_id) DO NOTHING;

INSERT INTO app_settings (key, value) VALUES
('theme', '{"primary_color": "#2da2ff", "secondary_color": "#1e40af", "accent_color": "#10b981"}'),
('login', '{"logo_url": "", "facebook_enabled": false, "google_enabled": false, "apple_enabled": false, "phone_enabled": false, "terms_url": "", "privacy_url": "", "custom_css": ""}')
ON CONFLICT (key) DO NOTHING;

-- 12. Storage bucket'ları oluştur
INSERT INTO storage.buckets (id, name, public) VALUES
('brand-assets', 'brand-assets', false),
('mission-media', 'mission-media', false)
ON CONFLICT (id) DO NOTHING;

-- 13. Storage policy'leri
DROP POLICY IF EXISTS "Brand assets are accessible by service role" ON storage.objects;
DROP POLICY IF EXISTS "Mission media is accessible by service role" ON storage.objects;

CREATE POLICY "Brand assets are accessible by service role" ON storage.objects FOR ALL USING (bucket_id = 'brand-assets');
CREATE POLICY "Mission media is accessible by service role" ON storage.objects FOR ALL USING (bucket_id = 'mission-media');

-- Tamamlandı! 🎉
