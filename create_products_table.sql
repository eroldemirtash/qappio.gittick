-- Products tablosunu oluştur ve RLS politikalarını ekle
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Products tablosu
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  value_qp INTEGER NOT NULL DEFAULT 0,
  stock_count INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'limited')),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'Elektronik',
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 5),
  usage_terms TEXT DEFAULT '',
  features JSONB DEFAULT '{}',
  marketplace_links JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product images tablosu
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product marketplaces tablosu
CREATE TABLE IF NOT EXISTS public.product_marketplaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS politikalarını etkinleştir
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_marketplaces ENABLE ROW LEVEL SECURITY;

-- Products için RLS politikaları
-- Herkes aktif ürünleri görebilir
CREATE POLICY "products_read_active" ON public.products
  FOR SELECT USING (is_active = true);

-- Admin her şeyi yapabilir (role kolonu varsa)
CREATE POLICY "products_admin_all" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role IS NULL)
    )
  );

-- Product images için RLS politikaları
CREATE POLICY "product_images_read" ON public.product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id AND is_active = true
    )
  );

CREATE POLICY "product_images_admin_all" ON public.product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role IS NULL)
    )
  );

-- Product marketplaces için RLS politikaları
CREATE POLICY "product_marketplaces_read" ON public.product_marketplaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id AND is_active = true
    )
  );

CREATE POLICY "product_marketplaces_admin_all" ON public.product_marketplaces
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role IS NULL)
    )
  );

-- Updated_at trigger'ı ekle
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Test verisi ekle (sadece brands tablosunda veri varsa)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.brands LIMIT 1) THEN
    INSERT INTO public.products (
      title, description, value_qp, stock_count, brand_id, category, level
    ) VALUES 
    (
      'Test Ürün 1',
      'Bu bir test ürünüdür',
      100,
      10,
      (SELECT id FROM public.brands LIMIT 1),
      'Elektronik',
      1
    ),
    (
      'Premium Ürün',
      'Yüksek seviye ürün',
      500,
      5,
      (SELECT id FROM public.brands LIMIT 1),
      'Moda',
      3
    );
    RAISE NOTICE 'Test ürünleri oluşturuldu';
  ELSE
    RAISE NOTICE 'Brands tablosu boş, test ürünleri oluşturulamadı';
  END IF;
END $$;

-- Tabloları kontrol et
SELECT 'products' as table_name, count(*) as count FROM public.products
UNION ALL
SELECT 'product_images' as table_name, count(*) as count FROM public.product_images
UNION ALL
SELECT 'product_marketplaces' as table_name, count(*) as count FROM public.product_marketplaces;
