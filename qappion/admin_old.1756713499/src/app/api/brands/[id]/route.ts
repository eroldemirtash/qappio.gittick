import { sbAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const s = sbAdmin();
    const body = await req.json().catch(() => ({}));
    const brandId = params.id;

    if (!brandId) {
      return new Response(JSON.stringify({ error: "Brand ID required" }), { status: 400 });
    }

    const patch: { is_active?: boolean } = {};
    if (typeof body.is_active === 'boolean') {
      patch.is_active = body.is_active;
    } else {
      return new Response(JSON.stringify({ error: "Invalid 'is_active' value" }), { status: 400 });
    }

    const { data, error } = await s.from("brands")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", brandId)
      .select("id,name,is_active,updated_at")
      .single();

    if (error) {
      console.error("Supabase update error:", error);
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
