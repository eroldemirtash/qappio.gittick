import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = sbAdmin();
  const body = await request.json();
  const { avatar_url, cover_url, description, website_url, instagram_url, twitter_url } = body;

  try {
    const { error } = await s
      .from("brand_profiles")
      .update({
        avatar_url,
        cover_url,
        description,
        website_url,
        instagram_url,
        twitter_url
      })
      .eq("brand_id", params.id);

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
