import { sbAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const s = sbAdmin();
    const body = await req.json().catch(() => ({}));

    // Sadece izin verilen alanları geçir
    const patch: Record<string, any> = {};
    const ALLOWED = [
      "display_name","handle","description","email","phone","website","category",
      "founded_year","address","instagram","twitter","facebook","linkedin",
      "license_plan","license_start","license_end","license_fee",
      "feat_mission_create","feat_user_mgmt","feat_analytics","feat_api_access","feat_priority_support",
      "avatar_url","cover_url",
    ];
    for (const k of ALLOWED) if (k in body) patch[k] = body[k];

    // upsert: profil yoksa oluşturur, varsa günceller
    const { data, error } = await s
      .from("brand_profiles")
      .upsert({ brand_id: params.id, ...patch }, { onConflict: "brand_id" })
      .select("*")
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ item: data }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (err: any) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

