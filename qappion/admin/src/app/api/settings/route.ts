import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET() {
  const s = sbAdmin();
  const { data, error } = await s
    .from("app_settings")
    .select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }

  const settings = data?.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as any) || {};

  return new Response(JSON.stringify({ settings }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}

export async function PATCH(request: NextRequest) {
  const s = sbAdmin();
  const body = await request.json();

  try {
    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString()
    }));

    const { error } = await s
      .from("app_settings")
      .upsert(updates);

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