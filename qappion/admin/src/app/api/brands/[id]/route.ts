import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const s = sbAdmin();
    
    const { data, error } = await s
      .from("brands")
      .select(`
        id,
        name,
        is_active,
        created_at,
        brand_profiles (
          logo_url,
          avatar_url,
          display_name,
          category,
          description,
          email,
          phone,
          cover_url,
          website,
          social_instagram,
          social_twitter,
          social_facebook,
          social_linkedin,
          license_plan,
          license_start,
          license_end,
          license_fee,
          features,
          address
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("BRAND_GET_ERROR:", error.message);
      return new Response(error.message, { status: 500 });
    }

    return Response.json({ item: data }, { headers: { "cache-control": "no-store" }});

  } catch (e: any) {
    console.error("BRAND_GET_THROW:", e?.message || e);
    return new Response(e?.message || "Internal error", { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const s = sbAdmin();
    const { error } = await s
      .from("brands")
      .update(body)
      .eq("id", id);

    if (error) {
      console.error("BRANDS_PATCH_ERROR:", error.message);
      return new Response(error.message, { status: 500 });
    }

    return Response.json({ ok: true }, { headers: { "cache-control": "no-store" }});

  } catch (e: any) {
    console.error("BRANDS_PATCH_THROW:", e?.message || e);
    return new Response(e?.message || "Internal error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const s = sbAdmin();

    // Önce brand_profiles tablosundan sil
    const { error: profileError } = await s
      .from("brand_profiles")
      .delete()
      .eq("brand_id", id);

    if (profileError) {
      console.error("BRAND_PROFILE_DELETE_ERROR:", profileError.message);
      // Profile yoksa devam et
    }

    // Sonra brands tablosundan sil
    const { error: brandError } = await s
      .from("brands")
      .delete()
      .eq("id", id);

    if (brandError) {
      console.error("BRAND_DELETE_ERROR:", brandError.message);
      return new Response(brandError.message, { status: 500 });
    }

    return Response.json({ ok: true }, { headers: { "cache-control": "no-store" }});

  } catch (e: any) {
    console.error("BRAND_DELETE_THROW:", e?.message || e);
    return new Response(e?.message || "Internal error", { status: 500 });
  }
}