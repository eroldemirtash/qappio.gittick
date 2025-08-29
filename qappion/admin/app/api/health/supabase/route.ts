import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/service";

export async function GET() {
  const { error } = await supabaseAdmin
    .from("brands")
    .select("*", { head: true, count: "exact" }); // sadece bağlantı test

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
