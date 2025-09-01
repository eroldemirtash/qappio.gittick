import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET() {
  try {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ 
        items: [],
        error: "Supabase configuration missing - using placeholder data"
      }), { 
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const { data, error } = await s
      .from("missions")
      .select(`
        id, title, description, brand_id, cover_url, reward_qp, published, 
        is_qappio_of_week, starts_at, ends_at, created_at,
        brand:brands (
          id, name,
          brand_profiles (avatar_url)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ 
        items: [],
        error: error.message 
      }), { 
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    return new Response(JSON.stringify({ items: data || [] }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      items: [],
      error: error.message || "Unknown error"
    }), { 
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}

export async function POST(request: NextRequest) {
  const s = sbAdmin();
  const body = await request.json();
  const { title, description, brand_id, cover_url, reward_qp, published, is_qappio_of_week, starts_at, ends_at } = body;

  if (!title) {
    return new Response(JSON.stringify({ error: "Title is required" }), { 
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  try {
    const { data: mission, error } = await s
      .from("missions")
      .insert({
        title,
        description,
        brand_id,
        cover_url,
        reward_qp,
        published: published || false,
        is_qappio_of_week: is_qappio_of_week || false,
        starts_at,
        ends_at
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, mission }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}