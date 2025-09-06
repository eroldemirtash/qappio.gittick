import { NextRequest } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = sbAdmin();
    
    // Missions ve brands bilgilerini ayrı ayrı çekelim
    const { data: missions, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Missions fetch error:', error);
      return new Response(
        JSON.stringify({ items: [], warning: error.message }),
        { headers: { "content-type": "application/json", "cache-control": "no-store" } }
      );
    }

    // Brands bilgilerini çekelim
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select(`
        id,
        name,
        brand_profiles!left (
          logo_url,
          display_name,
          category
        )
      `);

    if (brandsError) {
      console.error('Brands fetch error:', brandsError);
    }

    // Missions'a brand ve sponsor bilgilerini ekleyelim
    const missionsWithBrands = missions?.map(mission => {
      const brand = brands?.find(b => b.id === mission.brand_id);
      const sponsorBrand = mission.sponsor_brand_id ? brands?.find(b => b.id === mission.sponsor_brand_id) : null;
      
      return {
        ...mission,
        brand: brand || null,
        sponsor_brand: sponsorBrand || null
      };
    }) || [];
    
    return new Response(JSON.stringify({ items: missionsWithBrands }), {
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
        short_description: body.description,
        brand_id: body.brand_id,
        starts_at: body.starts_at ?? now.toISOString(),
        ends_at: body.ends_at ?? thirtyDaysLater.toISOString(),
        // accept both reward_qp (frontend) and qp_reward (api)
        qp_reward: (body.reward_qp ?? body.qp_reward ?? 0),
        // accept both published and is_published
        is_published: (body.published ?? body.is_published ?? false),
        // cover_url alanını ekle
        cover_url: body.cover_url || null,
        // is_qappio_of_week alanını ekle
        is_qappio_of_week: body.is_qappio_of_week || false,
        // sponsor bilgilerini ekle
        is_sponsored: body.is_sponsored || false,
        sponsor_brand_id: body.sponsor_brand_id || null
      })
      .select('*')
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