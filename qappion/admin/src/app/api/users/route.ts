import { sbAdmin } from "@/lib/supabase-admin";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
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
      .from("profiles")
      .select(`
        id, 
        full_name, 
        username, 
        role, 
        avatar_url, 
        created_at,
        bio,
        email,
        phone,
        address,
        gender,
        socials,
        total_qp,
        spendable_qp,
        total_missions,
        completed_missions
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
