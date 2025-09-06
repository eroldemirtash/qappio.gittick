# Qappio Mobile

React Native + Expo uygulaması

## Kurulum

```bash
cd mobile
cp .env.example .env   # değerleri app.json -> extra'ya da yaz
npm i
npx expo install --fix
npx expo start --tunnel
```

## Temizlik

```bash
rm -rf node_modules ~/.expo && npm cache clean --force
npm i && npx expo start -c
```

## Özellikler

- ✅ Expo Router (file-based navigation)
- ✅ NativeWind (Tailwind CSS)
- ✅ Supabase (Auth + Database)
- ✅ Zustand (State management)
- ✅ React Hook Form + Zod (Forms)
- ✅ Expo Notifications (Push)
- ✅ React Native Maps (Location)
- ✅ Expo Image Picker (Media)

## Proje Yapısı

```
app/
  (tabs)/          # Ana tab'lar
  (auth)/          # Giriş sayfaları
  (onboarding)/    # Onboarding
  missions/        # Görev detayları
  submit/          # Görev yükleme
  messages/        # Mesajlar
  notifications/   # Bildirimler

src/
  lib/             # Supabase client
  store/           # Zustand stores
  features/        # Feature-based kod
  utils/           # Yardımcı fonksiyonlar
  components/      # Paylaşılan komponentler
```

## Test

```bash
npm test
```
