# Test Senaryosu

## 1) ENV Kontrolü
```bash
# Admin
cd qappion/admin
cat .env.local | grep SUPABASE_URL
# Beklenen: https://euscyxsglpwadhzvjazn.supabase.co

# Mobile  
cd ../../mobile
cat .env | grep SUPABASE_URL
# Beklenen: https://euscyxsglpwadhzvjazn.supabase.co
```

## 2) Migration SQL Çalıştır
- Supabase Dashboard → SQL Editor
- `packages/db/migrations/2025-09-02_missions_panel_lock.sql` içeriğini çalıştır

## 3) Admin Panel'den Görev Oluştur
- Admin panel'i başlat: `npm run dev`
- 2 yeni görev oluştur
- Görevler otomatik olarak `is_from_panel = true` olacak

## 4) Mobil App Test
```bash
cd ../../mobile
npx expo start --tunnel --clear
```

## 5) Beklenen Sonuç
- ✅ Sadece panel'den oluşturulan görevler görünür
- ✅ Mock/fallback veriler görünmez
- ✅ Boş görsel uyarıları yok
- ✅ Cache temizlendi

## 6) Kontrol
- Supabase Table Editor'da `missions` tablosunu kontrol et
- `is_from_panel = true` olan görevlerin sayısını kontrol et
- Mobil app'te aynı sayıda görev görünmeli
