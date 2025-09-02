# Qappio Mobile MVP

React Native + Expo SDK 53 ile geliştirilmiş Qappio mobil uygulaması.

## Özellikler

- ✅ OTP ile giriş sistemi
- ✅ Onboarding akışı (ilgi alanları, şehir, konum izni)
- ✅ 5 tab'lı navigasyon (Akış, Market, Qappiolar, Cüzdan, Profil)
- ✅ Instagram-vari feed kartları
- ✅ Görev detayı ve yükleme
- ✅ Konum tabanlı geofence kontrolü
- ✅ Supabase entegrasyonu
- ✅ NativeWind ile modern UI

## Tech Stack

- **Framework**: React Native + Expo SDK 53
- **Navigation**: expo-router (file-based)
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Backend**: Supabase (Auth, Postgres, Storage, RLS)
- **UI**: NativeWind (Tailwind for RN)
- **Maps**: react-native-maps + expo-location
- **Upload**: expo-image-picker
- **Push**: expo-notifications

## Kurulum

1. **Bağımlılıkları yükle:**
```bash
cd mobile
npm install
```

2. **Environment ayarları:**
```bash
cp env.example .env
```

3. **Supabase konfigürasyonu:**
`app.json` dosyasında `extra` bölümünde Supabase URL ve anon key'i güncelle:
```json
{
  "expo": {
    "extra": {
      "SUPABASE_URL": "https://your-project.supabase.co",
      "SUPABASE_ANON_KEY": "your-anon-key"
    }
  }
}
```

4. **Uygulamayı başlat:**
```bash
npx expo start
```

## Proje Yapısı

```
mobile/
├── app/                    # expo-router sayfaları
│   ├── (auth)/            # Giriş sayfaları
│   ├── (onboarding)/      # Onboarding akışı
│   ├── (tabs)/            # Ana tab'lar
│   ├── missions/[id].tsx  # Görev detayı
│   └── submit/[missionId].tsx # Görev yükleme
├── src/
│   ├── lib/supabase.ts    # Supabase client
│   ├── store/             # Zustand store'ları
│   ├── features/          # Feature-based organizasyon
│   ├── utils/             # Yardımcı fonksiyonlar
│   └── components/        # Paylaşılan komponentler
└── __tests__/             # Test dosyaları
```

## Ana Özellikler

### Auth Akışı
- Email ile OTP girişi
- Otomatik profil oluşturma
- Onboarding akışı

### Feed
- Supabase'den gerçek veri çekme
- Instagram-vari kart tasarımı
- Beğeni, yorum, paylaşım
- Realtime güncellemeler

### Görev Sistemi
- Görev detayı görüntüleme
- Fotoğraf/video yükleme
- Konum tabanlı geofence kontrolü
- Supabase Storage entegrasyonu

### UI/UX
- Koyu tema
- NativeWind ile modern tasarım
- Responsive layout
- Smooth animasyonlar

## Test

```bash
npm test
```

## Geliştirme

```bash
# Metro cache temizle
npx expo start -c

# Bağımlılık sorunları için
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
```

## Deployment

```bash
# Build al
npx expo build:android
npx expo build:ios

# EAS Build (önerilen)
npx eas build --platform android
npx eas build --platform ios
```

## Notlar

- Tüm veriler Supabase'den gelir (mock yok)
- RLS politikaları aktif
- Storage private bucket kullanır
- Push notifications hazır (token kaydı)
- TypeScript strict mode aktif
