import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET(req: Request) {
  try {
    const s = sbAdmin();
    const url = new URL(req.url);
    const active = url.searchParams.get("active"); // "true" | "false" | null

    let q = s.from("brands")
      .select(`
        id,
        name,
        is_active,
        created_at,
        description,
        website,
        email,
        phone,
        category,
        brand_profiles (
          display_name,
          category,
          description,
          email,
          phone,
          website,
          avatar_url,
          license_plan
        )
      `)
      .order("created_at", { ascending: false })
      .limit(200);

    if (active === "true")  q = q.eq("is_active", true);
    if (active === "false") q = q.eq("is_active", false);

    const { data, error } = await q;
    if (error) {
      console.error("BRANDS_GET_ERROR:", error.message);
      console.error("BRANDS_GET_ERROR_DETAILS:", error);
      return new Response(JSON.stringify({ error: error.message, details: error }), { 
        status: 500, 
        headers: { "content-type": "application/json" }
      });
    }
    
    console.log("BRANDS_RAW_DATA:", JSON.stringify(data, null, 2));
    console.log("BRANDS_COUNT:", data?.length || 0);
    
    return Response.json({ items: data ?? [] }, { headers: { "cache-control": "no-store" }});
  } catch (e: any) {
    console.error("BRANDS_GET_THROW:", e?.message || e);
    console.error("BRANDS_GET_THROW_DETAILS:", e);
    return new Response(JSON.stringify({ error: e?.message || "Internal error", details: e }), { 
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, website, email, phone, category, is_active } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: "Name is required" }), { 
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      // Return demo data when Supabase is not configured
      const brandId = `brand-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return new Response(JSON.stringify({ 
        item: {
          id: brandId,
          name: name,
          description: description || null,
          website: website || null,
          email: email || null,
          phone: phone || null,
          category: category || null,
          is_active: !!is_active,
          created_at: new Date().toISOString()
        }
      }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    
    // Create brand
    const { data: brand, error: brandError } = await s
      .from("brands")
      .insert({ 
        name, 
        description: description || null,
        website: website || null,
        email: email || null,
        phone: phone || null,
        category: category || null,
        is_active: !!is_active 
      })
      .select()
      .single();

    if (brandError) throw brandError;

    return new Response(JSON.stringify({ item: brand }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
