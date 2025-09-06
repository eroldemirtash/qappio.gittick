import { NextRequest } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const s = sbAdmin();
    
    // Brands tablosunun schema'sını kontrol et
    const { data: brandsData, error: brandsError } = await s
      .from("brands")
      .select("*")
      .limit(5);
    
    if (brandsError) {
      console.error("BRANDS_SCHEMA_ERROR:", brandsError);
      return new Response(JSON.stringify({ error: brandsError.message }), { 
        status: 500, 
        headers: { "content-type": "application/json" }
      });
    }
    
    // Brand_profiles tablosunun varlığını kontrol et
    const { data: profilesData, error: profilesError } = await s
      .from("brand_profiles")
      .select("*")
      .limit(5);
    
    console.log("BRANDS_SCHEMA_DEBUG:");
    console.log("Brands data:", JSON.stringify(brandsData, null, 2));
    console.log("Brands error:", brandsError);
    console.log("Profiles data:", JSON.stringify(profilesData, null, 2));
    console.log("Profiles error:", profilesError);
    
    return Response.json({ 
      brands: brandsData,
      profiles: profilesData,
      brandsError: brandsError ? String(brandsError) : null,
      profilesError: profilesError?.message
    }, { headers: { "cache-control": "no-store" }});
    
  } catch (e: any) {
    console.error("BRANDS_SCHEMA_THROW:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Internal error" }), { 
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}

