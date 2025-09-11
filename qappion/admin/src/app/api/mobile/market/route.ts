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

export async function GET(_req: NextRequest) {
  try {
    const { data, error } = await sbAdmin()
      .from("products")
      .select("id, title, value_qp, cover_url, stock, category, brand_id, is_active, created_at, brands(name,logo_url)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return withCors(NextResponse.json({ error: "Failed to fetch products" }, { status: 500 }));
    }

    const items = (data || []).map((p: any) => ({
      id: p.id,
      name: p.title,
      price: p.value_qp,
      image: p.cover_url,
      brandId: p.brand_id || "",
      brandName: p.brands?.name || "",
      brandLogo: p.brands?.logo_url || "",
      stock: typeof p.stock === 'number' ? p.stock : 0,
      level: 1,
      category: p.category || "Elektronik",
    }));

    return withCors(NextResponse.json({ items }));
  } catch (e) {
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
  }
}


