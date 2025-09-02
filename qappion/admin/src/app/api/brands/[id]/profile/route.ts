import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      const body = await req.json();
      const resolvedParams = await params;
      return new Response(JSON.stringify({
        item: {
          brand_id: resolvedParams.id,
          display_name: body.display_name,
          category: body.category,
          description: body.description,
          email: body.email,
          phone: body.phone,
          avatar_url: body.avatar_url,
          cover_url: body.cover_url,
          website: body.website,
          social_instagram: body.social_instagram,
          social_twitter: body.social_twitter,
          social_facebook: body.social_facebook,
          social_linkedin: body.social_linkedin,
          license_plan: body.license_plan,
          license_start: body.license_start,
          license_end: body.license_end,
          license_fee: body.license_fee,
          features: body.features,
          address: body.address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    const s = sbAdmin();
    const body = await req.json();
    const resolvedParams = await params;
    
    const profileData = {
      brand_id: resolvedParams.id,
      display_name: body.display_name,
      category: body.category,
      description: body.description,
      email: body.email,
      phone: body.phone,
      avatar_url: body.avatar_url,
      cover_url: body.cover_url,
      website: body.website,
      social_instagram: body.social_instagram,
      social_twitter: body.social_twitter,
      social_facebook: body.social_facebook,
      social_linkedin: body.social_linkedin,
      license_plan: body.license_plan,
      license_start: body.license_start,
      license_end: body.license_end,
      license_fee: body.license_fee,
      features: body.features,
      address: body.address
    };

    const { data, error } = await s
      .from("brand_profiles")
      .upsert(profileData, { onConflict: 'brand_id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ item: data }), {
      headers: { "content-type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      const resolvedParams = await params;
      return new Response(JSON.stringify({
        item: {
          brand_id: resolvedParams.id,
          display_name: "Demo Brand",
          category: "teknoloji",
          description: "Demo brand description",
          email: "demo@example.com",
          phone: "+90 555 123 45 67",
          avatar_url: "https://via.placeholder.com/100x100/2da2ff/ffffff?text=DB",
          cover_url: "https://via.placeholder.com/400x200/2da2ff/ffffff?text=Demo+Brand",
          website: "https://demo.example.com",
          social_instagram: "https://instagram.com/demo",
          social_twitter: "https://twitter.com/demo",
          social_facebook: "https://facebook.com/demo",
          social_linkedin: "https://linkedin.com/company/demo",
          license_plan: "premium",
          license_start: new Date().toISOString(),
          license_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          license_fee: 1000,
          features: {
            task_creation: true,
            user_management: true,
            analytics: false,
            api_access: true,
            priority_support: false
          },
          address: "İstanbul, Türkiye"
        }
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    const s = sbAdmin();
    const resolvedParams = await params;
    const { data, error } = await s
      .from("brand_profiles")
      .select("*")
      .eq("brand_id", resolvedParams.id)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "content-type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ item: data }), {
      headers: { "content-type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}