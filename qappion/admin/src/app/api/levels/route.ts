import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET() {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      // Return demo data when Supabase is not configured
      const demoLevels = [
        {
          id: "1",
          name: "Snapper",
          description: "Yeni başlayan kullanıcılar için temel seviye",
          min_points: 0,
          max_points: 99,
          user_count: 1250,
          badge_letter: "S",
          color: "bg-blue-500"
        },
        {
          id: "2", 
          name: "Seeker",
          description: "Aktif kullanıcılar için orta seviye",
          min_points: 100,
          max_points: 499,
          user_count: 890,
          badge_letter: "S",
          color: "bg-green-500"
        },
        {
          id: "3",
          name: "Crafter", 
          description: "Deneyimli kullanıcılar için ileri seviye",
          min_points: 500,
          max_points: 1499,
          user_count: 456,
          badge_letter: "C",
          color: "bg-purple-500"
        },
        {
          id: "4",
          name: "Viralist",
          description: "Sosyal medya uzmanları için üst seviye",
          min_points: 1500,
          max_points: 4999,
          user_count: 234,
          badge_letter: "V",
          color: "bg-orange-500"
        },
        {
          id: "5",
          name: "Qappian",
          description: "En üst seviye kullanıcılar için elit seviye",
          min_points: 5000,
          max_points: null,
          user_count: 67,
          badge_letter: "Q",
          color: "bg-gradient-to-r from-cyan-400 to-blue-600"
        }
      ];

      return new Response(JSON.stringify({ items: demoLevels }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    // Try to fetch from Supabase
    const s = sbAdmin();
    const { data, error } = await s
      .from("levels")
      .select("*")
      .order("min_points", { ascending: true });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ items: data || [] }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    console.error("Levels API error:", error);
    return new Response(JSON.stringify({ 
      error: error?.message || "Levels verileri alınamadı",
      items: []
    }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      return new Response(JSON.stringify({ 
        error: "Supabase yapılandırması eksik. Demo modda yeni seviye oluşturulamaz." 
      }), { 
        status: 400,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const body = await request.json();
    const { name, description, min_points, max_points, badge_letter, color } = body;

    const { data, error } = await s
      .from("levels")
      .insert({
        name,
        description,
        min_points,
        max_points,
        badge_letter,
        color
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    console.error("Create level error:", error);
    return new Response(JSON.stringify({ 
      error: error?.message || "Seviye oluşturulamadı" 
    }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
