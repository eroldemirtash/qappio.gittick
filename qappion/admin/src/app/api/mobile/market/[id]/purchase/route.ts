import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return withCors(NextResponse.json({ error: 'missing_id' }, { status: 400 }));

    const rpc = await sbAdmin().rpc('decrement_product_stock', { p_id: id }).single();
    if (rpc.error) {
      return withCors(NextResponse.json({ error: rpc.error.message }, { status: 400 }));
    }
    const updated = rpc.data as any;
    return withCors(NextResponse.json({ ok: true, stock: updated?.stock ?? null }));
  } catch (e: any) {
    return withCors(NextResponse.json({ error: e?.message || 'purchase_failed' }, { status: 500 }));
  }
}



