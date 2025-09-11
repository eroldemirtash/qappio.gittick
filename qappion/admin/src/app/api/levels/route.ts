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
          product_count: 45,
          mission_count: 12,
          avg_points: 45,
          badge_letter: "S",
          color: "#fbbf24"
        },
        {
          id: "2", 
          name: "Seeker",
          description: "Aktif kullanıcılar için orta seviye",
          min_points: 100,
          max_points: 499,
          user_count: 890,
          product_count: 78,
          mission_count: 25,
          avg_points: 285,
          badge_letter: "E",
          color: "#10b981"
        },
        {
          id: "3",
          name: "Crafter", 
          description: "Deneyimli kullanıcılar için ileri seviye",
          min_points: 500,
          max_points: 1499,
          user_count: 456,
          product_count: 92,
          mission_count: 38,
          avg_points: 875,
          badge_letter: "C",
          color: "#8b5cf6"
        },
        {
          id: "4",
          name: "Viralist",
          description: "Sosyal medya uzmanları için üst seviye",
          min_points: 1500,
          max_points: 4999,
          user_count: 234,
          product_count: 156,
          mission_count: 52,
          avg_points: 2850,
          badge_letter: "V",
          color: "#f59e0b"
        },
        {
          id: "5",
          name: "Qappian",
          description: "En üst seviye kullanıcılar için elit seviye",
          min_points: 5000,
          max_points: null,
          user_count: 67,
          product_count: 203,
          mission_count: 89,
          avg_points: 8750,
          badge_letter: "Q",
          color: "#06b6d4"
        },
        {
          id: "6",
          name: "Influencer",
          description: "Sosyal medya etkileyicileri için özel seviye",
          min_points: 10000,
          max_points: null,
          user_count: 23,
          product_count: 312,
          mission_count: 156,
          avg_points: 15600,
          badge_letter: "I",
          color: "#ec4899"
        },
        {
          id: "7",
          name: "Creator",
          description: "İçerik üreticileri için premium seviye",
          min_points: 20000,
          max_points: null,
          user_count: 12,
          product_count: 445,
          mission_count: 234,
          avg_points: 31200,
          badge_letter: "C",
          color: "#7c3aed"
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
      console.error("Supabase fetch error:", error);
      // Fallback to demo data if Supabase fails
      const demoLevels = [
        {
          id: "1",
          name: "Snapper",
          description: "Yeni başlayan kullanıcılar için temel seviye",
          min_points: 0,
          max_points: 99,
          user_count: 1250,
          product_count: 45,
          mission_count: 12,
          avg_points: 45,
          badge_letter: "S",
          color: "#fbbf24"
        },
        {
          id: "2", 
          name: "Seeker",
          description: "Aktif kullanıcılar için orta seviye",
          min_points: 100,
          max_points: 499,
          user_count: 890,
          product_count: 78,
          mission_count: 25,
          avg_points: 285,
          badge_letter: "E",
          color: "#10b981"
        },
        {
          id: "3",
          name: "Crafter", 
          description: "Deneyimli kullanıcılar için ileri seviye",
          min_points: 500,
          max_points: 1499,
          user_count: 456,
          product_count: 92,
          mission_count: 38,
          avg_points: 875,
          badge_letter: "C",
          color: "#8b5cf6"
        },
        {
          id: "4",
          name: "Viralist",
          description: "Sosyal medya uzmanları için üst seviye",
          min_points: 1500,
          max_points: 4999,
          user_count: 234,
          product_count: 156,
          mission_count: 52,
          avg_points: 2850,
          badge_letter: "V",
          color: "#f59e0b"
        },
        {
          id: "5",
          name: "Qappian",
          description: "En üst seviye kullanıcılar için elit seviye",
          min_points: 5000,
          max_points: null,
          user_count: 67,
          product_count: 203,
          mission_count: 89,
          avg_points: 8750,
          badge_letter: "Q",
          color: "#06b6d4"
        }
      ];

      return new Response(JSON.stringify({ items: demoLevels }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
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
      // Demo mode - return mock data
      const body = await request.json();
      const { name, description, min_points, max_points, badge_letter, color } = body;
      
      const newLevel = {
        id: Date.now().toString(),
        name,
        description,
        min_points,
        max_points,
        badge_letter,
        color,
        user_count: 0,
        product_count: 0,
        mission_count: 0,
        avg_points: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return new Response(JSON.stringify(newLevel), {
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
