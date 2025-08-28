#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Qappion — Supabase ortam değişkenleri kurulum sihirbazı"
echo "--------------------------------------------------------"

# === Sabitler (senden gelen bilgiler) ===
SUPABASE_URL="https://vjphawsjdfdvkeyysvbb.supabase.co"
PROJECT_REF="vjphawsjdfdvkeyysvbb"

# === 0) Proje kökü doğrula ===
ROOT="$(pwd)"
if [ ! -f "$ROOT/package.json" ]; then
  echo "❌ package.json bulunamadı. Doğru klasöre girip tekrar çalıştır."
  exit 1
fi

# === 1) Klasörleri saptama (mobil & admin) ===
MOBILE_DIR="$ROOT"
if [ ! -f "$ROOT/app.json" ] && [ ! -f "$ROOT/app.config.ts" ]; then
  if [ -f "$ROOT/mobile/app.json" ] || [ -f "$ROOT/mobile/app.config.ts" ]; then
    MOBILE_DIR="$ROOT/mobile"
  fi
fi

ADMIN_DIR=""
if [ -f "$ROOT/package.json" ] && grep -q "\"next\"" "$ROOT/package.json"; then
  ADMIN_DIR="$ROOT"
elif [ -d "$ROOT/admin" ] && [ -f "$ROOT/admin/package.json" ] && grep -q "\"next\"" "$ROOT/admin/package.json"; then
  ADMIN_DIR="$ROOT/admin"
fi

echo "📁 ROOT       : $ROOT"
echo "📱 MOBILE DIR : $MOBILE_DIR"
echo "🖥️  ADMIN DIR  : ${ADMIN_DIR:-'(bulunamadı - atlanacak)'}"
echo

# === 2) Kullanıcıdan anahtarları al ===
echo "🔑 Supabase API sayfasını aç:"
echo "    https://app.supabase.com/project/${PROJECT_REF}/settings/api"
echo
read -p "🟢 anon public key (ey...): " SUPABASE_ANON
read -p "🟡 service role key [sadece admin server için] (ey...) (boş geçilebilir): " SUPABASE_SERVICE || true

if [[ -z "$SUPABASE_ANON" ]]; then
  echo "❌ anon public key zorunlu."
  exit 1
fi

# === 3) .gitignore güvenliği ===
if [ ! -f "$ROOT/.gitignore" ] || ! grep -qE '^\.(env|env\..*)$' "$ROOT/.gitignore"; then
  echo -e "\n.env\n.env.*" >> "$ROOT/.gitignore" || true
  echo "🛡️  .gitignore güncellendi (.env korumada)"
fi

# === 4) Expo (Mobil) .env + client ===
(
  cd "$MOBILE_DIR"
  echo "📝 Expo .env yazılıyor → $MOBILE_DIR/.env"
  cat > .env <<EOF
EXPO_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON}
EOF

  # app.config.ts yoksa minimal oluştur
  if [ ! -f "app.config.ts" ]; then
    echo "🆕 app.config.ts oluşturuluyor"
    cat > app.config.ts <<'EOF'
import type { ExpoConfig } from "expo/config";
const config: ExpoConfig = {
  name: "Qappion",
  slug: "qappion",
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};
export default config;
EOF
  fi

  # client
  mkdir -p src/lib
  cat > src/lib/supabase.ts <<'EOF'
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra || {}) as any;
const supabaseUrl = extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnon = extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnon);
EOF

  echo "✅ Expo env ve client hazır."
)

# === 5) Next.js Admin varsa .env.local + server/service client ===
if [ -n "$ADMIN_DIR" ]; then
  (
    cd "$ADMIN_DIR"
    echo "📝 Next.js .env.local yazılıyor → $ADMIN_DIR/.env.local"
    cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON}
EOF

    if [ -n "${SUPABASE_SERVICE:-}" ]; then
      cat >> .env.local <<EOF
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE}
EOF
    else
      echo "⚠️  service role key girilmedi; admin'de RLS bypass gereken işlemler çalışmayabilir."
    fi

    mkdir -p lib/supabase
    cat > lib/supabase/server.ts <<'EOF'
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function supabaseServer() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookies().get(name)?.value,
      },
    }
  );
}
EOF

    cat > lib/supabase/service.ts <<'EOF'
import "server-only";
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
EOF

    echo "✅ Next.js env ve admin client'lar hazır."
  )
fi

echo
echo "🎉 Kurulum tamam."
echo "🔎 Doğrulama:"
echo "  • Expo:   cat \"$MOBILE_DIR/.env\""
[ -n "$ADMIN_DIR" ] && echo "  • Admin:  cat \"$ADMIN_DIR/.env.local\""
echo
echo "🚀 Kullanım:"
echo "  • Mobil:  npx expo start -c"
[ -n "$ADMIN_DIR" ] && echo "  • Admin:  npm run dev   (Next.js)"
