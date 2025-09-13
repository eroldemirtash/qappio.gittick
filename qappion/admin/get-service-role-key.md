# Supabase Service Role Key Alma

## Adımlar:

1. **Supabase Studio'ya git:**
   - https://app.supabase.com/project/euscyxsglpwadhzvjazn/settings/api

2. **Service Role Key'i kopyala:**
   - "service_role" anahtarını kopyala (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ile başlar)

3. **Environment dosyasını güncelle:**
   ```bash
   cd qappion/admin
   nano .env.local
   ```

4. **Service role key'i ekle:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (gerçek key)
   ```

5. **Admin panelini yeniden başlat:**
   ```bash
   pkill -f "next dev" && npm run dev
   ```

## Not:
- Service role key'i güvenli tutun, public repository'ye commit etmeyin
- Bu key ile RLS politikalarını bypass edebilirsiniz
