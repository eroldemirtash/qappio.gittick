import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = sbAdmin();
  const body = await request.json();
  const { is_active } = body;

  try {
    const { error } = await s
      .from("brands")
      .update({ is_active })
      .eq("id", params.id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
