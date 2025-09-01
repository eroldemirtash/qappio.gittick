import { sbAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const s = sbAdmin();
    const url = new URL(req.url);
    const active = url.searchParams.get("active");
    
    let q = s.from("brands")
      .select("id,name,is_active,created_at,updated_at,brand_profiles(avatar_url,display_name)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (active === "true") q = q.eq("is_active", true);
    if (active === "false") q = q.eq("is_active", false);

    const { data, error } = await q;
    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ items: [] }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }
    
    return new Response(JSON.stringify({ items: data ?? [] }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (err: any) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ items: [] }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}

export async function POST(req: Request) {
  try {
    const s = sbAdmin();
    const body = await req.json().catch(() => ({}));
    
    if (!body.name || String(body.name).trim().length < 2) {
      return new Response(JSON.stringify({ error: "Marka adı zorunlu" }), { status: 400 });
    }

    const { data, error } = await s.from("brands")
      .insert({
        name: body.name.trim(),
        is_active: body.is_active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ brandId: data.id }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (err: any) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
