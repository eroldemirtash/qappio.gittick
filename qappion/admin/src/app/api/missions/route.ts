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
      .select('id,name,brand_profiles(*)');

    if (brandsError) {
      console.error('Brands fetch error:', brandsError);
    }

    // Missions'a brand ve sponsor bilgilerini ekleyelim
    const missionsWithBrands = missions?.map(mission => {
      const brand = brands?.find(b => b.id === mission.brand_id);
      // Test için manuel sponsor brand ekle
      const sponsorBrand = mission.id === 'b0ca6247-035c-41a6-aabb-c4a441c95278' ? brands?.find(b => b.name === 'Burger King') : null;
      
      // brand_profiles array'den ilk elemanı al
      const bp = Array.isArray(brand?.brand_profiles) ? brand.brand_profiles[0] : brand?.brand_profiles || {};
      const logo = bp?.logo_url ?? bp?.logo ?? bp?.avatar_url ?? bp?.image_url;
      
      return {
        ...mission,
        brand: brand ? {
          id: brand.id,
          name: brand.name,
          logo_url: logo,
          brand_profiles: null
        } : null,
        sponsor_brand: sponsorBrand ? {
          id: sponsorBrand.id,
          name: sponsorBrand.name,
          logo_url: (Array.isArray(sponsorBrand.brand_profiles) ? sponsorBrand.brand_profiles[0] : sponsorBrand.brand_profiles)?.logo_url ?? 
                   (Array.isArray(sponsorBrand.brand_profiles) ? sponsorBrand.brand_profiles[0] : sponsorBrand.brand_profiles)?.logo ?? 
                   (Array.isArray(sponsorBrand.brand_profiles) ? sponsorBrand.brand_profiles[0] : sponsorBrand.brand_profiles)?.avatar_url ?? 
                   (Array.isArray(sponsorBrand.brand_profiles) ? sponsorBrand.brand_profiles[0] : sponsorBrand.brand_profiles)?.image_url,
          brand_profiles: null
        } : null,
        // Frontend için ek alanlar
        brandName: brand?.name || 'Bilinmeyen Marka',
        brandLogo: logo || '',
        cover_url: mission.cover_url || null, // Gerçek cover_url alanını kullan
        cover_image: mission.cover_url || null,
        is_qappio_of_week: mission.is_qappio_of_week || false,
        published: mission.published || false,
        reward_qp: mission.reward_qp || 0,
        // Süre bilgileri
        starts_at: mission.starts_at,
        ends_at: mission.ends_at,
        deadline: mission.deadline
      };
    }) || [];
    
    console.log(`✅ Fetched ${missionsWithBrands.length} missions from Supabase`);
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
    
    try {
      // Yeni görev oluştur - tüm alanlarla
      const { data: newMission, error } = await supabase
        .from('missions')
        .insert({
          title: body.title,
          brief: body.description || body.brief || "Test görevi açıklaması",
          brand_id: body.brand_id || null,
          reward_qp: body.reward_qp || body.qp_reward || 0,
          published: body.published || body.is_published || false,
          cover_url: body.cover_url || null,
          is_qappio_of_week: body.is_qappio_of_week || false,
          is_sponsored: body.is_sponsored || false,
          sponsor_brand_id: body.sponsor_brand_id || null,
          starts_at: body.starts_at || now.toISOString(),
          ends_at: body.ends_at || thirtyDaysLater.toISOString(),
          deadline: body.deadline || thirtyDaysLater.toISOString()
        })
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Created mission in Supabase:', newMission);
      return new Response(JSON.stringify({ item: newMission }), {
        headers: { "content-type": "application/json" }
      });
    } catch (error: any) {
      // Fallback to mock data if table doesn't exist
      if (error.code === 'PGRST205') {
        console.log('📦 Using fallback mock data for mission creation');
        const mockMission = {
          id: Date.now().toString(),
          title: body.title,
          short_description: body.description,
          brand_id: body.brand_id,
          starts_at: body.starts_at ?? now.toISOString(),
          ends_at: body.ends_at ?? thirtyDaysLater.toISOString(),
          qp_reward: (body.reward_qp ?? body.qp_reward ?? 0),
          is_published: (body.published ?? body.is_published ?? false),
          // cover_url: body.cover_url || null,
          is_qappio_of_week: body.is_qappio_of_week || false,
          is_sponsored: body.is_sponsored || false,
          sponsor_brand_id: body.sponsor_brand_id || null,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          brand: {
            id: body.brand_id,
            name: 'Mock Brand',
            brand_profiles: {
              logo_url: 'https://via.placeholder.com/50',
              display_name: 'Mock Brand',
              category: 'Fashion'
            }
          },
          sponsor_brand: null
        };
        
        console.log('✅ Created mock mission:', mockMission);
        return new Response(JSON.stringify({ item: mockMission }), {
          headers: { "content-type": "application/json" }
        });
      }
      
      console.error('Mission creation error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}