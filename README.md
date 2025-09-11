# Qappio Monorepo

Monorepo yapısı: pnpm workspaces

## Yapı
- `qappion/admin` — Next.js (App Router)
- `qappion/mobile` — Expo (SDK 53)
- `supabase` — SQL/migrations

## Kurulum
```bash
# root
pnpm i
```

## Çalıştırma
```bash
# Admin
cd qappion/admin && pnpm dev

# Mobile
cd qappion/mobile && pnpm start
```

## Env
Kök `.env.example` dosyasını referans alarak `.env` oluşturun. Gerçek anahtarları commit etmeyin.

## CI
- Admin: Next build (klasör içinde)
- Mobile: Expo doctor + lint placeholder
- Supabase: migrations klasörü dry-run kontrolü

## LFS
Mobil assetler ve tüm görseller Git LFS altında izlenir.
