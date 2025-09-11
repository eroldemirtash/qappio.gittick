import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const url = new URL(request.url);
    const brandId = url.searchParams.get('brand_id');
    if (!brandId) {
      return new Response(JSON.stringify({ item: null }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      });
    }

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      return new Response(JSON.stringify({ item: null }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      });
    }

    const s = sbAdmin();
    const { data, error } = await s
      .from('brand_profiles')
      .select('*')
      .eq('brand_id', brandId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ item: data || null }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      // Return demo data when Supabase is not configured
      return new Response(JSON.stringify({ 
        item: {
          id: "demo-profile",
          brand_id: body.brand_id,
          display_name: body.display_name,
          email: body.email,
          phone: body.phone,
          website: body.website,
          category: body.category,
          license_plan: body.license_plan,
          license_start: body.license_start,
          license_end: body.license_end,
          license_fee: body.license_fee,
          features: body.features,
          founded_year: body.founded_year,
          address: body.address,
          description: body.description,
          social_instagram: body.social_instagram,
          social_twitter: body.social_twitter,
          social_facebook: body.social_facebook,
          social_linkedin: body.social_linkedin,
          logo_url: body.logo_url,
          cover_url: body.cover_url
        }
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    try {
      const s = sbAdmin();
      
      // Upsert brand profile
      const upsert = {
        brand_id: body.brand_id,
        display_name: body.display_name,
        email: body.email,
        phone: body.phone,
        website: body.website,
        category: body.category,
        license_plan: body.license_plan,
        license_start: body.license_start,
        license_end: body.license_end,
        license_fee: body.license_fee,
        features: body.features,
        founded_year: body.founded_year,
        address: body.address,
        description: body.description,
        social_instagram: body.social_instagram,
        social_twitter: body.social_twitter,
        social_facebook: body.social_facebook,
        social_linkedin: body.social_linkedin,
        logo_url: body.logo_url,
        cover_url: body.cover_url
      };

      const { data, error } = await s
        .from("brand_profiles")
        .upsert(upsert)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Created brand profile in Supabase:', data);
      return new Response(JSON.stringify({ item: data }), {
        headers: { "content-type": "application/json" }
      });
    } catch (error: any) {
      // Fallback to mock data if table doesn't exist
      if (error.code === 'PGRST205') {
        console.log('📦 Using fallback mock data for brand profile creation');
        const mockProfile = {
          id: Date.now().toString(),
          brand_id: body.brand_id,
          display_name: body.display_name || 'Mock Brand',
          email: body.email || 'mock@example.com',
          phone: body.phone || '+90 555 000 0000',
          website: body.website || 'https://mock.com',
          category: body.category || 'Fashion',
          license_plan: body.license_plan || 'free',
          license_start: body.license_start || null,
          license_end: body.license_end || null,
          license_fee: body.license_fee || 0,
          features: body.features || null,
          founded_year: body.founded_year || null,
          address: body.address || null,
          description: body.description || null,
          social_instagram: body.social_instagram || null,
          social_twitter: body.social_twitter || null,
          social_facebook: body.social_facebook || null,
          social_linkedin: body.social_linkedin || null,
          logo_url: body.logo_url || 'https://via.placeholder.com/50',
          cover_url: body.cover_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('✅ Created mock brand profile:', mockProfile);
        return new Response(JSON.stringify({ item: mockProfile }), {
          headers: { "content-type": "application/json" }
        });
      }
      
      throw error;
    }

  } catch (error: any) {
    console.error('Brand profile creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
