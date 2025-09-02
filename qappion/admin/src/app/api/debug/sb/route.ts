import { sbAdmin } from "@/lib/supabase-admin";
export const runtime = "nodejs"; 
export const dynamic = "force-dynamic"; 
export const revalidate = 0;

export async function GET() {
  const url = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srk = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Supabase bağlantı denemesi
  try {
    const s = sbAdmin();
    const { data, error } = await s.from("brands").select("id").limit(1);
    if (error) throw error;
    return Response.json({ ok: true, env: { url, srk }, brands_sample: data });
  } catch (e: any) {
    console.error("SB TEST ERROR:", e?.message || e);
    return new Response(JSON.stringify({ ok: false, env: { url, srk }, error: e?.message || String(e) }), { status: 500 });
  }
}
