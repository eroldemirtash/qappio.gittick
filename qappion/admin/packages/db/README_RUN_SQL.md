# Migration SQL Çalıştırma

## Adımlar:

1. **Supabase Dashboard'a Git:**
   - https://supabase.com/dashboard
   - `euscyxsglpwadhzvjazn` projesini seç

2. **SQL Editor'ı Aç:**
   - Sol menüden **SQL Editor** → **New Query**

3. **Migration SQL'ini Kopyala ve Çalıştır:**
   - `2025-09-02_missions_panel_lock.sql` dosyasındaki içeriği kopyala
   - SQL Editor'a yapıştır
   - **Run** butonuna tıkla

4. **Kontrol Et:**
   - Hata mesajı yoksa başarılı
   - Table Editor'dan `missions` tablosunu kontrol et
   - Yeni kolonların eklendiğini gör

## Beklenen Sonuç:
- ✅ `cover_url` kolonu eklendi
- ✅ `is_from_panel` kolonu eklendi  
- ✅ `is_active` kolonu eklendi
- ✅ `starts_at` ve `ends_at` kolonları eklendi
- ✅ RLS politikası aktif
- ✅ Mevcut görevler `is_from_panel = true` olarak işaretlendi
