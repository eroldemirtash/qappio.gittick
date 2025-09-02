# Qappion MVP

Markalar için içerik üretimi platformu. Kullanıcılar görevleri tamamlayarak QP (Qappion Points) kazanır, ödül marketinden hediyeler alır.

## 🚀 Tech Stack

- **Mobile**: React Native + Expo + TypeScript + expo-router
- **Admin**: Next.js 14 + Tailwind + shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **State**: Zustand
- **Forms**: React Hook Form + Zod

## 📱 Özellikler

### Mobile App
- 📧 Email/Phone OTP Auth
- 🎯 Mission Feed (göreve katılım)
- 📸 Photo/Video Upload
- ❤️ Like sistemi ve puanlama  
- 💰 QP Cüzdan ve işlem geçmişi
- 🎁 Ödül Marketi
- 📍 Geofence kontrolü
- 🔔 Push Notifications

### Admin Panel
- 🏢 Marka ve mağaza yönetimi
- ✏️ Mission oluşturma/düzenleme
- ✅ İçerik moderasyonu
- 🏆 Mission sonlandırma (winner selection)
- 🎁 Ödül yönetimi
- 👥 Kullanıcı analtiği

## ⚡ Hızlı Başlangıç

### 1. Supabase Kurulumu

```bash
# Supabase projesi oluştur
# https://app.supabase.com/projects

# Database şemasını yükle
psql -h your-project.supabase.co -U postgres -d postgres < supabase/schema.sql
psql -h your-project.supabase.co -U postgres -d postgres < supabase/policies.sql
psql -h your-project.supabase.co -U postgres -d postgres < supabase/seed.sql

# Storage bucket oluştur (Supabase Dashboard)
# Bucket name: mission-media (private)
```

### 2. Mobile App

```bash
cd "/Users/eroldemirtas/Qappio-Gittick/mobile"
cp .env.example .env
# .env dosyasını Supabase bilgileriyle güncelle

npm install
npx expo start -c --tunnel
```

### 3. Admin Panel

```bash
cd "/Users/eroldemirtas/Qappio-Gittick/qappion/admin"
cp .env.example .env  
# .env dosyasını Supabase bilgileriyle güncelle

npm install
npm run dev
```

## 🎯 Puan Sistemi

- **Post QP**: +20 (görevde paylaşım)
- **Like QP**: +1 (beğeni alan içerik sahibine)
- **Share QP**: +10 (dış platform paylaşımı beyanı)
- **Winner Bonus**: Mission reward_qp (en çok beğeni alan)

## 🏆 Level Sistemi

- **L1 Seeker**: 0–999 QP
- **L2 Explorer**: 1000–4999 QP
- **L3 Creator**: 5000–14999 QP
- **L4 Influencer**: 15000–39999 QP
- **L5 Legend**: 40000+ QP

## 📊 Database Schema

```sql
-- Ana tablolar
profiles         # Kullanıcı profilleri
brands           # Markalar
stores           # Mağaza lokasyonları
missions         # Görevler
submissions      # Kullanıcı gönderileri
likes            # Beğeniler (tekil)
wallet_txns      # QP işlemleri
rewards          # Ödüller
redemptions      # Ödül talepleri

-- Views
user_balances    # lifetime_earned_qp, spendable_qp
```

## 🔧 Development

### Mobile Hot Reload
```bash
cd "/Users/eroldemirtas/Qappio-Gittick/mobile"
npx expo start -c --tunnel  # Clear cache
```

### Admin Development
```bash
cd "/Users/eroldemirtas/Qappio-Gittick/qappion/admin"
npm run dev
```

### Database Migration
```bash
# Yeni migration ekle
psql < supabase/new_migration.sql
```

## 🧪 Test Scenarios

### Temel Akış Testi
1. ✅ Email/Phone OTP ile giriş
2. ✅ Onboarding (şehir, ilgi alanları)
3. ✅ Mission feed görüntüleme
4. ✅ Mission detay → submission upload
5. ✅ Admin → submission approve
6. ✅ Like atma → QP kazanma
7. ✅ Cüzdan bakiye kontrolü
8. ✅ Ödül talep etme

### Geofence Testi
1. Mission'da konum şartı varsa
2. Kullanıcı radius dışındaysa hata
3. Radius içindeyse upload başarılı

### Mission Finalize
1. Admin mission'ı "Finalize" eder
2. En çok like alan submission bulunur
3. Winner'a reward_qp eklenir
4. Mission status "closed" olur

## 🚨 Güvenlik

- RLS politikaları aktif
- Service role key sadece server-side
- Storage private + signed URL
- Input validation (Zod schemas)

## 📱 Push Notifications

```bash
# Expo push token kayıt
expo install expo-notifications
# profiles.push_token alanında saklanır
```

## 🔄 Realtime Features

- Yeni mission publish → feed update
- Submission approve → notification
- Like → real-time count update

## 📈 Next Steps (V2)

- [ ] Gerçek dış-platform paylaşım doğrulaması
- [ ] Gelişmiş analytics dashboard
- [ ] Cron jobs (auto mission finalize)
- [ ] Multi-language support
- [ ] Advanced search & filters

## 🤝 Contributing

1. Feature branch oluştur
2. Conventional commits kullan
3. Test senaryolarını kontrol et
4. PR açıklamasında screenshot ekle

---

**Ship > Perfect** 🚀 Basit tut, önce çalıştır, sonra parlat.
