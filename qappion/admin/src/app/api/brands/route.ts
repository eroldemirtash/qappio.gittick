import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET() {
  const s = sbAdmin();
  const { data, error } = await s
    .from("brands")
    .select(`
      id, name, is_active, created_at,
      brand_profiles (
        id, avatar_url, cover_url, description, website_url, instagram_url, twitter_url
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }

  return new Response(JSON.stringify({ items: data || [] }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}

export async function POST(request: NextRequest) {
  const s = sbAdmin();
  const body = await request.json();
  const { name, description, website_url, instagram_url, twitter_url } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: "Name is required" }), { 
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  try {
    // Create brand
    const { data: brand, error: brandError } = await s
      .from("brands")
      .insert({ name, is_active: true })
      .select()
      .single();

    if (brandError) throw brandError;

    // Create brand profile
    const { error: profileError } = await s
      .from("brand_profiles")
      .insert({
        brand_id: brand.id,
        description,
        website_url,
        instagram_url,
        twitter_url
      });

    if (profileError) throw profileError;

    return new Response(JSON.stringify({ success: true, brand }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
