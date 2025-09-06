-- Test verileri
-- Markalar
INSERT INTO brands (id, name, is_active, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Nike', true, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Adidas', true, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Apple', true, NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Samsung', true, NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Coca Cola', true, NOW());

-- Marka profilleri
INSERT INTO brand_profiles (brand_id, display_name, logo_url, cover_url, description, website, category, license_plan, license_start, license_end, license_fee) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop&crop=center', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=200&fit=crop&crop=center', 'Just Do It', 'https://nike.com', 'sports', 'premium', NOW(), NOW() + INTERVAL '1 year', 1000),
('550e8400-e29b-41d4-a716-446655440002', 'Adidas', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=100&h=100&fit=crop&crop=center', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=200&fit=crop&crop=center', 'Impossible is Nothing', 'https://adidas.com', 'sports', 'premium', NOW(), NOW() + INTERVAL '1 year', 1000),
('550e8400-e29b-41d4-a716-446655440003', 'Apple', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop&crop=center', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=200&fit=crop&crop=center', 'Think Different', 'https://apple.com', 'technology', 'premium', NOW(), NOW() + INTERVAL '1 year', 2000),
('550e8400-e29b-41d4-a716-446655440004', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop&crop=center', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=200&fit=crop&crop=center', 'Innovation for Everyone', 'https://samsung.com', 'technology', 'premium', NOW(), NOW() + INTERVAL '1 year', 1500),
('550e8400-e29b-41d4-a716-446655440005', 'Coca Cola', 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=100&h=100&fit=crop&crop=center', 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=200&fit=crop&crop=center', 'Taste the Feeling', 'https://coca-cola.com', 'beverage', 'premium', NOW(), NOW() + INTERVAL '1 year', 800);

-- Görevler
INSERT INTO missions (id, title, short_description, brand_id, cover_url, qp_reward, is_published, starts_at, ends_at, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Nike Air Max Fotoğrafı', 'Nike Air Max ayakkabınızla fotoğraf çekin ve paylaşın', '550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center', 500, true, NOW(), NOW() + INTERVAL '30 days', NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'Adidas Ultraboost Deneyimi', 'Adidas Ultraboost ile koşu deneyiminizi paylaşın', '550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center', 750, true, NOW(), NOW() + INTERVAL '30 days', NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'iPhone 15 Pro İncelemesi', 'iPhone 15 Pro hakkında detaylı inceleme yazın', '550e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center', 1000, true, NOW(), NOW() + INTERVAL '30 days', NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'Samsung Galaxy S24 Testi', 'Samsung Galaxy S24 telefonunu test edin', '550e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center', 800, true, NOW(), NOW() + INTERVAL '30 days', NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'Coca Cola Zero Deneyimi', 'Coca Cola Zero içeceğini deneyin', '550e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=400&fit=crop&crop=center', 300, true, NOW(), NOW() + INTERVAL '30 days', NOW());
