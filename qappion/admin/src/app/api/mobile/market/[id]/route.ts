import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('🔍 Mobile product detail API called with id:', id);
    
    // Basit sorgu - sadece temel alanlar
    const { data, error } = await sbAdmin()
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    console.log('🔍 Mobile API Supabase response:', { data, error });

    if (error || !data) {
      console.log('❌ Mobile API error or no data:', error);
      return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));
    }

    // Brand bilgilerini ayrı sorgu ile al
    let brand = null;
    if (data.brand_id) {
      const { data: brandData } = await sbAdmin()
        .from("brands")
        .select("id, name, logo_url")
        .eq("id", data.brand_id)
        .maybeSingle();
      brand = brandData;
    }
    
    console.log('🔍 Mobile API brand data:', { brand });
    
    const item = {
      id: data.id,
      name: data.title,
      description: data.description ?? "",
      price: data.value_qp,
      image: data.cover_url,
      gallery: data.gallery ?? [],
      features: data.features ?? [],
      marketplace: data.marketplace_links ?? [],
      brandId: data.brand_id,
      brandName: brand?.name || "Bilinmeyen Marka",
      brandLogo: brand?.logo_url || "",
      brandWebsite: "",
      brandEmail: "",
      brandCover: "",
      brandSocials: {
        instagram: "",
        twitter: "",
        facebook: "",
        linkedin: "",
      },
      brand: brand ? {
        id: brand.id,
        name: brand.name,
        logo_url: brand.logo_url,
        brand_profiles: null
      } : null,
    };
    
    console.log('🔍 Mobile API final item:', item);

    return withCors(NextResponse.json({ item }));
  } catch (e) {
    console.log('❌ Mobile API exception:', e);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
  }
}


