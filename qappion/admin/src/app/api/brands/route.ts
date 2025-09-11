import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const baseSelect = `
      id, name, logo_url, is_active, created_at, updated_at,
      brand_profiles(*)
    `;

    const firstTry = await sbAdmin()
      .from("brands")
      .select(baseSelect)
      .order("name", { ascending: true });

    if (!firstTry.error) {
      const list = (firstTry.data || []) as any[];
      console.log(`✅ Fetched ${list.length} brands from Supabase`);

      // Robust join: fetch brand_profiles separately and merge by brand_id
      try {
        const brandIds = list.map((b: any) => b.id).filter(Boolean);
        if (brandIds.length > 0) {
          const { data: profiles } = await sbAdmin()
            .from("brand_profiles")
            .select("*")
            .in("brand_id", brandIds);
          const byBrandId = new Map((profiles || []).map((p: any) => [p.brand_id, p]));
          for (const b of list) {
            b.brand_profiles = byBrandId.get(b.id) || b.brand_profiles || null;
            // Fallback: mirror avatar to logo_url if empty
            if (!b.logo_url && b.brand_profiles?.avatar_url) b.logo_url = b.brand_profiles.avatar_url;
          }
        }
      } catch {}

      return NextResponse.json({ brands: list, items: list }, { headers: { "cache-control": "no-store" } });
    }

    const error = firstTry.error;
    console.error("Supabase error (brands first try):", error.message);

    // Fallback to minimal select without relation
    const secondTry = await sbAdmin()
      .from("brands")
      .select("*")
      .order("name", { ascending: true });

    if (!secondTry.error) {
      const list = secondTry.data || [];
      return NextResponse.json({ brands: list, items: list }, { headers: { "cache-control": "no-store" } });
    }

    const error2 = secondTry.error;
    console.error("Supabase error (brands second try):", error2.message);

    // Final fallback: avoid 500, return empty
    return NextResponse.json({ brands: [], items: [] }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ brands: [], items: [] }, { headers: { "cache-control": "no-store" } });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      return NextResponse.json({ error: "Supabase service key eksik veya geçersiz (placeholder)." }, { status: 500 });
    }
    const name = body?.name as string | undefined;
    const display_name = (body?.display_name as string | undefined) || name?.trim();
    const email = body?.email as string | null | undefined;
    const phone = body?.phone as string | null | undefined;
    const website = body?.website as string | null | undefined;
    const avatar_url = body?.avatar_url as string | null | undefined;
    const category = body?.category as string | null | undefined;
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "invalid_name" }, { status: 400 });
    }
    
    try {
      const { data, error } = await sbAdmin()
        .from("brands")
        .insert({ name: name.trim(), is_active: true })
        .select(`
          id, 
          name, 
          logo_url,
          is_active,
          created_at,
          updated_at,
          brand_profiles (
            display_name,
            category,
            email,
            phone,
            website,
            avatar_url,
            license_plan
          )
        `)
        .single();
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Auto-create minimal brand profile if fields exist
      if (data?.id) {
        const shouldCreateProfile = Boolean(display_name || email || phone || website || avatar_url || category);
        if (shouldCreateProfile) {
          const { error: upsertErr } = await sbAdmin()
            .from("brand_profiles")
            .upsert({
              brand_id: data.id,
              display_name: display_name || data.name,
              email: email ?? null,
              phone: phone ?? null,
              website: website ?? null,
              avatar_url: avatar_url ?? data.logo_url ?? null,
              category: category ?? null,
            }, { onConflict: "brand_id" });
          if (upsertErr) throw upsertErr;

          if (avatar_url) {
            const { error: logoErr } = await sbAdmin()
              .from("brands")
              .update({ logo_url: avatar_url })
              .eq("id", data.id);
            if (logoErr) throw logoErr;
          }
        }
      }
      
      console.log('✅ Created brand in Supabase:', data);
      // Compatibility: return flat id alongside item
      return NextResponse.json({ id: data?.id, item: data }, { status: 201 });
    } catch (error: any) {
      console.error("Brand creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch (e: any) {
    console.error("Brand creation error:", e);
    return NextResponse.json({ error: e?.message || "create_failed" }, { status: 500 });
  }
}