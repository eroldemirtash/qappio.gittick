import { NextRequest } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = sbAdmin();
    
    // Basit liste: ilişkileri sorgulama (schema farklarında 500 almamak için)
    const { data: missions, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Missions fetch error:', error);
      // UI kesilmesin diye boş liste döndür (geçici koruma)
      return new Response(
        JSON.stringify({ items: [], warning: error.message }),
        { headers: { "content-type": "application/json", "cache-control": "no-store" } }
      );
    }
    
    return new Response(JSON.stringify({ items: missions || [] }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = sbAdmin();
    
    // Otomatik tarih hesaplama (gerekli alanlarla sınırlı tut)
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Yeni görev oluştur - yalın alanlarla (schema uyumsuzluklarında 500 almamak için)
    const { data: newMission, error } = await supabase
      .from('missions')
      .insert({
        title: body.title,
        description: body.description,
        brand_id: body.brand_id,
        starts_at: body.starts_at ?? now.toISOString(),
        ends_at: body.ends_at ?? thirtyDaysLater.toISOString()
      })
      .select(`
        *,
        brand:brands(
          id,
          name,
          brand_profiles(avatar_url)
        )
      `)
      .single();
    
    if (error) {
      console.error('Mission creation error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ item: newMission }), {
      headers: { "content-type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}