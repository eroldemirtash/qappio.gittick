import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      return new Response(JSON.stringify({ 
        error: "Supabase yapılandırması eksik. Demo modda tek paylaşım görüntülenemez." 
      }), { 
        status: 400,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const { id } = await params;

    const { data, error } = await s
      .from("shares")
      .select(`
        id,
        user:profiles(id, full_name, username, avatar_url),
        brand:brands(id, name, brand_profiles(avatar_url)),
        mission:missions(id, title, cover_url),
        media_url,
        likes,
        created_at
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    console.error("Get share error:", error);
    return new Response(JSON.stringify({ 
      error: error?.message || "Paylaşım bulunamadı" 
    }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      return new Response(JSON.stringify({ 
        error: "Supabase yapılandırması eksik. Demo modda paylaşım silinemez." 
      }), { 
        status: 400,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const { id } = await params;

    const { error } = await s
      .from("shares")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    console.error("Delete share error:", error);
    return new Response(JSON.stringify({ 
      error: error?.message || "Paylaşım silinemedi" 
    }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
