import { sbAdmin } from "@/lib/supabase-admin";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET() {
  const s = sbAdmin();
  
  // Market tablosu henüz yok, boş döndür
  return new Response(JSON.stringify({ items: [] }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}