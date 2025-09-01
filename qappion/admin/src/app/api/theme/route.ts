import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET() {
  const s = sbAdmin();
  const { data, error } = await s
    .from("app_settings")
    .select("value")
    .eq("key", "theme")
    .single();

  if (error && error.code !== 'PGRST116') {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }

  return new Response(JSON.stringify({ theme: data?.value || {} }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}

export async function PATCH(request: NextRequest) {
  const s = sbAdmin();
  const body = await request.json();
  const { theme } = body;

  try {
    const { error } = await s
      .from("app_settings")
      .upsert({
        key: "theme",
        value: theme,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}