import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      // Return demo data when Supabase is not configured
      const demoShares = [
        {
          id: "1",
          user: {
            id: "user1",
            full_name: "Ahmet Yılmaz",
            username: "ahmetyilmaz",
            avatar_url: null
          },
          brand: {
            id: "brand1",
            name: "Nike",
            brand_profiles: {
              avatar_url: null
            }
          },
          mission: {
            id: "mission1",
            title: "Nike Air Max Fotoğraf Çekimi",
            cover_url: null
          },
          media_url: "https://picsum.photos/400/300?random=1",
          likes: 45,
          created_at: "2024-01-15T10:30:00Z"
        },
        {
          id: "2",
          user: {
            id: "user2",
            full_name: "Ayşe Demir",
            username: "aysedemir",
            avatar_url: null
          },
          brand: {
            id: "brand2",
            name: "Adidas",
            brand_profiles: {
              avatar_url: null
            }
          },
          mission: {
            id: "mission2",
            title: "Adidas Ultraboost Deneyimi",
            cover_url: null
          },
          media_url: "https://picsum.photos/400/300?random=2",
          likes: 32,
          created_at: "2024-01-14T15:45:00Z"
        },
        {
          id: "3",
          user: {
            id: "user3",
            full_name: "Mehmet Kaya",
            username: "mehmetkaya",
            avatar_url: null
          },
          brand: {
            id: "brand1",
            name: "Nike",
            brand_profiles: {
              avatar_url: null
            }
          },
          mission: {
            id: "mission3",
            title: "Nike React Infinity Run",
            cover_url: null
          },
          media_url: "https://picsum.photos/400/300?random=3",
          likes: 28,
          created_at: "2024-01-13T09:20:00Z"
        }
      ];

      return new Response(JSON.stringify({ items: demoShares }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brand_id');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const userQuery = searchParams.get('user_q');

    let query = s
      .from("shares")
      .select(`
        id,
        media_url,
        likes,
        created_at,
        user:profiles(id, full_name, username, avatar_url),
        brand:brands(id, name, brand_profiles(avatar_url)),
        mission:missions(id, title, cover_url)
      `)
      .order("created_at", { ascending: false });

    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    if (from) {
      query = query.gte("created_at", from);
    }

    if (to) {
      query = query.lte("created_at", to);
    }

    if (userQuery) {
      query = query.ilike("user.full_name", `%${userQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    return new Response(JSON.stringify({ items: data || [] }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || String(error) }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      return new Response(JSON.stringify({ success: true, message: "Demo mode: Share would be deleted" }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: "Share ID is required" }), { 
        status: 400,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const { error } = await s
      .from("shares")
      .delete()
      .eq("id", id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || String(error) }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
