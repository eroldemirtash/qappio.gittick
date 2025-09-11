import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const s = sbAdmin();

    const [brandsRes, missionsRes, productsRes] = await Promise.all([
      s.from("brands").select("id,name,created_at,updated_at,brand_profiles(display_name,category)").order("created_at", { ascending: false }),
      s.from("missions").select("id,title,brand_id,created_at,updated_at,published").order("created_at", { ascending: false }),
      s.from("products").select("id,title,brand_id,created_at,updated_at,is_active").order("created_at", { ascending: false }),
    ]);

    const snapshot = {
      env: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "missing",
      },
      brands: {
        error: (brandsRes as any)?.error?.message || null,
        count: Array.isArray(brandsRes.data) ? brandsRes.data.length : 0,
        sample: Array.isArray(brandsRes.data) ? brandsRes.data.slice(0, 5) : [],
      },
      missions: {
        error: (missionsRes as any)?.error?.message || null,
        count: Array.isArray(missionsRes.data) ? missionsRes.data.length : 0,
        sample: Array.isArray(missionsRes.data) ? missionsRes.data.slice(0, 5) : [],
      },
      products: {
        error: (productsRes as any)?.error?.message || null,
        count: Array.isArray(productsRes.data) ? productsRes.data.length : 0,
        sample: Array.isArray(productsRes.data) ? productsRes.data.slice(0, 5) : [],
      },
    };

    return NextResponse.json(snapshot, { headers: { "cache-control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}


